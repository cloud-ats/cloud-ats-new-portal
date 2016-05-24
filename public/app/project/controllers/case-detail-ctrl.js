define(['project/keyword-module', 'lodash'], function (module, _) {
	'use strict';

	module.registerController('CaseDetailCtrl', ['$mdSidenav', 'DataService', '$scope', 'KeywordService', 
    'CaseService', '$state', '$stateParams', '$timeout','$mdDialog', '$mdToast', 'CustomKeywordService',
    function ($mdSidenav, DataService, $scope, KeywordService, CaseService, $state, $stateParams, $timeout ,$mdDialog, $mdToast, CustomKeywordService) {

    $scope.$parent.isSidenavOpen = false;
    $scope.$parent.isSidenavLockedOpen = false;

    $scope.toggleProjectNavLeft = function() {
      $mdSidenav('project-nav-left').toggle();
    };

		$scope.projectId = $stateParams.id;
    $scope.cazeId = $stateParams.caseId;
    $scope.hasChanged = false;

    $scope.types = [
      {value: 'id', text: 'id'},
      {value: 'name', text: 'name'},
      {value: 'link text', text: 'link text'},
      {value: 'css selector', text: 'css selector'},
      {value: 'xpath', text: 'xpath'}
    ]; 

    $scope.toggleCategory = function(evt) {
      var $currentTarget = $(evt.currentTarget);
      var $stepsContainer = $currentTarget.next('.steps-container');
      $currentTarget.toggleClass('expanded');
      $stepsContainer.slideToggle(200);
    }

    $scope.getListSteps = function(cat) {
      var list = []; 
      _.forEach($scope.keywords[cat], function(value, key) {
        value.type = key;
        list.push(value);
      });
      return list;
    }

    var initData = function() {
      CaseService.get($scope.projectId, $scope.cazeId, function (data, status) {
        $scope.caze = data;
        $scope.caze.originSteps = angular.copy($scope.caze.steps);
        $scope.params = buildParamList(data);

        var overview = {
          name: $scope.caze.project,
          state: 'app.project.keyword-reports',
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
          name: $scope.caze.name
        }

        $scope.breadcrumbs = [overview, cases, caze];

        if ($scope.caze.data_driven) {
          var dataDriven = {
            name: '[Data Driven] ' + $scope.caze.data_driven.name,
            state: 'app.project.keyword-cases.case.data',
            data: {
              id: $scope.projectId,
              caseId: $scope.cazeId,
              params: _.join($scope.params, ',')
            }
          }
          $scope.breadcrumbs.push(dataDriven);
        } else if (buildParamList($scope.caze).length){
          var dataDriven = {
            name: '[Data Driven] Empty',
            state: 'app.project.keyword-cases.case.data',
            data: {
              id: $scope.projectId,
              projectName: $scope.caze.project,
              caseId: $scope.cazeId,
              caseName: $scope.caze.name,
              params: _.join($scope.params, ',')
            }
          }
          $scope.breadcrumbs.push(dataDriven);
        }

        $scope.$watch('caze.steps', function(newSteps, oldSteps) {
          if (newSteps !== oldSteps) {
            if (detectChanged(newSteps, $scope.caze.originSteps)) {
              $scope.hasChanged = true;
            } else {
              $scope.hasChanged = false;
            }
          }
        }, true);

        $scope.$watch('params', function(newValue, oldValue) {
          if (newValue !== oldValue) {
          }
        });

        CustomKeywordService.list($scope.projectId, function(response) {
          $scope.customs = response.customs;
        });

      });
    }

    initData();

    KeywordService.getKeywords(function(data) {
      $scope.keywords = data;
    });

    var detectChanged = function(newSteps, oldSteps) {
      var changed = false;
      if(newSteps.length !== oldSteps.length) changed = true;
      else {
        for(var i = 0; i < newSteps.length; i++) {
          if (newSteps[i].type !== oldSteps[i].type) {
            changed = true;
            break;
          } else {
            _.forEach(newSteps[i].params, function(param) {
              if (param !== 'locator' && param !== 'targetLocator') {
                if (newSteps[i][param] !== oldSteps[i][param]) {
                  changed = true;
                  return;
                }
              } else if (newSteps[i][param].type !== oldSteps[i][param].type || newSteps[i][param].value !== oldSteps[i][param].value){
                changed = true;
                return;
              }
            });
            if (changed) return true;
          }
        }
      }
      return changed;
    }

    $scope.dropCallBack = function (index, event, step) {
      
      if (step.isNew) {
        if (index >= $scope.caze.steps.length - 1) {
          $scope.clickToStep(event, step, $scope.caze.steps.length - 1);
        } else {
          $scope.caze.steps.splice(index, 1);
          $scope.caze.steps.push(step);
          $scope.clickToStep(event, step, $scope.caze.steps.length - 1);
        }
      }
      if (step.steps) {
        var steps = step.steps;        
        $scope.caze.steps.splice($scope.caze.steps.length - 1);
        _.forEach(steps, function(sel) {
          $scope.caze.steps.push(sel);
        });
      }
    }

    $scope.cancel = function () {
      $scope.caze.steps = angular.copy($scope.caze.originSteps);
    }

    $scope.save = function () {
      var caze = {
        _id: $scope.caze._id,
        name: $scope.caze.name,
        steps: $scope.caze.steps
      };

      CaseService.update($scope.caze.project_id, caze, function (data, status){
        switch (status) {
          case 200: 
            $mdToast.show($mdToast.simple().position('top right').textContent('The case has been updated!'));
            $scope.hasChanged = false;
            initData();
            break;
          case 204:
            $mdToast.show($mdToast.simple().position('top right').textContent('There is nothing to update!'));
            $scope.hasChanged = false;
            break;
          default: break; 
        }
      });
    }

    $scope.group = function (ev) {
      $mdDialog.show({
          
        templateUrl: 'app/project/views/keyword/custom-create-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          $scope.cancelGroup = function() {
            $mdDialog.cancel();
          };
          $scope.submit = function() {
            var custom = {
              name: $scope.custom.name,
              steps: $scope.caze.steps
            };

            CustomKeywordService.create($scope.projectId, custom, function (data, status){
              switch (status) {
                case 201: 
                  $mdToast.show($mdToast.simple().position('top right').textContent('The group keyword has been created!'));
                  $mdDialog.cancel();
                  break;
                default: break; 
              }
            });
          };
        }
      })
    }

    $scope.removeStep = function (index) {
      $scope.caze.steps.splice(index, 1);
      $scope.params = buildParamList($scope.caze);
    }

    $scope.clickToStep = function (ev, step, $index) {
      $scope.originCase = angular.copy($scope.caze);
      $scope.step = angular.copy(step);
      $scope.organizeMode = true;
      $scope.originStep = angular.copy($scope.step);
      $mdDialog.show({
          
        templateUrl: 'app/project/views/keyword/step-data-form-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        scope: $scope,
        preserveScope: true,
        escapeToClose: false,
        controller: function() {

          $scope.title = step.type + " [" + ($index + 1) + "]";

          $scope.cancelDialog = function() {
            $scope.step = $scope.originStep;
            $mdDialog.cancel();
          };
          $scope.submit = function() {
            $scope.step.isNew = undefined;
            $scope.caze.steps[$index] = $scope.step;
            $mdDialog.cancel();
            $scope.params = buildParamList($scope.caze);
          };
          $scope.remove = function() {
            $scope.caze.steps.splice($index, 1);
            $mdDialog.cancel();
            $scope.params = buildParamList($scope.caze);
          }
        }
      })
    }

    var buildParamList = function(caze) {
      var params = [];
      _.forEach(caze.steps, function(step) {
        _.forEach(step.params, function(param) {
          var val = step[param];
          if (val instanceof Object) {
            val = val.value;
          }

          var startIndex = val.indexOf('${');
          var endIndex = val.lastIndexOf('}');
          if (startIndex == 0 && endIndex == (val.length - 1)) {
            var variable = val.substring(startIndex + 2, endIndex);
            if (params.indexOf(variable) == -1) params.push(variable);
          }
        });
      });
      return params;
    };

	}]);
})