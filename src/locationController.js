angular.module('locationApp', []).controller('LocationController', function ($scope, $http) {

	var geocoder = new google.maps.Geocoder();
	
	var mapOptions = {
		zoom: 9,
		center: new google.maps.LatLng(44.28964868, -72.73223876)
	}
	$scope.markers = [];
	$scope.start;
	$scope.end;
	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	$scope.distance;
	$scope.duration;
	$scope.storeName;
	
	var abreviatedDays = {};
	abreviatedDays["Monday"] = "Mon";
	abreviatedDays["Tuesday"] = "Tue";
	abreviatedDays["Wednesday"] = "Wed";
	abreviatedDays["Thursday"] = "Thur";
	abreviatedDays["Friday"] = "Fri";
	abreviatedDays["Saturday"] = "Sat";
	abreviatedDays["Sunday"] = "Sun";
	 
	var responsePromise = $http.get("api.php");
	var infoWindow = new google.maps.InfoWindow();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	
	google.maps.event.addListener($scope.map, 'click', function(event){
				console.log(event);
			});
	
	var createMarker = function (data){
	
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(data.lat, data.lng),
			title: data.name,
			delivery: data.delivery
		});
		
		marker.content = '<div id="infoWindowContent">'+
			'<div class="street">'+data.street+'</div>'+
			'<div class="delivery">Delivery on '+data.delivery+'</div>'+
			'</div>';
		
		google.maps.event.addListener(marker, 'click', function(){
			infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
			infoWindow.open($scope.map, marker);
		});
		
		$scope.markers.push(marker);
	
	}
	
	$scope.getShortDay = function(day){
		return abreviatedDays[day];
	}
	
	var handle_geolocation_query = function(position){  
		lat = parseInt(position.coords.latitude*10000,10)/10000;
		lon = parseInt(position.coords.longitude*10000,10)/10000;   
		$scope.start = new google.maps.LatLng(lat, lon);
	}
	
	$scope.markerSelected = function(){
		return $scope.storeName.length > 0;
	};
	
	$scope.displayRoute = function(selectedMarker) {
		$scope.end = selectedMarker.position;
		directionsDisplay.setDirections({routes: []});
		directionsDisplay.setMap($scope.map); 

		var request = {
			origin : $scope.start,
			destination : $scope.end,
			travelMode : google.maps.TravelMode.DRIVING
		};
		var directionsService = new google.maps.DirectionsService(); 
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				$scope.storeName = selectedMarker.title;
				$scope.distance = response.routes[0].legs[0].distance.text;
				$scope.duration = response.routes[0].legs[0].duration.text;
				directionsDisplay.setDirections(response);
				$scope.$apply();
			}
		});
	};
	
	navigator.geolocation.getCurrentPosition(handle_geolocation_query);
	
	$(window).resize(function() {
    	// (the 'map' here is the result of the created 'var map = ...' above)
    	var currCenter = $scope.map.getCenter();
    	google.maps.event.trigger($scope.map, "resize");
    	$scope.map.panTo(currCenter);
  	});
	
	responsePromise.success(function(data, status, headers, config) {
		for(i = 0; i < data.length; i++) {
			createMarker(data[i])
		}
	});
	
	$scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
	
});
