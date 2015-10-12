angular.module('locationApp', []).controller('LocationController', function ($http) {

	var lc = this;
	
	var geocoder = new google.maps.Geocoder();
	
	var mapOptions = {
		zoom: 9,
		center: new google.maps.LatLng(44.28964868, -72.73223876)
	};
	
	lc.markers = [];
	
	lc.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	
	var abreviatedDays = {
		"Monday": "M",
		"Tuesday": "T",
		"Wednesday": "W",
		"Thursday": "Th",
		"Friday": "F",
		"Saturday": "Sa",
		"Sunday": "Su"
	};
	 
	var responsePromise = $http.get("api.php");
	var infoWindow = new google.maps.InfoWindow();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	google.maps.event.addListener(lc.map, 'click', function(event){
				console.log(event);
			});
	
	var createMarker = function (data){
	
		var marker = new google.maps.Marker({
			map: lc.map,
			position: new google.maps.LatLng(data.lat, data.lng),
			title: data.name,
			delivery: data.delivery
		});
		
		marker.content = '<h4>' + data.name + '</h4>' +
			'<div class="infoWindowContent">'+
			'<div class="street">'+data.street+'</div>'+
			'<div class="delivery">Delivery on '+data.delivery+'</div>'+
			'</div>';
		
		google.maps.event.addListener(marker, 'click', function(){
			infoWindow.setContent( marker.content);
			infoWindow.open(lc.map, marker);
		});
		
		lc.markers.push(marker);
	};
	
	lc.getShortDay = function(day){
		return abreviatedDays[day];
	};
	
	var handle_geolocation_query = function(position){  
		lat = parseInt(position.coords.latitude*10000,10)/10000;
		lon = parseInt(position.coords.longitude*10000,10)/10000;   
		lc.start = new google.maps.LatLng(lat, lon);
	};
	
	navigator.geolocation.getCurrentPosition(handle_geolocation_query);
	
	lc.markerSelected = function(){
		return lc.storeName.length > 0;
	};
	
	lc.displayRoute = function(selectedMarker) {
		
		lc.end = selectedMarker.position;
		
		directionsDisplay.setDirections({routes: []});
		
		directionsDisplay.setMap(lc.map); 

		var request = {
			origin : lc.start,
			destination : lc.end,
			travelMode : google.maps.TravelMode.DRIVING
		};
		
		var directionsService = new google.maps.DirectionsService(); 
		
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				lc.storeName = selectedMarker.title;
				lc.distance = response.routes[0].legs[0].distance.text;
				lc.duration = response.routes[0].legs[0].duration.text;
				directionsDisplay.setDirections(response);
				lc.$apply();
			}
		});
	};
	
	
	
	$(window).resize(function() {
    	// (the 'map' here is the result of the created 'var map = ...' above)
    	var currCenter = lc.map.getCenter();
    	google.maps.event.trigger(lc.map, "resize");
    	lc.map.panTo(currCenter);
  	});
	
	responsePromise.success(function(data, status, headers, config) {
		for(i = 0; i < data.length; i++) {
			createMarker(data[i]);
		}
	});
	
	lc.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    };
	
});
