define(['layout/module'], function(module) {
  'use strict';

  module.registerDirective('listSpace', ['$state', '$rootScope', 'UserService',
    function($state, $rootScope, UserService) {
    return {
      restrict: 'AE',
      replace: true,
      link: function(scope, element) {
        UserService.spaces().then(function(spaces) {
          scope.spaces = spaces;
        });
        
        if ($rootScope.context !== undefined && $rootScope.context.space !== undefined) {
          scope.space = $rootScope.context.space.name;
        } else {
          scope.space = 'Public';
        }

        scope.select = function(space) {
          if (space === undefined) {
            scope.space = 'Public';
            UserService.go({_id : null});
          } else {
            scope.space = space.name;
            UserService.go(space);
          }
          $state.reload();
        }
      }
    }
  }]);
});