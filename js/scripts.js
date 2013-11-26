var storeName = "Starbucks";

var placeResults;
var service;
var targetLocation;


var img_srcs = [
    'images/header.png',
    'images/footer.png'
];
var imgs_to_load = img_srcs.length

window.onload = function(){
	window.setTimeout(function() {window.scrollTo(0,1);}, 100);

	function itemLoaded(e) {
		imgs_to_load--;
		if(imgs_to_load == 0) {
			/* When all the images have finished, 
				continue displaying the ad. */
			window.setTimeout(start,1000);
		}
	}
	
	for(var i = 0; i < img_srcs.length; i++) {
		var img = document.createElement('img');
		img.src = img_srcs[i];
		img.style.display = 'none';
		img.addEventListener('load',itemLoaded,false);
		document.body.appendChild(img);
	}
}
function start() {
	AdController();
}
// Root method that sets up the ad interaction
function AdController() {
	var me = null;
	var custom = false;
//	var kansas = new google.maps.LatLng(37.4419, -100.1419);
    var nyu = new google.maps.LatLng(40.729371, -73.995906);

    targetLocation = nyu;

//	if (google.loader.ClientLocation) {
//		nyu = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
//	}
//	var mapOptions = {
//        zoom: 13,
//        center: nyu,
//        mapTypeId: google.maps.MapTypeId.ROADMAP,
//        mapTypeControl: false
//    };
//	var myMap = new google.maps.Map(document.getElementById("map"),mapOptions);
	var myMap = new google.maps.Map(document.getElementById("map"),{
        center: nyu,
        zoom: 15
    });

    service = new google.maps.places.PlacesService(myMap);

    var myloc = new google.maps.Marker({
		clickable: false,
		icon: new google.maps.MarkerImage('http://maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
														new google.maps.Size(22,22),
														new google.maps.Point(0,18),
														new google.maps.Point(11,11)),
		shadow: null,
		zIndex: 999,
		map: myMap// your google.maps.Map object
	});
	
	rad = function(x) {return x*Math.PI/180;}

	distHaversine = function(p1, p2) {
	  var R = 3963.1676; // earth's mean radius in miles
	  var dLat  = rad(p2.lat() - p1.lat());
	  var dLong = rad(p2.lng() - p1.lng());

	  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			  Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	  var d = R * c;

	  return d.toFixed(3);
	}
	
	var locateLink = document.getElementById("LocateMe");
	var customLink = document.getElementById("CustomLink");
	var overlay = document.getElementById("MapOverlay");
	var spinner = overlay.getElementsByClassName("loading-spinner")[0];
	var searchForm = document.getElementById("MapSearch");
	var customLocationFields = document.getElementById("CustomLocation");
	var customLocation = document.getElementById("CustomLocationString");
	var infoBox = document.getElementById("MapInfo");
	var callButton = document.getElementById("CallButton");
	var dirButton = document.getElementById("DirButton");
	var loaderSpin = document.getElementById("loading");
	var activeInfoWindow;
	var activeMarkers;
	var searching = false;
	
	function getCurrentLocation() {
		loaderSpin.style.display = "block";
		if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function(pos) {
			me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
			myloc.setPosition(me);
		});
		if (navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(getCurrentLocationSuccess, getCurrentLocationError);
		} else {
		    geoLocateError({"code":-1});
		}
		
	}
	
	function getCurrentLocationSuccess(position) {
		loaderSpin.style.display = "none";
		var coords = position.coords || position.coordinate || position;
		var newCenter = new google.maps.LatLng(coords.latitude, coords.longitude);
		myMap.setZoom(13);
		myMap.setCenter(newCenter);
		findResults();
	}
	
	function getCurrentLocationError(err) {
		var msg;
		switch(err.code) {
			case err.UNKNOWN_ERROR:
				msg = "Unable to find your location";
				break;
			case err.PERMISSION_DENINED:
				msg = "Permissioned denied in finding your location";
				break;
			case err.POSITION_UNAVAILABLE:
				msg = "Your location is currently unknown";
				break;
			case err.BREAK:
				msg = "Attempt to find location took too long";
				break;
			default:
				msg = "Location detection not supported";
		}
		alert(msg);
		locateLink.className = locateLink.className.replace(" clicked");
	}
	
	function findResults() {

        var request = {
            location: new google.maps.LatLng(myMap.getCenter().lat(),myMap.getCenter().lng()),
            radius: '500',
            keyword: storeName
        };
        service.nearbySearch(request, callBack);
	}

    function callBack(results, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            placeResults = results
            searchComplete()
            }
        }
	
	function markerClick(e) {
		var index = activeMarkers.indexOf(this);
		myMap.panTo(this.position);
		showResult(placeResults[index]);
	}
	
	function searchComplete() {
        var results = placeResults
		
		overlay.style.opacity = "0";
		setTimeout(function() { overlay.style.display = "none"; },400);
		
		// clear existing markers
        if(activeInfoWindow) activeInfoWindow.close();
        if(typeof activeMarkers == "object") {
            for(var i=0; i<activeMarkers.length; i++) {
               activeMarkers[i].setMap(null);
            }
        }

        if(results.length) {
            var bounds = new google.maps.LatLngBounds();
            activeMarkers = new Array();
            // add new markers
            for(var i=0;i<results.length;i++) {
                var marker = new google.maps.Marker({
//                    position: new google.maps.LatLng(results[i].lat,results[i].lng),
                    position: new google.maps.LatLng(results[i].geometry.location.lat(),results[i].geometry.location.lng()),
                    map: myMap,
                    icon: 'images/pin.png'
                });
                bounds.extend(marker.getPosition());
                google.maps.event.addListener(marker, "click", markerClick);
                activeMarkers[i] = marker;
            }
            // move map
            myMap.fitBounds(bounds);
            // adjust zoom to a reasonable level
            if(myMap.getZoom() > 16) myMap.setZoom(16);   
        }
	}
	
	function showResult(result) {
		myMap.panBy(0,6);
		var retailPosition = new google.maps.LatLng(result.geometry.location.lat(),result.geometry.location.lng());
		infoBox.getElementsByClassName("title")[0].innerHTML = result.name;
//		if(result.phoneNumbers.length > 0) {
//			callButton.href = "tel://" + result.phoneNumbers[0].number.match(/\d/g).join("");
//			callButton.style.display = "inline-block";
//		} else {
			callButton.style.display = "none";
//		}
		dirButton.href = result.ddUrl;
		if(custom == false){
			infoBox.getElementsByClassName("distance")[0].innerHTML = distHaversine(me,retailPosition) + " miles away";
		}
		infoBox.getElementsByClassName("address")[0].innerHTML = result.vicinity;
		infoBox.style.display = "block";
	}
	
	function toggleCustomLocation() {
	custom = true;
		if(customLocationFields.style.display == "none") {
			customLink.className += " clicked";
			customLocationFields.style.display = "block";
			searchForm.style.height = (searchForm.clientHeight + 19).toString() + "px";
		} else {
			customLink.className = customLink.className.replace(/ clicked/g,"");
			customLocationFields.style.display = "none";
			searchForm.style.height = (searchForm.clientHeight - 59).toString() + "px";
		}
	}
	
	function handleGeocoderResponse(results, status) {
		if(status == "OK") {
			myMap.fitBounds(results[0].geometry.viewport);
			findResults();
		} else {
			alert("Could not find location: "+status);
		}
	}
	
	function customLocateSubmit(e) {
		e.preventDefault();
		if(customLocation.value.length < 1) {
			customLocation.blur();
		} else if(!searching) {
			(new google.maps.Geocoder()).geocode({
				"address":customLocation.value
			},handleGeocoderResponse);
		}
	}

	function activeStyle(e) {
		this.className += " clicked";
	}
	function inactiveStyle(e) {
		this.className = this.className.replace(" clicked","");
	}
	
	searchForm.addEventListener("submit",customLocateSubmit,false);
	
	locateLink.addEventListener("click",function(e) {
		e.preventDefault();
		getCurrentLocation();
	},false);
	
	customLink.addEventListener("click",function(e) {				
		toggleCustomLocation();
	});
	customLink.removeEventListener("touchcancel",inactiveStyle,false);
	customLink.removeEventListener("touchend",inactiveStyle,false);
	
	customLocationFields.style.display = "none";
}