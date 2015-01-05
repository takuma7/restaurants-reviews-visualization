var width = 800;
var height = 600;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
    .attr("width", width)
    .attr("height", height);

queue()
  .defer(d3.json, "rests_hongo.json")
  .defer(d3.json, "lib/tokyo.topojson")
  .await(ready);

var projection = d3.geo.mercator();
var path = d3.geo.path()
  .projection(projection);

function ready(error, rests, topo){
  if(error){
    console.log(error);
  }else{
    console.log("Data loaded");
    projection
      .scale(40000)
      .center([139.463191, 35.710325]);


    var geometries = topojson.feature(topo, topo.objects.tokyo).features;
    var counties = svg.append("g").selectAll(".ward").data(geometries);
    counties.enter().insert("path")
      .attr("class", "ward")
      .attr("d", path)
      .style("fill", "#FFF")
      .style("stroke", "#000");

    var rests_pts = svg.append("g").selectAll("circle").data(rests);
    rests_pts.enter().append("circle")
      .attr("r", "3px")
      .attr("cx", function(d){return projection([d.location.longitude, d.location.latitude])[0];})
      .attr("cy", function(d){return projection([d.location.longitude, d.location.latitude])[1];})
      .attr("fill", "red");
  }
}
