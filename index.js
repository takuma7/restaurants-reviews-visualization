var width = 800;
var height = 600;

var request = new XMLHttpRequest();
request.open("GET", "rests_hongo.json", false);
request.send(null);
var rests = JSON.parse(request.responseText);
console.log(rests);

function initialize() {
  var mapCanvas = document.getElementById('map-canvas');
  var mapOptions = {
    center: new google.maps.LatLng(35.712850, 139.757827),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(mapCanvas, mapOptions);
  var infowindow = new google.maps.InfoWindow();
  var marker;
  for (var i = 0; i < rests.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(rests[i].location.latitude, rests[i].location.longitude),
      map: map
    });
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent("<b>" + rests[i].name.name + "<b> <br>" +
          rests[i].contacts.address + "<br> Tel:" +
          rests[i].contacts.tel);
        infowindow.open(map, marker);
      }
    })(marker, i));
  };
}
google.maps.event.addDomListener(window, 'load', initialize);


