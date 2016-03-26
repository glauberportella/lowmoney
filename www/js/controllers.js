angular.module('app.controllers', ['uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDDL_ZBMhIN_S08gFKh59zd0yY3cdVWgFo',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})

.controller('mapaCtrl', function($scope, $ionicPlatform, $localStorage, uiGmapIsReady, agenciaStore) {
	var position = $localStorage.getObject('position');

	$scope.map = {
		center: {
			latitude: position.lat,
			longitude: position.lng
		},
		zoom: 17
	};

	$scope.voce = {
		latitude: position.lat,
		longitude: position.lng,
		options: {
			icon: '/img/icons/you.png'
		}
	};

	$ionicPlatform.ready(function() {
		$scope.agencias = agenciaStore.load(position);

		uiGmapIsReady.promise(1).then(function(instances) {
			/*instances.forEach(function(inst) {
	            var map = inst.map;
	            console.log(map);
	        });*/
		});
	});
})
   
.controller('agenciasCtrl', function($scope) {

})
    