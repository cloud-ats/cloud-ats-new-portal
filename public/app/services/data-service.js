define(['project/keyword-module'], function(module) {
  'use strict';

  module.registerFactory('DataService', ['$http', '$q', '$cookies', '$state',
    function($http, $q, $cookies, $state){
      return {
        list: function (projectId, callback) {
          var request = {
            method: 'GET',
            url: appConfig.RestEntry + '/api/v1/datas/' + projectId,
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space'),
            }
          };

          $http(request).success(function(data, status) {
            callback(data, status);
          }). error(function(data, status) {
            callback(data, status);
          })
        },
        create: function(name, dataset, projectId, caseId, callback) {
          var request = {
            method: 'POST',
            url: appConfig.RestEntry + '/api/v1/data/' + projectId,
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space'),
            },
            data: {
              name: name,
              dataset: dataset,
              caseId: caseId
            }
          };

          $http(request).success(function(data, status) {
            callback(data, status);
          }). error(function(data, status) {
            callback(data, status);
          })
        },

        update: function(name, dataset, id, callback) {
          var request = {
            method: 'PUT',
            url: appConfig.RestEntry + '/api/v1/data',
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space'),
            },
            data: {
              name: name,
              dataset: dataset,
              id: id
            }
          };

          $http(request).success(function(data, status) {
            callback(data, status);
          }). error(function(data, status) {
            callback(data, status);
          })
        },

        get: function (id) {

          var dfd = $q.defer();

          var request = {
            method: 'GET',
            url: appConfig.RestEntry + '/api/v1/data/' + id,

            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space')
            }
          };

          $http(request)
          .success(function(response) {
            dfd.resolve(response);
          })
          .error(function (data, status) {
            switch (status) {
              case 403:
                $state.go('403');
                break;
              case 401:
                $state.go('401');
                break;
            }
            dfd.reject;
          });
          return dfd.promise;
        },

        delete: function (id, callback) {
          var request = {
            method: 'DELETE',
            url: appConfig.RestEntry + '/api/v1/data',

            headers: {
              'X-AUTH-TOKEN' : $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space')
            },
            data: id
          };

          $http(request).success(function (data, status) {
            callback(data, status);
          }).error(function (data, status) {
            switch (status) {
              case 403:
                $state.go('403');
                break;
              case 401:
                $state.go('401');
                break;
            }
          });
        },

        upload: function (params,caseId, projectId, file,callback) {
          var request = {
            method : 'POST',
            url: appConfig.RestEntry + '/api/v1/data/' + projectId + '/upload/' + caseId,
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'Content-Type': undefined
            },
            transformRequest : function(data) {
              var formData = new FormData();
              formData.append('file',data.file);
              formData.append('params',angular.toJson(data.params));
              return formData;
            },
            data: {
              file : file,
              params : params
            }
          }

          $http(request)
          .success(function (data,status) {
            callback(data,status);
          })
          .error(function(data,status) {
            callback(data,status);
          });
        },
        rename: function(info, callback) {
          var request = {
            method: 'PUT',
            url: appConfig.RestEntry + '/api/v1/data/rename',
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'X-SPACE': $cookies.get('space'),
            },
            data: info
          };

          $http(request).success(function(data, status) {
            callback(data, status);
          }). error(function(data, status) {
            callback(data, status);
          })
        },
        /*upload: function (params,caseId, projectId, file,callback) {
          var formData = new FormData();
          formData.append('file',file);
          var request = {
            method : 'POST',
            url: appConfig.RestEntry + '/api/v1/data/' + projectId + '/upload/' + caseId,
            headers: {
              'X-AUTH-TOKEN': $cookies.get('authToken'),
              'Content-Type': undefined
            },
            data:formData
          }

          $http(request)
          .success(function (data,status) {
            callback(data,status);
          })
          .error(function(data,status) {
            callback(data,status);
          });
        }*/
      }
  }]);
})