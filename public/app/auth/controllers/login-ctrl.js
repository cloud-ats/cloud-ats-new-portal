define(['auth/module'], function (module) {
	'use strict';

	module.registerController('LoginCtrl', ['UserService', '$mdToast', '$cookies', '$scope', '$state', '$rootScope', '$window', 'AuthenticationService', 
    function (UserService, $mdToast, $cookies, $scope, $state, $rootScope, $window, AuthenticationService) {
		$scope.login = function () {
			var expires = new Date();
      expires.setDate(expires.getDate() + 365);

      var last = {
	      bottom: false,
	      top: true,
	      left: false,
	      right: true
    	};

		  $scope.toastPosition = angular.extend({},last);

		  var getToastPosition = function() {
		    sanitizePosition();
		    return Object.keys($scope.toastPosition)
		      .filter(function(pos) { return $scope.toastPosition[pos]; })
		      .join(' ');
		  };

		  function sanitizePosition() {
		    var current = $scope.toastPosition;
		    if ( current.bottom && last.top ) current.top = false;
		    if ( current.top && last.bottom ) current.bottom = false;
		    if ( current.right && last.left ) current.left = false;
		    if ( current.left && last.right ) current.right = false;
		    last = angular.extend({},current);
		  }

      if ($scope.form.email.trim() != '' && $scope.form.password.trim() != '') {
        AuthenticationService.login($scope.form.email, $scope.form.password, function(data) {
          if (data.error) {
            var pinTo = getToastPosition();
				    $mdToast.show({
			        template: '<md-toast class="login-toast md-red-700-bg">Username or password is incorrect</md-toast>',
			        position: pinTo,
			        hideDelay: 2000
				    });         
          } else {
            $cookies.put('authToken', data.authToken, {
              expires: expires
            });

            AuthenticationService.context().then(function(context) {
              $window.sessionStorage.setItem('context', JSON.stringify(context));
              $rootScope.context = context;
              $state.go('app.dashboard');
              var space = {_id : $cookies.get('space')};
              UserService.go(space);
            });
          }
        });
      }
		}

	}]);
})