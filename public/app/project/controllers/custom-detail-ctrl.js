define(['project/keyword-module', 'lodash'], function (module, _) {
	'use strict';

	module.registerController('CustomDetailCtrl', ['$mdSidenav', 'DataService', '$scope', 'KeywordService', 
    'CaseService', '$state', '$stateParams', '$timeout','$mdDialog', '$mdToast', 'CustomKeywordService',
    function ($mdSidenav, DataService, $scope, KeywordService, CaseService, $state, $stateParams, $timeout ,$mdDialog, $mdToast, CustomKeywordService) {

    $scope.$parent.isSidenavOpen = false;
    $scope.$parent.isSidenavLockedOpen = false;

    $scope.toggleProjectNavLeft = function() {
      $mdSidenav('project-nav-left').toggle();
    };
		$scope.projectId = $stateParams.id;
    $scope.customId = $stateParams.customId;
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
      CustomKeywordService.get($scope.projectId, $scope.customId, function (data, status) {
        $scope.custom = data;
        $scope.custom.steps = data.steps ? data.steps : [];
        $scope.custom.originSteps = angular.copy($scope.custom.steps);
        var overview = {
          name: $scope.custom.project,
          state: 'app.project.keyword-reports',
          data: {
            id: $scope.projectId
          }
        }
        var customs = {
          name: 'Group Keywords',
          state: 'app.project.keyword-customs',
          data: {
            id: $scope.projectId
          }
        }
        var custom = {
          name: $scope.custom.name
        }

        $scope.breadcrumbs = [overview, customs, custom];

        $scope.$watch('custom.steps', function(newSteps, oldSteps) {
          if (newSteps !== oldSteps) {
            if (detectChanged(newSteps, $scope.custom.originSteps)) {
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
        if (index >= $scope.custom.steps.length - 1) {
          $scope.clickToStep(event, step, $scope.custom.steps.length - 1);
        } else {
          $scope.custom.steps.splice(index, 1);
          $scope.custom.steps.push(step);
          $scope.clickToStep(event, step, $scope.custom.steps.length - 1);
        }
      }
      if (step.steps) {
        var steps = step.steps;        
        $scope.custom.steps.splice($scope.custom.steps.length - 1);
        _.forEach(steps, function(sel) {
          $scope.custom.steps.push(sel);
        });
      }
    }

    $scope.cancel = function () {
      $scope.custom.steps = angular.copy($scope.custom.originSteps);
    }

    $scope.save = function () {
      var custom = {
        _id: $scope.custom._id,
        name: $scope.custom.name,
        steps: $scope.custom.steps
      };

      CustomKeywordService.update($scope.custom.project_id, custom, function (data, status){
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

    $scope.removeStep = function (index) {
      $scope.custom.steps.splice(index, 1);
    }

    $scope.clickToStep = function (ev, step, $index) {
      $scope.originCustom = angular.copy($scope.custom);
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
            $scope.custom.steps[$index] = $scope.step;
            $mdDialog.cancel();
          };
          $scope.remove = function() {
            $scope.custom.steps.splice($index, 1);
            $mdDialog.cancel();
          }
        }
      })
    }

    $scope.setting = function (ev) {

      $mdDialog.show({
          
        templateUrl: 'app/project/views/keyword/custom-form-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          $scope.originCustomName = $scope.custom.name;
          $scope.cancel = function() {
            $scope.custom.name = $scope.originCustomName;
            $mdDialog.cancel();
          };

          $scope.submit = function() {
            var custom = {
              name: $scope.custom.name,
              _id: $scope.custom._id
            };
            CustomKeywordService.rename($scope.projectId, custom, function (data, status) {
              if (status == 200) {

                $scope.breadcrumbs[2].name = custom.name;
                $mdToast.show($mdToast.simple().position('top right').textContent('The group keyword has been updated!'));
              } else if (status == 204) {
                $mdToast.show($mdToast.simple().position('top right').textContent('Nothing to update.'));
              }
              $mdDialog.cancel();
            });
          };
        }
      })
    }

	}]);
})