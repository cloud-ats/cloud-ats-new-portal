'use strict';

define([
  'angular',
  'angular-couch-potato',
  'angular-ui-router',
  'angular-material',
  'angular-loading-bar',
  'perfect-scrollbar',
  'perfect-scrollbar-jquery'
], function (ng, couchPotato) {
  var app = ng.module('app', [
    'scs.couch-potato',
    'ngAnimate',
    'ngMaterial',
    'ngMessages',
    'ui.router',
    'angular-loading-bar',

    'app.layout',
    //'app.dashboard',
    'app.projects',
    'app.project',
    'app.project.keyword',
    'app.project.keyword.reports',
    // 'app.project.performance',
    'app.auth'
  ]);

  couchPotato.configureApp(app);

  app.config(['$mdThemingProvider', '$mdIconProvider', 'cfpLoadingBarProvider', 
    function ($mdThemingProvider, $mdIconProvider, cfpLoadingBarProvider) {
    
    cfpLoadingBarProvider.includeSpinner = false;

    $mdThemingProvider.definePalette('cloudats-palette', {
      '50': '#EBF1FA',
      '100': '#C2D4EF',
      '200': '#9AB8E5',
      '300': '#78A0DC',
      '400': '#5688D3',
      '500': '#3470CA',
      '600': '#2E62B1',
      '700': '#275498',
      '800': '#21467E',
      '900': '#1A3865',
      'A100': '#C2D4EF',
      'A200': '#9AB8E5',
      'A400': '#5688D3',
      'A700': '#275498'
    });

    $mdThemingProvider.theme('default')
      .primaryPalette('cloudats-palette', {
        'default': '700',
        'hue-1': '500',
        'hue-2': '600',
        'hue-3': '400'
      })
      .accentPalette('light-blue', {
        'default': '600',
        'hue-1': '400',
        'hue-2': '700',
        'hue-3': 'A100'
      })
      .warnPalette('red', {
        'default': '500',
        'hue-1': '300',
        'hue-2': '800',
        'hue-3': 'A100'
      })
      .backgroundPalette('grey', {
        'default': 'A100',
        'hue-1': '100',
        'hue-2': '50',
        'hue-3': '300'
      });

    // $mdIconProvider.defaultIconSet('styles/img/mdi.svg');
  }]);

  app.run(['$couchPotato', '$rootScope', '$state', '$stateParams',
    function($couchPotato, $rootScope, $state, $stateParams) {
      app.lazy = $couchPotato;
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      window.Ps = require('perfect-scrollbar');
      require('perfect-scrollbar-jquery');
    }]);

  return app;
})