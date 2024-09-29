'use strict';
(function () {

  var app = angular.module('app', ['ngRoute', 'ngMaterial']);
  app.config(function ($routeProvider, $locationProvider, $mdGestureProvider) {

    $mdGestureProvider.skipClickHijack();


    $routeProvider
      .when("/", {
        title: 'Web3 Market Place | InsightX',
        templateUrl: "src/views/home.html"
      });

    if (window.history && window.history.pushState) {
      $locationProvider.html5Mode(true);
    }

  });

  app.run(['$rootScope', '$mdMedia', function ($rootScope, $mdMedia) {

    $rootScope.isMobile = $mdMedia('xs') || $mdMedia('sm');
  }]);

})(); 
