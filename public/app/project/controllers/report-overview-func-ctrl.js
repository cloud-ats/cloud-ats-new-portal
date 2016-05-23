define(['project/module', 'lodash'], function (module, _) {
  'use strict';
  module.registerController('ReportFuncCtrl', 
    ['$mdMedia', '$mdToast', 'EventService', '$mdDialog', '$scope', '$rootScope', '$state', '$stateParams', '$templateRequest', '$compile', '$cookies', 'KeywordService',
    function($mdMedia, $mdToast, EventService, $mdDialog, $scope, $rootScope, $state, $stateParams, $templateRequest, $compile, $cookies, KeywordService) {

      $scope.projectId = $stateParams.id;

      $scope.suiteReports = [];

      $scope.dataReports = [];

      $scope.project = null;

      $scope.query = {
        'current': 1,
        'total': 0
      };

      $scope.delay = {
        value:0
      };
      $scope.listReports = [];
      $scope.$parent.isSidenavOpen = true;
      $scope.$parent.isSidenavLockedOpen = $mdMedia('gt-md');

      $scope.$watch(function() { return $mdMedia('gt-md'); }, function(big) {
        $scope.$parent.isSidenavLockedOpen = big;
        $scope.$parent.isSidenavOpen = big;
      });

      KeywordService.get($scope.projectId, function(response) {
        $scope.project = response;
        if($scope.project.lastJobId) {
          getListReport($scope.project._id, 1);
        }
      });

      $scope.$watch('query.current', function (newPage, oldPage) {
        if($scope.project) {
          getListReport($scope.project._id, newPage);
        }
      });

      $scope.redirectTo = function(jobId) {
        $state.go('app.project.keyword-reports.reportJob', {id: $scope.projectId, jobId: jobId });
      }

      var getListReport = function(projectId, index) {

        KeywordService.getListReport(projectId, index, function(dataRes,status) {
          if (dataRes.length) {
            $scope.query.total = dataRes[0].total;
          }
          _.forEach(dataRes, function (obj) {
            if (obj.numberFailedSuite > 0) {
              obj.test_result = 'Fail';
            } else obj.test_result = 'Pass';
          });
          $scope.listReports = dataRes;
        });
      }

      $scope.downloadResult = function(projectId,jobId) {
        KeywordService.download(projectId, jobId ,function (data,status) {
          var file = new Blob([data], {type: 'application/x-gzip'});
          var link=document.createElement('a');
          link.href=window.URL.createObjectURL(file);
          link.download="final-result.tar.gz";
          link.click();
        });
      }

      $scope.viewLog = function(ev) {
        KeywordService.log($scope.project._id, function (data, status) {
          if (status == 200) {
            $scope.project.log = data;
            $mdDialog.show({
            templateUrl: 'app/project/views/keyword/dialog-file-log.tpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            scope: $scope,
            preserveScope: true,
            controller: function() {
              $scope.cancel = function () {
                $mdDialog.hide();
              }
            }
            }).then(function () {
            });
          }
        });
      }

      $scope.runLastSuites = function() {

        var selected = [];
        _.forEach($scope.project.lastSuites, function(sel) {
          selected.push(sel._id);
        });

        var options = $scope.project.lastJobOptions;
        KeywordService.run($scope.projectId, selected, options, function (data, status) {
          switch (status) {
            case 201:
              $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('You have submitted project job')));
              $scope.project.status = "RUNNING";
              $scope.project.log = undefined;
              $scope.project.watchUrl = undefined
              break;
            case 204:
              $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Your project has been already running')));
              break;
            default:
              $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Can not submmit your project job')));
          }
        });
      }

      $scope.stopProject = function (projectId) {
        KeywordService.stop(projectId, function (data, status) {
          if (status == 200) {
            $mdToast.show($mdToast.simple().position('top right').textContent($rootScope.getWord('Your project has been stopped')));
            $scope.project.status = 'READY';
            $scope.project.isBuilding = false;
          }

        });
      }

      var updateStatus = function(msg) {
        $scope.$apply(function() {
          var job = JSON.parse(msg.data);
          if (job.project_id === $scope.project._id) {
            $scope.project.status = job.project_status;
            $scope.project.watchUrl = job.watch_url;
            $scope.project.log = job.log;
            $scope.project.isBuilding = job.isBuilding;
            if (job.project_status === 'READY') {

              var report = { 
                  created_date : undefined,  
                  job_id: undefined,
                  numberPassedSuite : 0,
                  numberFailedSuite : 0,
                  duration: 0 
              };
              KeywordService.updateStatus($scope.project._id, job._id, function (data, status) {
                if(status === 404) return;
                $scope.project.log = data.log;
                $scope.project.lastRunning = data.created_date;
                report.created_date = data.created_date;
                report.jobId = data.jobId;
                report.duration = data.duration;
                report.stt = 1;
                report.numberPassedSuite = data.numberPassedSuite;
                report.numberFailedSuite = data.numberFailedSuite;

                if (report.numberFailedSuite) {
                  report.test_result = 'Fail';
                } else report.test_result = 'Pass';

                if ($scope.listReports.length === 10) {
                  $scope.listReports.pop();
                }
                
                _.forEach($scope.listReports, function (iter) {
                  iter.stt = iter.stt + 1;
                });

                $scope.listReports.unshift(report);
              });

            }
          }
        })
      }

      EventService.feed(updateStatus);
  }]);
});