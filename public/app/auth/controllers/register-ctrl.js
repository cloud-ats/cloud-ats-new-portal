define(['auth/module'], function(module) {
  'use strict';

  return module.registerController('RegisterCtrl', ['$scope', '$cookies', '$state', '$window', '$rootScope' , 'AuthenticationService', RegisterCtrl]);

  function RegisterCtrl($scope, $cookies, $state, $window, $rootScope, AuthenticationService) {

		AuthenticationService.getTenants(function(data){
			$scope.tenants = data;
      if (data.length > 0) {
        $scope.checkTenant = true;
      } else {
        $scope.checkTenant = false;
      }
		});
    $scope.getListSpace = function(tenantId){
      AuthenticationService.getSpaces(tenantId, function(resp){
        $scope.spaces = resp;
      });
    };
    
    $scope.submit = function() {
      var expires = new Date();
      expires.setDate(expires.getDate() + 365);
      var tenant = {};
      tenant._id = $scope.form.tenant._id;
      if ($scope.checkEmail == false) {
        AuthenticationService.register($scope.form.email, $scope.form.password, 
           $scope.form.firstname, $scope.form.lastname, JSON.parse($scope.form.tenant)._id
           , function(data) {
          if (data.error) {
            $scope.checkEmail = true;
            $('form').find('fieldset section').first().find('.input').addClass("state-error");
            $('form').find('fieldset section').first().find('.input').removeClass("state-success");
          } else {
              $window.sessionStorage.removeItem('context');

              $cookies.put('authToken', data.authToken, {
                expires: expires
              });
            	AuthenticationService.context().then(function(context) {
                $window.sessionStorage.setItem('context', JSON.stringify(context));
                $rootScope.context = context;
                $state.go('app.dashboard');
              });
            }
        });
      }
    }
  }
});