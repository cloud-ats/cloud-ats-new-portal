define(['acl/module'], function(module) {
  'use strict';

  module.registerFactory('SpaceService', ['$http', '$cookies', function($http, $cookies) {
    return {
      list: function(callback) {
        var request = {
          method: 'GET',
          url: appConfig.RestEntry + '/api/v1/acl/spaces' ,
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          }
        };

        $http(request).success(function (data, status) {
          callback(data);
        }).error(function (data, status) {

        });
      },
      update: function (space, callback) {
        var request = {
          method: 'PUT',
          url: appConfig.RestEntry + '/api/v1/acl/space',
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          },
          data: space
        }

        $http(request).success(function (data, status) {
          callback(data, status);
        }).error(function (data, status) {});
      },
      delete: function (id, callback) {
        var request = {
          method: 'DELETE',
          url: appConfig.RestEntry + '/api/v1/acl/space/'+id,
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          }
        }

        $http(request).success(function (data, status) {
          callback(data, status);
        }).error(function (data, status) {

        });
      },
    }
  }]);
});
