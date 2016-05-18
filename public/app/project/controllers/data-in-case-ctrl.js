define(['project/keyword-module', 'lodash'], function (module, _) {
  'use strict';

  module.registerController('DataInCaseCtrl', ['$filter', '$mdSidenav', '$cookies', 'Upload', 'SharedDataService', 'DataService', '$scope', 'KeywordService', 
    'CaseService', '$state', '$stateParams', '$mdDialog', '$mdToast', 'CustomKeywordService',
    function ($filter, $mdSidenav, $cookies, Upload, SharedDataService, DataService, $scope, KeywordService, CaseService, $state, $stateParams, $mdDialog, $mdToast, CustomKeywordService) {

    $scope.$parent.isSidenavOpen = false;
    $scope.$parent.isSidenavLockedOpen = false;
    $scope.sharedData = SharedDataService;

    $scope.toggleProjectNavLeft = function() {
      $mdSidenav('project-nav-left').toggle();
    };

    $scope.projectId = $stateParams.id;
    $scope.cazeId = $stateParams.caseId;
    $scope.validated = false;
    $scope.selected = [];

    var initData = function() {
      CaseService.get($scope.projectId, $scope.cazeId, function (response, status) {
        $scope.caze = response;
        $scope.projectName = response.project;
        $scope.cazeName = response.name;

        var overview = {
          name: $scope.projectName,
          state: 'app.project.overview',
          data: {
            id: $scope.projectId
          }
        }
        var cases = {
          name: 'Cases',
          state: 'app.project.keyword-cases',
          data: {
            id: $scope.projectId
          }
        }
        var caze = {
          name: $scope.cazeName,
          state: 'app.project.keyword-cases.case',
          data: {
            caseId: $scope.cazeId
          }
        }

        $scope.breadcrumbs = [overview, cases, caze];

        if (response.data_driven) {
          $scope.dataId = response.data_driven._id;
          DataService.get($scope.dataId).then(function(response) {
            $scope.data = response;
            $scope.dataSource = JSON.parse($scope.data.data_source);
            $scope.originDataSource = angular.copy($scope.dataSource);
            $scope.params = [];
            _.forEach($scope.dataSource[0], function(value, key) {
              $scope.params.push(key);
            });
            if ($stateParams.params) {
              var paramsOnUrl = _.split($stateParams.params, ',');
              var diffs = _.difference(paramsOnUrl, $scope.params);
              if (diffs.length) {
                $scope.sharedData.hasChanged = true;
                _.forEach(diffs, function(param) {
                  $scope.params.push(param);
                  _.forEach($scope.dataSource, function(data) {
                    data[param] = undefined;
                  });
                });
              }
            }

            var data = {
              name: '[Data Driven] ' + $scope.data.name
            }

            $scope.breadcrumbs.push(data);
          });
        } else {
          var data = {
            name: '[Data Driven] Empty'
          }
          $scope.breadcrumbs.push(data);
          $scope.params = _.split($stateParams.params, ',');
          $scope.addRow();
        }
      });
    }

    $scope.addRow = function() {
      var obj = {};
      _.forEach($scope.params, function(param) {
        obj[param] = undefined;
      });
      if (!$scope.dataSource) $scope.dataSource = [];
      $scope.dataSource.push(obj);
    };

    $scope.deleteRow = function () {
      _.forEach($scope.selected, function (object) {
        _.remove($scope.dataSource, function (obj) {
          return obj === object;
        });
      });
      $scope.selected = [];
    }

    $scope.uploadFromLocal = function (ev) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/data-driven-csv-upload-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          $scope.data = {
            name: undefined,
            csv: undefined,
          };

          $scope.close = function() {
            $mdDialog.cancel();
          }

          $scope.submit = function() {
            DataService.create($scope.data.name.trim(), $scope.data.data_source, $scope.projectId, $scope.cazeId, function(response, status) {
              $mdToast.show($mdToast.simple().position('top right').textContent('Data has been created!'));
              $mdDialog.cancel();
              var data = {
                id: $scope.projectId,
                caseId: $scope.cazeId
              }
              $state.go('app.project.keyword-cases.case', data)
            });
          }

          $scope.addNewFile = function (files) {
            var file = files[0]
            $scope.data.csv = file.name;
            Upload.upload({
              url: appConfig.RestEntry + '/api/v1/data/' + null + '/upload/'+null,
              data: {file: file},
              headers: {
                'X-AUTH-TOKEN': $cookies.get('authToken'),
                'Content-Type': undefined
              }
            }).then(function (response) {
              $scope.data.data_source = JSON.parse(response.data.data_source);
            });
          }
        }
      })
    }

    $scope.selectExistedData = function (ev) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/data-driven-select-existed-dialog.tpl.html',
        targetEvent: ev,
        clickOutsideToClose: true,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          DataService.list($scope.projectId, function (response, status) {
            $scope.list = response.datum;
            $scope.originList = angular.copy($scope.list);
          });

          $scope.$watch('searchText', function(newText, oldText) {
            if (newText !== oldText) {
              if (newText) {
                var results = $filter('filter')($scope.originList, {name: $scope.searchText});
                $scope.list = results;
              } else {
                $scope.list = angular.copy($scope.originList);
              }
            }
          });

          $scope.close = function() {
            $mdDialog.cancel();
          }

          $scope.submit = function() {
            var caze = {
              _id: $scope.caze._id,
              name: $scope.caze.name,
              steps: $scope.caze.steps,
              data_driven: $scope.selectedItem._id
            };
            CaseService.update($scope.caze.project_id, caze, function (data, status){
              switch (status) {
                case 200: 
                  $mdToast.show($mdToast.simple().position('top right').textContent('The case has been updated!'));
                  var data = {
                    id: $scope.projectId,
                    caseId: $scope.cazeId
                  };
                  $state.go('app.project.keyword-cases.case', data);
                  break;
                case 204:
                  $mdToast.show($mdToast.simple().position('top right').textContent('There is nothing to update!'));
                  break;
                default: break; 
              }
            });
          }
        }
      })
    }

    $scope.renew = function() {
      var caze = {
        _id: $scope.caze._id,
        name: $scope.caze.name,
        steps: $scope.caze.steps,
      };
      CaseService.update($scope.caze.project_id, caze, function (data, status){
        switch (status) {
          case 200: 
            $mdToast.show($mdToast.simple().position('top right').textContent('The case has been updated!'));
            var data = {
              id: $scope.projectId,
              caseId: $scope.cazeId
            };
            $state.go('app.project.keyword-cases.case', data);
            break;
          case 204:
            $mdToast.show($mdToast.simple().position('top right').textContent('There is nothing to update!'));
            break;
          default: break; 
        }
      });
    }

    $scope.create = function (ev) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/data-driven-dialog.tpl.html',
        targetEvent: ev,
        clickOutsideToClose:true,
        scope: $scope,
        preserveScope: true,
        controller: function() {
          $scope.title = "Create new data driven";
          $scope.close = function() {
            $mdDialog.cancel();
          };
          $scope.submit = function() {
            DataService.create($scope.data.name.trim(), $scope.dataSource, $scope.projectId, $scope.cazeId, function(response, status) {
              $mdToast.show($mdToast.simple().position('top right').textContent('Data has been created!'));
              $mdDialog.cancel();
              var data = {
                id: $scope.projectId,
                caseId: $scope.cazeId
              }
              $state.go('app.project.keyword-cases.case', data)
            });
          };
        }
      })
    }

    $scope.cancel = function () {
      var data = {
        id: $scope.projectId,
        caseId: $scope.cazeId
      };
      $state.go('app.project.keyword-cases.case', data);
    }

    $scope.save = function() {
      DataService.update($scope.data.name, $scope.dataSource, $scope.data._id, function (data, status) {
        switch (status) {
          case 304: 
            break;
          case 200:
            $mdToast.show($mdToast.simple().position('top right').textContent('Data has been updated!'));
            var data = {
              id: $scope.projectId,
              caseId: $scope.cazeId
            };
            $state.go('app.project.keyword-cases.case', data);
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