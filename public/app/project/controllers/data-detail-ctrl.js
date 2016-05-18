define(['project/keyword-module', 'lodash'], function (module, _) {
  'use strict';

  module.registerController('DataDetailCtrl', ['$filter', '$mdSidenav', '$cookies', 'Upload', 'SharedDataService', 'DataService', '$scope', '$state', '$stateParams', '$mdDialog', '$mdToast',
    function ($filter, $mdSidenav, $cookies, Upload, SharedDataService, DataService, $scope, $state, $stateParams, $mdDialog, $mdToast) {
      $scope.$parent.isSidenavOpen = false;
      $scope.$parent.isSidenavLockedOpen = false;
      $scope.sharedData = SharedDataService;

      $scope.toggleProjectNavLeft = function() {
        $mdSidenav('project-nav-left').toggle();
      };

      $scope.projectId = $stateParams.id;
      $scope.dataId = $stateParams.dataId;
      $scope.validated = false;
      $scope.selected = [];

      $scope.addRow = function() {
        var obj = {};
        _.forEach($scope.params, function(param) {
          obj[param] = undefined;
        });
        if (!$scope.dataSource) $scope.dataSource = [];
        $scope.dataSource.push(obj);
      };

      $scope.deleteRow = function() {
        _.forEach($scope.selected, function (object) {
          _.remove($scope.dataSource, function (obj) {
            return obj === object;
          });
        });
        $scope.selected = [];
      }

      $scope.cancel = function () {
        initData();
      }

      $scope.save = function() {
        DataService.update($scope.data.name, $scope.dataSource, $scope.data._id, function (data, status) {
          switch (status) {
            case 304: 
              break;
            case 200:
              $mdToast.show($mdToast.simple().position('top right').textContent('Data has been updated!'));
              initData();
              break;
            default:
              break;
          }
        });
      }

      $scope.changeData = function(param, row) {
        var id = '#' + param + '_' + row;
        var $input = $(id);
        if ($input.val()) {
          var textLength = $input.val().length;
          if (textLength > 50) {
            $input.width(textLength * 8);
          }
          $input.prev().remove();
        } else {
          var $label = $('<label>' + param + ' value</label>');
          $label.insertBefore($input);
        }
      }

      $scope.addColumn = function ($event) {
        $mdDialog.show({
          clickOutsideToClose: true,
          focusOnOpen: false,
          targetEvent: $event,
          templateUrl: 'app/project/views/keyword/data-driven-add-column-dialog.tpl.html',
          scope: $scope,
          preserveScope: true,
          controller: function AddController() {

            $scope.column_name = undefined;

            $scope.doAddColumnData = function() {
              var newName = $scope.column_name;
              _.forEach($scope.dataSource, function (object) {
                object[newName] = undefined;
              });
              $scope.params.push(newName);
              $scope.sharedData.hasChanged = true;
              $scope.validated = false;
              $mdDialog.cancel();
            }
          }
        });
      }

      $scope.modifyColumn = function ($event) {
        $mdDialog.show({
          templateUrl: 'app/project/views/keyword/data-driven-modify-column-dialog.tpl.html',
          clickOutsideToClose: true,
          targetEvent: $event,
          scope: $scope,
          preserveScope: true,
          controller: function() {
            $scope.selectedColumn = angular.copy($scope.params);

            $scope.submit = function() {
              $scope.params = angular.copy($scope.selectedColumn);
              var newDataSource = [];
              _.forEach($scope.dataSource, function(data) {
                var newObj = {};
                _.forEach($scope.selectedColumn, function(column) {
                  newObj[column] = data[column];
                })
                newDataSource.push(newObj);
              })
              $scope.dataSource = newDataSource;
              $mdDialog.cancel();
            }
            
            $scope.exists = function(item, list) {
              return list.indexOf(item) > -1;
            }

            $scope.toggle = function(item, list) {
              var idx = list.indexOf(item);
              if (idx > -1) list.splice(idx, 1);
              else list.push(item);
            }

            $scope.close = function() {
              $mdDialog.cancel();
            }
          }
        })
      }

      $scope.addNewFile = function (files) {
        
        if(!files || !files.length) return;

        var file = files[0];
        Upload.upload({
          url: appConfig.RestEntry + '/api/v1/data/' + null + '/upload/'+null,
          data: {file: file},
          headers: {
            'X-AUTH-TOKEN': $cookies.get('authToken'),
            'Content-Type': undefined
          }
        }).then(function (response) {
          $scope.dataSource = JSON.parse(response.data.data_source);
        });
      }

      var buildParams = function (data) {
        var params = [];
        _.forIn(data, function (value, key) {
          if (params.indexOf(key) === -1) {            
            params.push(key);
          }
        });
        return params;
      }

      $scope.rename = function (ev) {
        $mdDialog.show({
            
          templateUrl: 'app/project/views/keyword/data-driven-in-case-form-dialog.tpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          scope: $scope,
          preserveScope: true,
          controller: function() {

            $scope.originDataName = $scope.data.name;
            $scope.cancel = function() {
              $scope.data.name = $scope.originDataName;
              $mdDialog.cancel();
            };

            $scope.submit = function() {
              var dataInfo = {
                name: $scope.data.name,
                _id: $scope.dataId
              };
              DataService.rename(dataInfo, function (data, status) {
                if (status == 200) {

                  $scope.breadcrumbs[2].name = dataInfo.name;
                  $mdToast.show($mdToast.simple().position('top right').textContent('The data driven has been updated!'));
                } else if (status == 204) {
                  $mdToast.show($mdToast.simple().position('top right').textContent('Nothing to update.'));
                }
                $mdDialog.cancel();
              });
            };
          }
        })
      }

      var initData = function() {
        DataService.get($scope.dataId).then(function(response) {
          $scope.data = response;
          $scope.projectName = response.projectName;
          $scope.dataSource = JSON.parse($scope.data.data_source);
          $scope.originDataSource = angular.copy($scope.dataSource);
          $scope.params = buildParams($scope.dataSource[0]);
          $scope.sharedData.hasChanged = false;

          var overview = {
            name: $scope.projectName,
            state: 'app.project.overview',
            data: {
              id: $scope.projectId
            }
          }

          var dataList = {
            name: 'Data Driven',
            state: 'app.project.keyword-data',
            data: {
              id: $scope.projectId
            }
          }

          var data = {
            name: $scope.data.name
          }

          $scope.breadcrumbs = [overview, dataList, data];
        });
      }

      $scope.$watch('sharedData.dataQueryText', function(newData, oldData) {
        if (newData !== oldData) {
          
          if (newData) {
            var queriedData = [];

            var i = 0;
            _.forEach($scope.dataSource, function (data) {
              data.id = i;
              i++;
            });

            _.forEach($scope.params, function(param) {
              var expression = {};
              expression[param] = newData;
              var results = $filter('filter')($scope.dataSource, expression);
              _.forEach(results, function(result) {
                if (!(_.some(queriedData, function (temp) {
                  return temp.id === result.id;
                }))) {
                  queriedData .push(result);
                }
              });
            });

            _.forEach($scope.dataSource, function (data) {
              delete data.id;
            });
            _.forEach($scope.queriedData, function (data) {
              delete data.id;
            });

            $scope.dataSource = queriedData;
          } else {
            $scope.dataSource = angular.copy($scope.originDataSource);
          }
        }
      });

      $scope.$watch('dataSource', function(newData, oldData) {

        if (newData !== oldData && !$scope.sharedData.dataQueryText) {

          //Validate
          if (!newData.length) {
            $scope.validated = false;
            return;
          }

          var b = true;
          _.forEach(newData, function(object) {
            _.findKey(object, function(value) {
              if (!value) {
                b = b && false;
              } else {
                b = b && true;
              }
            });
            if (!b) return;
          });
          $scope.validated = b;
          //End validate

          //Detect change
          if (!$scope.originDataSource) return;

          if (newData.length != $scope.originDataSource.length) {
            $scope.sharedData.hasChanged = true;
            return;
          } else {
            var b = true;
            for (var i = 0; i < newData.length; i++) {
              var that = newData[i];
              var thiz = $scope.originDataSource[i];
              var thisKeys = _.keys(thiz);
              var thatKeys = _.keys(that);
              if (thisKeys.length !== thatKeys.length) {
                $scope.sharedData.hasChanged = true;
                return;
              } else {
                _.forEach(thisKeys, function(key) {
                  b = b && (thiz[key] === that[key]);
                })
              }
            }
            $scope.sharedData.hasChanged = !b;
          }
          //End detect change
        }
    }, true);

    initData();
  }]);
})