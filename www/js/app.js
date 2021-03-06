// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'ngCordova', 'app.constants', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

.run(function($ionicPlatform, $rootScope, $localStorage, $cordovaGeolocation, database, agenciaStore, defaultDistance) {
  $rootScope.agencias = [];

  $rootScope.$on('agencia:loaded', function(event, agencias) {
    $rootScope.agencias = agencias;
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    // saves user geolocation
    $cordovaGeolocation.getCurrentPosition({
      timeout: 5000,
      enableHighAccuracy: false
    }).then(function(position) {
      var pos = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      $localStorage.setObject('position', pos);

      // load data
      agenciaStore.load(pos, defaultDistance).then(function(agencias) {
        $rootScope.agencias = agencias;
      });
    });

    // data sync
    database.local.sync(database.remote, {live: true, retry: true});
  });
})
