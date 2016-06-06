define(['auth/module', 'lodash'], function(module, _) {
  "use strict";

  return module.registerDirective('authorization', ['$rootScope', function($rootScope){
    return {
      restrict: 'E',
      replace: false,
      link: function(scope, element, attributes) {
        var feature = attributes.feature;
        var action = attributes.action;
        var rootOnly = attributes.rootOnly;
        var perms = $rootScope.context.user.perms;
        var hasFeature = false;
        var hasAction = false;

        if (rootOnly) {
          if (perms.length == 1) {
            var perm = perms[0];
            if (perm === "*:*@fsoft:*") return;
            else $(element[0]).remove();
          }
        }
        
        for(var i = 0; i < perms.length; i++) {
          var foo = perms[i].split('@')[0];
          var bar = foo.split(':');
          var cf = bar[0];
          if ("*" === cf || feature === cf || feature === "*"){
            hasFeature = true;
            var ca = bar[1];
            if ("*" === ca || action === ca || action === "*") {
              hasAction = true;
              break;
            }
          } else {
            hasFeature = false;
          }
        }

        if (hasFeature && hasAction) {
          $(element[0]).show();
        } else {
          $(element[0]).hide();
        }
      }
    };
  }]);
});
