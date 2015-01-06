var width = 800;
var height = 600;

queue()
  .defer(d3.json, "rests_hongo.json")
  .await(initialize);

function initialize(error, rests) {
  // google.maps.event.addDomListener(window, 'load', initialize);
  
  var mapCanvas = document.getElementById('map-canvas');
  var mapOptions = {
    center: new google.maps.LatLng(35.712850, 139.757827),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  var map = new google.maps.Map(mapCanvas, mapOptions);
  
  // var infowindow = new google.maps.InfoWindow();
  // var marker;
  // for (var i = 0; i < rests.length; i++) {
  //   marker = new google.maps.Marker({
  //     position: new google.maps.LatLng(rests[i].location.latitude_wgs84, rests[i].location.longitude_wgs84),
  //     map: map
  //   });
  //   google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
  //   	console.log(rests[i].name.name);
  //     return function() {
  //       infowindow.setContent("<b>" + rests[i].name.name + "<b> <br>" +
  //         rests[i].contacts.address + "<br> Tel:" +
  //         rests[i].contacts.tel);
  //       infowindow.open(map, marker);
  //     }
  //   })(marker, i));
  // }

  var overlay = new google.maps.OverlayView();
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "layer");
    var svg = layer.append("svg").append("g");
    var overlayProjection = this.getProjection();
    var googleMapProjection = function(coordinates){
      var googleCoordinates = new google.maps.LatLng(coordinates[0], coordinates[1]);
      var pixelCoordinates = overlayProjection.fromLatLngToDivPixel(googleCoordinates);
      return [pixelCoordinates.x + 4000, pixelCoordinates.y + 4000];
    };

    path = d3.geo.path().projection(googleMapProjection);
    console.log(rests);
    svg.selectAll("circle")
      .data(rests)
      .enter().append("circle");

    overlay.draw = function () {
      //地図描く
      svg.selectAll("circle")
        .attr("r", function(d) {return 4 + Math.random() * 4;})
        .attr("opacity", 0.5)
        .attr("fill", "red")
        .attr("cx", function(d) {return googleMapProjection([d.location.latitude_wgs84, d.location.longitude_wgs84])[0];})
        .attr("cy", function(d) {return googleMapProjection([d.location.latitude_wgs84, d.location.longitude_wgs84])[1];})
        .on("mouseover", function (d) {
        	test(d);
        });
    };
  };
  overlay.setMap(map);
}

function test (d) {
	console.log(d.name.name);
	console.log(d.contacts.address);
	console.log(d.contacts.tel);
}

