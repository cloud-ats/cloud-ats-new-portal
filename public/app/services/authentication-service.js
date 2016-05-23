define(['app'], function(app) {

  'use strict';

  return app.factory('AuthenticationService', 

    ['$http', '$q', '$log', '$cookies', '$window', '$rootScope', '$state', '$stateParams',
    function($http, $q, $log, $cookies, $window, $rootScope, $state, $stateParams) {
    
    function login(email, password, callback) {
      var request = {
        method: 'POST',
        url: appConfig.RestEntry + '/api/v1/user/login',
        data: {
          email: email,
          password: password
        }
      }

      $http(request)
      .success(function(data) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        if(status === 401) {
          var data = {
            error: true,
            message : 'Username or password is incorrect'
          }
          callback(data);
        }
      });
    };

    function logout(callback) {
      var request = {
        method: 'GET',
        url: appConfig.RestEntry + '/api/v1/user/logout',
        headers: {
          'X-AUTH-TOKEN': $cookies.get('authToken')
        }
      }

      $http(request)
      .success(function() {

        $cookies.remove('authToken');
        if ($cookies.get('space') === undefined || $cookies.get('space') == 'null') {
          $cookies.remove('space')
        } 
        $window.sessionStorage.removeItem('context');
        $rootScope.context = null;
        callback();
      })
    };

    function register(email, password, firstname, lastname, tenant, callback) {
      var request = {
        method: 'POST',
        url: appConfig.RestEntry + '/api/v1/user/register',
        data: {
          email: email,
          password: password,
          firstname: firstname,
          lastname: lastname,
          tenant: tenant
        }
      }

      $http(request)
      .success(function(data) {
        callback(data);
      })
      .error(function(data, status, headers, config) {
        if(status === 401) {

           var data = {
            error: true,
            message : 'register fail'
          }
          callback(data);
        }
      });
    };

    function getTenants(callback) {
      var request = {
        method: 'GET',
        url: appConfig.RestEntry + '/api/v1/user/tenants'
      }

      $http(request).success(function(data){
        callback(data);
      });
    };
    
    function context() {

      var dfd = $q.defer();

      var request = {
        method: 'GET',
        url: appConfig.RestEntry + '/api/v1/context',
        headers: {
          'X-AUTH-TOKEN': $cookies.get('authToken')
        }
      }

      $http(request)
      .success(function(response) {
        dfd.resolve(response);
      })
      .error(dfd.reject);

      return dfd.promise;
    };

    function checkAccount(email, callback) {
      var request = {
        method: 'GET',
        url: appConfig.RestEntry + '/api/v1/user/checkAccount?email='+email
        
      }

      $http(request).success(function(data){
        callback(data);
      });
    };

    return {
      login: function(email, password, callback) {
        login(email, password, callback);
      },
      logout: function(callback) {
        logout(callback);
      },
      context: function() {
        return context();
      },
      verifyState: function(state) {
        return verifyState(state);
      },
      register: function(email, password, firstname, lastname, tenant, callback) {
        register(email, password, firstname, lastname, tenant, callback);
      },
      getTenants: function(callback){
        getTenants(callback);
      },
      checkAccount: function(email, callback) {
        checkAccount(email, callback);
      }
    }
  }]);
});