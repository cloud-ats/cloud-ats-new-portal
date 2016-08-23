define(['project/keyword-module'], function(module) {
  'use strict';

  module.registerFactory('ScheduleService', ['$http', '$cookies', function($http, $cookies) {
    return {

      list: function(projectId ,callback) {
        var request = {
          method: 'GET',
          url: appConfig.RestEntry + '/api/v1/project/keyword/' + projectId + '/schedule',
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          },
        };

        $http(request).success(function(data, status) {
          callback(data, status);
        }).error(function(data, status) {
          callback(data, status);
        });
      },
      create: function(projectId, name ,listSuite, options, schedule,callback) {
        var request = {
          method: 'POST',
          url: appConfig.RestEntry + '/api/v1/project/keyword/' + projectId + '/schedule/'+ name,
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          },
          data: {
            schedule: schedule,
            suites: listSuite,
            options: options
          }
        };

        $http(request).success(function(data, status) {
          callback(data, status);
        }).error(function(data, status) {
          callback(data, status);
        });
      },
      delete: function(projectId , scheduleId, callback) {
        var request = {
          method: 'DELETE',
          url: appConfig.RestEntry + '/api/v1/project/keyword/' + projectId + '/schedule/' + scheduleId,
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'X-SPACE': $cookies.get('space')
          },
        };

        $http(request).success(function(data, status) {
          callback(data, status);
        }).error(function(data, status) {
          callback(data, status);
        });
      },
 
     
    }
  }]);
});