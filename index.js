var width = 800;
var height = 600;

var goods = [
	"美味しい","おいしい","満足","まんぞく","おすすめ","オススメ",
	"いっぱい","美味","優しい","やさしい","良い","いい","よい","暖かい","あたたかい",
  "絶品","やわらか","ふわふわ","フワフワ","たっぷり","安","うまい","うまさ","滑らか","なめらか","気さく",
  "新鮮","ハイレベル","刺激","さすが","嬉しい","うれしい","バランス","素晴","優れ","素敵","感謝","柔","すごか",
  "食欲","あっさり","ビックリ","びっくり","最高","濃","衝撃","甘","きれい","なつかしい","激辛"
];
var bads = [
	"まずい","悪い","わるい","高"
];

var rests_data;
var feature_of_rests;

var color = d3.scale.category10();
var scale = d3.scale.linear()
  .domain([1, 150])
  .range([6, 50]);

var levels = [1, 2, 3, 3.5, 4];
var quantizeRed = [
	"rgb(254,229,217)",
	"rgb(252,174,145)",
	"rgb(251,106,74)",
	"rgb(222,45,38)",
	"rgb(165,15,21)"
];
var colorRed = d3.scale.linear()
	.domain(levels)
	.range(quantizeRed);

var tooltip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

queue()
  .defer(d3.json, "rests_hongo.json")
  .await(initialize);

var svg, map;

function initialize(error, rests) {
	rests_data = rests;
	extract_feature();
  var mapCanvas = document.getElementById('map-canvas');
  var mapOptions = {
    center: new google.maps.LatLng(35.712850, 139.757827),
    zoom: 16,
    minZoom: 16,
    maxZoom: 20,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  map = new google.maps.Map(mapCanvas, mapOptions);
  var overlay = new google.maps.OverlayView();
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "layer");
    svg = layer.append("svg").append("g");
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
        .attr("r", function(d) {
        	if (d.votes == null || d.votes.length == 0) return 5;
        	return scale(d.votes.length);
        })
        .attr("opacity", 0.5)
        .attr("fill", function (d) {
        	if (d.votes == null || d.votes.length == 0) return "green";
        	var ave = 0;
        	for (var i = 0; i < d.votes.length; i++) {
        		ave += Number(d.votes[i].score);
        	};
        	ave /= d.votes.length;
        	return colorRed(ave);
        })
        .attr("cx", function(d) {return googleMapProjection([d.location.latitude_wgs84, d.location.longitude_wgs84])[0];})
        .attr("cy", function(d) {return googleMapProjection([d.location.latitude_wgs84, d.location.longitude_wgs84])[1];})
        .on("mouseover", function (d, i) {
        	tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);

					tooltip.html("<b>" + d.name.name + "<b><br/>" + d.contacts.address + "<br/>" + d.contacts.tel)
						.style("left", (d3.event.pageX + 20) + "px")
						.style("top", (d3.event.pageY + 20) + "px");
        })
        .on("click", function (d, i) {
					display(i);
        })
        .on("mouseout", function (d) {
        	tooltip.transition()
            .duration(500)		
            .style("opacity", 0);
				});
    };
  };
  overlay.setMap(map);
}

function GnaviAPI() {
  this.keyid = "add0591d19cd0bbeabc34cb80cd0d06e";
}

GnaviAPI.prototype.restSearchWithLocationAndRange = function (location, range) {
  var options = {
    keyid: this.keyid,
    format: "json",
    hit_per_page: 500,
    offset_page: 1,
    latitude: location.latitude,
    longitude: location.longitude,
    range: range,
  };
  var rests = [];
  $.get("http://api.gnavi.co.jp/ver2/RestSearchAPI/", options, function (res) {
    console.log(res);
  });
};

function convert (word) {
	if (word == "おいしい" || word == "美味") return "美味しい";
	if (word == "よい" || word == "いい") return "良い";
  if (word == "安") return "安い";
  if (word == "高") return "高い";
  if (word == "うまさ") return "うまい";
  if (word == "なめらか") return "滑らか";
  if (word == "優れ") return "優れる";
  if (word == "素晴") return "素晴らしい";
  if (word == "柔" || word == "やわらか") return "柔らかい";
  if (word == "すごか") return "すごい";
  if (word == "フワフワ") return "ふわふわ";
  if (word == "ビックリ") return "びっくり";
  if (word == "濃") return "濃い";
  if (word == "うれしい") return "嬉しい";
	return word;
}

function extract_feature () {
	feature_of_rests = new Array(rests_data.length);
	for (var i = 0; i < rests_data.length; i++) {
		extract(rests_data[i], i);
	};
}

function extract (d, ind) {
	var word = [];
	if (d.votes != null && d.votes.length != 0) {
	  var segmenter = new TinySegmenter();
	  var hash_goods = {};
	  var hash_bads = {};
	  for (var i = 0; i < d.votes.length; i++) {
	   	var segs = segmenter.segment(d.votes[i].comment);
	   	for (var j = 0; j < segs.length; j++) {
	   		for (var k = 0; k < goods.length; k++) {
	   			if (segs[j].indexOf(goods[k]) != -1) {
	   				if (goods[k] in hash_goods) hash_goods[convert(goods[k])]++;
	   				else hash_goods[convert(goods[k])] = 1;
	   			}
	   		};
	   		for (var k = 0; k < bads.length; k++) {
	   			if (segs[j].indexOf(bads[k]) != -1) {
	   				if (bads[k] in hash_bads) hash_bads[convert(bads[k])]++;
	   				else hash_bads[convert(bads[k])] = 1;
	   			}
	   		};
	   	};
	  };
	  for (var x in hash_goods) {
	  	word.push({"text": x, "size": 20 + 10 * hash_goods[x]});
	  }
	  for (var x in hash_bads) {
	  	word.push({"text": x, "size": 20 + 10 * hash_bads[x]});
	  }
  }
  
	for (var i = 0; i < d.categories.category_name_s.length; i++) {
		if (typeof d.categories.category_name_s[i] == 'string') {
			var list_word = d.categories.category_name_s[i].split(/[ \(,・\)]+/);
			for (var j = 0; j < list_word.length; j++) {
				if (list_word[j] == "その他") continue;
				word.push({"text": list_word[j], "size": 20});
			};
		}
	};
	feature_of_rests[ind] = word;
}

function display(i) {
	d3.layout.cloud().size([545, 200])
    .words(feature_of_rests[i])
    .rotate(0)
    .fontSize(function(d) { return d.size; })
    .on("end", feature)
    .start();

	function feature(words) {
		d3.select(".wordcloud").remove();
    d3.select("body").append("svg")
      .attr("width", 545)
      .attr("height", 200)
      .attr("class", "wordcloud")
      .append("g")
      .attr("transform", "translate(200,100)")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("fill", function(d, i) { return color(i); })
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; })
      .on("click", function (word) {
      	filter_word(word.text);
      })
      .on("dblclick", function (d) {
      	reset();
      });
  }
}

function is_contain (ind, word) {
	for (var i = 0; i < feature_of_rests[ind].length; i++) {
		if (feature_of_rests[ind][i].text == word) return true;
	};
	return false;
}

function filter_word (word) {
	svg.selectAll("circle")
    .style("visibility", function (d, i) {
    	if (is_contain(i, word)) return "visible";
    	return "hidden";
    });
}

function reset () {
	svg.selectAll("circle")
    .style("visibility", "visible");	
}
