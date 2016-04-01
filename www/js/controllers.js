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

.controller('adicionarCtrl', function($scope, $localStorage, uiGmapGoogleMapApi, Geocoder, BancosBrasil) {

  var position = $localStorage.getObject('position');

  var empty = {
    endereco: '',
    latitude: null,
    longitude: null,
    banco: { id: null, nome: '' },
    agenciaId: '',
    nota2: true,
    nota5: true,
    nota10: false,
    nota20: false,
    nota50: false,
    nota100: false
  };

  $scope.bancos = BancosBrasil;
  $scope.agencia = angular.copy(empty);
  $scope.agencia.latitude = position.latitude;
  $scope.agencia.longitude = position.longitude;

  $scope.salvar = function(agencia) {
    console.log(agencia);
  };

  uiGmapGoogleMapApi.then(function(maps) {
    // user position
    var geocoder = new Geocoder();
    geocoder.geocode({ location: { lat: position.latitude, lng: position.longitude } })
      .then(function(result) {
        $scope.agencia.endereco = result[0].formatted_address;
      });
  });
});
