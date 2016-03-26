angular.module('app.controllers', ['uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDDL_ZBMhIN_S08gFKh59zd0yY3cdVWgFo',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})

.controller('mapaCtrl', function($scope, $ionicPlatform, $localStorage, uiGmapGoogleMapApi) {
	var position = $localStorage.getObject('position');
	$scope.map = {
		center: {
			latitude: position.lat,
			longitude: position.lng
		},
		zoom: 17
	};

	$ionicPlatform.ready(function() {
		uiGmapGoogleMapApi.then(function(maps) {

	    });
	});
})
   
.controller('agenciasCtrl', function($scope) {

})
    