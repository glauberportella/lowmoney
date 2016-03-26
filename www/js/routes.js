angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('tabsController.mapa', {
    url: '/mapa',
    views: {
      'tab1': {
        templateUrl: 'templates/mapa.html',
        controller: 'mapaCtrl'
      }
    }
  })

  .state('tabsController.agencias', {
    url: '/agencias',
    views: {
      'tab2': {
        templateUrl: 'templates/agencias.html',
        controller: 'agenciasCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/main',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  $urlRouterProvider.otherwise('/main/mapa')

});