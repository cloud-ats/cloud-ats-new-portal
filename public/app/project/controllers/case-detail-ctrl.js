define(['project/keyword-module', 'lodash'], function (module, _) {
	'use strict';

	module.registerController('CaseDetailCtrl', ['$filter','$mdSidenav', 'DataService','$cookies', 'Upload', '$scope', 'KeywordService', 
    'CaseService', '$state', '$stateParams', '$timeout','$mdDialog', '$mdToast', 'CustomKeywordService',
    function ($filter, $mdSidenav, DataService, $cookies, Upload, $scope, KeywordService, CaseService, $state, $stateParams, $timeout ,$mdDialog, $mdToast, CustomKeywordService) {

    $scope.$parent.isSidenavOpen = false;
    $scope.$parent.isSidenavLockedOpen = false;


    $scope.toggleProjectNavLeft = function() {
      $mdSidenav('project-nav-left').toggle();
    };

		$scope.projectId = $stateParams.id;
    $scope.cazeId = $stateParams.caseId;
    $scope.hasChanged = false;
    $scope.listKeywords = [];
    $scope.listParamsofData = [];

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
    $scope.buildTextKeyword = function (step) {
      var text = step.type + "(";
      if(step.params){
        _.forEach(step.params, function (value , key){
        text = text + key ;
        text = text + ",";
      })
      text = text.substring(0, text.length-1)
      }
      text = text + ")";
      
      return text ;
    }

    var initData = function() {
      CaseService.get($scope.projectId, $scope.cazeId, function (data, status) {
        $scope.caze = data;
        $scope.caze.originSteps = angular.copy($scope.caze.steps);
        $scope.params = buildParamList(data.steps);

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


        var listKeywordsInCase = transListActions($scope.caze.steps) ;

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

        } else if (buildParamList(listKeywordsInCase).length){
          $scope.params = buildParamList(listKeywordsInCase);
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
    var transListActions = function (steps) {
      var listKeywords = [] ;
      _.forEach(steps, function (step) {
          if (step.actions) {
            _.forEach(step.actions, function (action){
              listKeywords.push(action);
            });
          } else {
            listKeywords.push(step);
          }
          
        });
      return listKeywords;
    };

    initData();

    KeywordService.getKeywords(function(data) {
      $scope.keywords = data;
      _.forEach(data, function(value, cat){
        _.forEach(value, function(value, key){
          $scope.listKeywords.push(value);
        })
      })
    });

    var detectChanged = function(newSteps, oldSteps) {
      var changed = false;
      if(newSteps.length !== oldSteps.length) changed = true;
      else {
        for(var i = 0; i < newSteps.length; i++) {
          if(newSteps[i].type !=="loopor"){
            if (newSteps[i].type !== oldSteps[i].type || newSteps[i].desc !== oldSteps[i].desc) {
              changed = true;
              break;
            } else {
              if((newSteps[i].type.startsWith('verify') || newSteps[i].type.startsWith('assert'))
                && (newSteps[i].negated != oldSteps[i].negated)){
                return true ;
              } else if(newSteps[i].type =="snippet"){
                if(newSteps[i].code !== oldSteps[i].code){
                  return true ;
                }
              }
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
      }
      return changed;
    }

    $scope.dropCallBack = function (index, event, step) {
      if (step.isNew) {
        if (index >= $scope.caze.steps.length - 1) {
          if(step.type == "snippet") {
            $scope.clickToStepSnippet(event, step, $scope.caze.steps.length - 1);
          } else if(step.type == "loopor"){
            $scope.clickToSteploopor(event, step, $scope.caze.steps.length - 1);
          } else {
            if (step.type.startsWith("verify") || step.type.startsWith("assert")) {
              step.negated = false;
            }
            $scope.clickToStep(event, step, $scope.caze.steps.length - 1);
          }
          
        } else {
          $scope.caze.steps.splice(index, 1);
          $scope.caze.steps.push(step);
          if(step.type == "snippet") {
            $scope.clickToStepSnippet(event, step, $scope.caze.steps.length - 1);
          } else if(step.type == "loopor"){
            $scope.clickToSteploopor(event, step, $scope.caze.steps.length - 1);
          } else {
            $scope.clickToStep(event, step, $scope.caze.steps.length - 1);
          }
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

    $scope.cancelCaseDetail = function () {
      $scope.caze.steps = $scope.caze.originSteps;
    }

    $scope.save = function () {
      var caze = {
        _id: $scope.caze._id,
        name: $scope.caze.name,
        steps: $scope.caze.steps,
      };
      if ($scope.caze.data_driven) {
        caze.data_driven = $scope.caze.data_driven._id;
      }
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

    $scope.uploadCase = function (ev) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/upload-case-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        scope: $scope,
        preserveScope: true,
        controller: function() {
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
          $scope.addNewFile = function (file) {
            $scope.caze.jsonFile = file;
          };
          $scope.submit = function () {
            Upload.upload({
              url: appConfig.RestEntry + '/api/v1/project/keyword/' + $scope.caze.project_id + '/upload/'+ $scope.caze._id,
              data: {file: $scope.caze.jsonFile},
              headers: {
                'X-AUTH-TOKEN': $cookies.get('authToken'),
                'Content-Type': undefined
              }
            }).then(function (resp) {
              if(resp.status === 201){
                $mdToast.show($mdToast.simple().position('top right').textContent('Upload Steps of Case Success!'));
                $mdDialog.hide();
                $scope.caze.steps = resp.data.steps;
              } else {
                $mdToast.show($mdToast.simple().position('top right').textContent('Upload Steps of Case Error!'));
                $mdDialog.hide();
              }
            });
          }
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
      $scope.params = buildParamList($scope.caze.steps);
    };

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
          $scope.submitStep = function() {
            $scope.step.isNew = undefined;
            $scope.caze.steps[$index] = $scope.step;
            $mdDialog.cancel();
            $scope.params = buildParamList($scope.caze.steps);
          };
          $scope.remove = function() {
            $scope.caze.steps.splice($index, 1);
            $scope.params = buildParamList($scope.caze.steps);
            $mdDialog.cancel();
          }
        }
      })
    };

    $scope.clickToSteploopor = function (ev, step, $index) {
      $mdDialog.show({
          
        templateUrl: 'app/project/views/keyword/loopor-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        scope: $scope,
        preserveScope: true,
        escapeToClose: false,
        controller: function() {
          $scope.stepLoopor = step ? step : {};
          $scope.stepLoopor.actions = step.actions ? step.actions : [];
          $scope.stepLoopor.variables = step.variables ? step.variables : [];
          $scope.stepLoopor.times = step.times ? step.times : 1;
          $scope.originStepLoopor = angular.copy(step);

          $scope.title = step.type + " [" + ($index + 1) + "]";

          $scope.addNewStep = function () {
            var step = {} ;
            step.type = $scope.selectedItem.type;
            step.params = [];
            var keys = _.keys($scope.selectedItem.params);
            for (var i = 0; i < keys.length; i++) {
              step.params[i] = keys[i];
            }
            $scope.stepLoopor.actions.push(step);
          };

          $scope.selectStepInLoopor = function (step) {
            $scope.currentStep = step ;
          };

          $scope.addVariale = function (chip) {
            return {
              "name": chip
            };
          }
          
          $scope.removeStepInLoopor = function (index) {
            $scope.stepLoopor.actions.splice(index, 1);
            $scope.currentStep = $scope.stepLoopor.actions[0];
          }

          $scope.cancelDialog = function() {
            $scope.caze.steps[$index] = $scope.originStepLoopor;
            $mdDialog.cancel();
          };

          $scope.okDialog = function() {
            $scope.stepLoopor.isNew = undefined;
            $scope.caze.steps[$index] = $scope.stepLoopor;
            if($scope.stepLoopor.variables.length != $scope.originStepLoopor.variables.length || $scope.stepLoopor.times != $scope.originStepLoopor.times){
              $scope.hasChanged = true;
            } else {
              $scope.hasChanged = detectChanged($scope.stepLoopor.actions, $scope.originStepLoopor.actions);
            }
            
            $mdDialog.cancel();
          };

          $scope.$watch('searchKeyword', function(newText, oldText) {
            if (newText !== oldText) {
              if (newText) {
                var results = $filter('filter')($scope.listKeywords, {type: $scope.searchKeyword});
                $scope.listResultKey = results;
              } else {
                $scope.listResultKey = $scope.listKeywords;
              }
            }
          });
        }
      })
    };

    $scope.clickToStepSnippet = function (ev, step, $index) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/snippet-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        scope: $scope,
        preserveScope: true,
        escapeToClose: false,
        controller: function() {
          $scope.originStepSnippet = angular.copy(step);

          if ($scope.caze.data_driven) {
            DataService.get($scope.caze.data_driven._id).then(function(response) {
              var dataSource = JSON.parse(response.data_source);
              _.forEach(dataSource[0], function(value, key) {
                $scope.listParamsofData.push(key);
              });
            });
          }

          $scope.stepSnippet = step ? step : {};
          console.log();
          $scope.title = step.type + " [" + ($index + 1) + "]";
          
          $scope.cancelDialog = function() {
            $scope.caze.steps[$index] = $scope.originStepSnippet;
            $mdDialog.cancel();
          };

          $scope.saveSnippet = function() {
            $scope.stepSnippet.isNew = undefined;
            $scope.caze.steps[$index] = $scope.stepSnippet;
            $mdDialog.cancel();
          };

        }
      })
    }

    $scope.setting = function (ev) {

      $mdDialog.show({
          
        templateUrl: 'app/project/views/keyword/case-form-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          $scope.originCaseName = $scope.caze.name;
          $scope.cancel = function() {
            $scope.caze.name = $scope.originCaseName;
            $mdDialog.cancel();
          };

          $scope.submit = function() {
            var caze = {
              name: $scope.caze.name,
              _id: $scope.caze._id
            };
            CaseService.rename($scope.projectId, caze, function (data, status) {
              if (status == 200) {

                $scope.breadcrumbs[2].name = caze.name;
                $mdToast.show($mdToast.simple().position('top right').textContent('The case has been updated!'));
              } else if (status == 204) {
                $mdToast.show($mdToast.simple().position('top right').textContent('Nothing to update.'));
              }
              $mdDialog.cancel();
            });
          };
        }
      })
    }

    var recursiveVariable = function (val, params) {
      var startIndex = val.indexOf('${');
      var endIndex = val.indexOf('}');
      if (startIndex != -1 && endIndex != -1) {
        var variable = val.substring(startIndex + 2, endIndex);
        if (params.indexOf(variable) == -1) params.push(variable);
        recursiveVariable(val.substring(endIndex + 1), params);
      }
    }

    var buildParamList = function(steps) {
      var params = [];
      var listAllKeywordsOfCase = transListActions(steps);
      _.forEach(listAllKeywordsOfCase, function(step) {
        _.forEach(step.params, function(param) {

          var val = step[param];

          if (val instanceof Object) {
            val = val.value;
          } else if (val) {
            val = val + "";
          }
          if (val) {
            recursiveVariable(val, params)
          }
        });
      });
      return params;
    };

	}]);
})