angular.module('app.controllers', ['uiGmapgoogle-maps'])

.config(function(uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyDDL_ZBMhIN_S08gFKh59zd0yY3cdVWgFo',
    v: '3.20', //defaults to latest 3.X anyhow
    libraries: 'weather,geometry,visualization'
  });
})

.controller('mapaCtrl', function($scope, $ionicPlatform, $localStorage, $state, $cordovaGeolocation, agenciaStore, defaultDistance, mapZoom) {
	var position = $localStorage.getObject('position');

  var mapClick = function(map, event, args) {
    var location = args[0].latLng;

    position.latitude = location.lat();
    position.longitude = location.lng();

    $scope.voce.latitude = position.latitude;
    $scope.voce.longitude = position.longitude;

    $scope.$apply(function() {
      $scope.map.center.latitude = position.latitude;
      $scope.map.center.longitude = position.longitude;
    });

    $localStorage.setObject('position', position);

    agenciaStore.load(position, defaultDistance);
  };

  var minhaLocalizacao = function() {
    $cordovaGeolocation.getCurrentPosition({
      timeout: 5000,
      enableHighAccuracy: false
    }).then(function(position) {
      var pos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      $scope.voce.latitude = pos.latitude;
      $scope.voce.longitude = pos.longitude;
      $scope.map.center.latitude = pos.latitude;
      $scope.map.center.longitude = pos.longitude;

      $localStorage.setObject('position', pos);
      // reload data
      agenciaStore.load(pos, defaultDistance);
    });
  };

	$scope.map = {
		center: {
			latitude: position.latitude,
			longitude: position.longitude
		},
		zoom: mapZoom,
    events: {
      click: mapClick
    }
	};

	$scope.voce = {
		latitude: position.latitude,
		longitude: position.longitude,
		options: {
			icon: '/img/icons/you.png'
		}
	};

	$scope.agencias = [];

  $scope.minhaLocalizacao = minhaLocalizacao;

 	$scope.$on('agencia:loaded', function(event, agencias) {
    $scope.agencias = agencias;
  });
})

.controller('agenciasCtrl', function($scope, defaultDistance, agenciaStore) {
  $scope.distancia = defaultDistance;
  $scope.agencias = [];
  $scope.$on('agencia:loaded', function(event, agencias) {
    $scope.agencias = agencias;
  });
})

.controller('adicionarCtrl', function($scope, $localStorage, $ionicLoading, $ionicPopup, $state, uiGmapGoogleMapApi, Geocoder, BancosBrasil, agenciaStore) {

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
    $ionicLoading.show({
      template: 'Adicionando...'
    });

    agenciaStore.put(agencia).then(function() {
      $ionicLoading.hide();
      $state.go('tabsController.mapa');
    }).catch(function(err) {
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Erro ao adicionar',
        template: err
      });
    });
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
