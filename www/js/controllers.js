angular.module('app.controllers', ['uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDDL_ZBMhIN_S08gFKh59zd0yY3cdVWgFo',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})

.controller('mapaCtrl', function($scope, $ionicPlatform, $localStorage, $state, uiGmapIsReady, agenciaStore) {
	var position = $localStorage.getObject('position');

	$scope.map = {
		center: {
			latitude: position.latitude,
			longitude: position.longitude
		},
		zoom: 17
	};

	$scope.voce = {
		latitude: position.latitude,
		longitude: position.longitude,
		options: {
			icon: '/img/icons/you.png'
		}
	};

	$scope.agencias = agenciaStore.data;

 	$ionicPlatform.ready(function() {
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

.controller('adicionarCtrl', function($scope, BancosBrasil) {
  $scope.bancos = BancosBrasil;
});
