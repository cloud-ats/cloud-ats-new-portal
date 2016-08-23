define(['project/keyword-module', 'lodash'], function (module, _) {
	'use strict';

	module.registerController('ScheduleCtrl', ['SharedDataService', 'ScheduleService', 'SuiteService', 'KeywordService','$scope', '$rootScope', '$state', '$stateParams','$mdDialog', '$mdToast',
    function (SharedDataService, ScheduleService, SuiteService, KeywordService, $scope, $rootScope, $state, $stateParams, $mdDialog, $mdToast) {
      $scope.projectId = $stateParams.id;
      $scope.sharedData = SharedDataService;
      var suiteSelected = [];
      $scope.currentStep = 1;
      $scope.checkSuiteSelected = false;

      $scope.schedule = {};
      $scope.schedule.dateRepeat = [];
      $scope.schedule.day = null;
      $scope.ListDateInit = ["Monday","Thursday","Wednesday","Tuesday","Friday","Saturday","Sunday"];
      
      $scope.listSchedule = [];
      ScheduleService.list($scope.projectId, function(response) {
        $scope.listSchedule = response;
      });

      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };
      $scope.toggleAll = function() {
        if ($scope.schedule.dateRepeat.length === $scope.ListDateInit.length) {
          $scope.schedule.dateRepeat = [];
        } else if ($scope.schedule.dateRepeat.length === 0 || $scope.schedule.dateRepeat.length > 0) {
          $scope.schedule.dateRepeat = $scope.ListDateInit.slice(0);
        }
      };
      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };
      KeywordService.get($scope.projectId, function(project) {
        $scope.project = project;
        $scope.project.browser = "firefox";
        $scope.project.browserVersion = "41.0.2";
        $scope.project.browserVersionFireFox = "41.0.2";
        $scope.project.browserVersionChrome = "46.0.2490.80";
        $scope.project.browserVersionIE = "11";
        $scope.project.seleniumVersion = "2.48.2";
        $scope.project.os = "ubuntu";

        if($scope.project.value_delay == null){
          $scope.checkDelayTime = false;
        } else {
          $scope.checkDelayTime = true;
        }

        $scope.$watch('project.browser', function(newValue, oldValue, scope) {
          if (newValue === 'ie') scope.project.os = "windows";
          else scope.project.os = "ubuntu";
        });

        $scope.$watch('project.os', function(newValue, oldValue, scope) {
          if (newValue === 'windows' && scope.project.browser !== 'ie') {
            scope.project.os = 'ubuntu';
          }
          if (newValue === 'ubuntu' && scope.project.browser === 'ie') {
            scope.project.os = 'windows'; 
          }
        });

      });

      $scope.showSchedule = function(ev) {
      $mdDialog.show({
        templateUrl: 'app/project/views/keyword/dialog-schedule-function.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        scope: $scope,
        preserveScope: true,
        controller: function() {
            $scope.modSchedule = "OnlyDate";
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.saveSchedule = function() {
              var options = {
                browser: $scope.project.browser,
                browser_version: $scope.project.browserVersion,
                selenium_version : $scope.project.seleniumVersion,
                os : "windows"
              };
              if($scope.checkDelayTime){
                $scope.schedule.value_delay = $scope.project.value_delay;
              } else {
                $scope.schedule.value_delay = null ;
              }
              ScheduleService.create($scope.projectId, $scope.schedule.name , $scope.suiteSelected, options, $scope.schedule, function(data, status){
                $mdDialog.hide();
                if(status === 201){
                  $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Create new Schedule Success')));
                  $scope.listSchedule.push(data);
                } else {
                  $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Create new Schedule Error')));
                }
              });
              
            };
          }
        }).then(function () {
        });
      };
      SuiteService.list($scope.projectId, function(response) {
        $scope.suites = response.suites;
      });

      $scope.deleteSchedule = function(scheduleId) {
        ScheduleService.delete($scope.projectId, scheduleId, function(data, status){
          if(status === 200){
            $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Delete Schedule Success')));
          } else {
            $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Delete Schedule Error')));
          }
        });
      };

      $scope.nextStepExecution = function(ev){
      if ($scope.currentStep ===2 ) {
      $scope.suiteSelected = suiteSelected ;
      } else if($scope.currentStep === 3){
          if($scope.project.browser === "firefox"){
              $scope.project.browserVersion = $scope.project.browserVersionFireFox ;
          } else if($scope.project.browser === "chrome"){
              $scope.project.browserVersion = $scope.project.browserVersionChrome ;
          } else if($scope.project.browser === "ie"){
              $scope.project.browserVersion = $scope.project.browserVersionIE ;
          }
      } else if($scope.currentStep === 4){
        if($scope.checkDelayTime == true){
          
        }
      }
      
      $scope.currentStep = $scope.currentStep + 1;

      if($scope.currentStep === 2){
        $scope.checkSuiteSelected = true;
      }
    };

    $scope.backStepExecution = function(ev){
      $scope.currentStep = $scope.currentStep - 1;
    };

    $scope.selectSuite = function (suiteId) {
      if (_.indexOf(suiteSelected, suiteId) != -1) {
        _.remove(suiteSelected, function(sel) {
          return sel == suiteId;
        });
      } else {
        suiteSelected.push(suiteId);
      }
      if (suiteSelected.length > 0) $scope.checkSuiteSelected = false ;
      else $scope.checkSuiteSelected = true;
    };

	}]);
})