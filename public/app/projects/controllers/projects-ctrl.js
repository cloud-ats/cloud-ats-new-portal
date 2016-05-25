define(['projects/module','lodash'], function (module, _) {
  'use strict';

  module.registerController('ProjectsCtrl', 
    ['SharedDataService', 'ProjectService', 'SeleniumUploadService', '$scope', '$mdBottomSheet', 'KeywordService', 'PerformanceService', '$mdDialog','$mdToast', 
    function(SharedDataService, ProjectService, SeleniumUploadService, $scope, $mdBottomSheet, KeywordService, PerformanceService, $mdDialog, $mdToast) {

    $scope.sharedData = SharedDataService;
    
    var parse = function (timestamp) {

      var date = new Date(timestamp);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

      var result = months[date.getMonth()] +" " + date.getDate() +" "+ date.getFullYear();

      return result;
    };

    $scope.projects = [];

    ProjectService.list(function (data, status) {
      _.forEach(data, function (project) {
        project.created_date = parse(project.created_date);
      });

      $scope.sharedData.projects = data;
    });

    $scope.clickProject = function ($event, _id) {
      $scope.flex = 11 ;
      $scope.projectName = $event.currentTarget.innerText;
      $scope.currentId = _id;
      $mdBottomSheet.show({
        templateUrl: 'app/projects/views/project-bottom-sheet.tpl.html',
        scope: $scope,
        preserveScope: true,
        controller: function () {
          // console.log($scope);
        }
      }).then(function (clickedItem) {
      })
    };


  $scope.showDeleteProject = function(ev) {
    $scope.wrongPassword = true ;
    $mdDialog.show({
        
        templateUrl: 'app/projects/views/delete-project-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        scope: $scope,
        preserveScope: true,
        controller: function() {

          $scope.form = {};
          $scope.$watch('form.projectName', function (newValue, old) {
            if($scope.projectName !== $scope.form.projectName && $scope.form.projectName){
              $scope.wrongName = true;
             } else {
              $scope.wrongName = false;
             };
          });

          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.submit = function() {
            ProjectService.delete($scope.currentId, $scope.form.projectName, $scope.form.password, function (data, status){
              if (status === 200) {
                _.remove($scope.sharedData.projects, function (project) {
                  return project._id === $scope.currentId;
                });
                $mdDialog.hide();
                $mdBottomSheet.hide();
                $mdToast.show($mdToast.simple().position('top right').textContent('Delete Project Success!'));
              } else {
                $scope.wrongPassword = false ;
              }
            });
          };
        }
      })
    }
    
    $scope.clone = function (id, ev, name) {
      $mdDialog.show({
          
        templateUrl: 'app/projects/views/clone-data-dialog.tpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        scope: $scope,
        preserveScope: true,
        controller: function () {

          $scope.oldData = name;
          $scope.data_name = undefined;
          $scope.title = "Project";

          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.submit = function() {
            ProjectService.clone(id, $scope.data_name, function (data, status){
              if (status === 200) {
                data.created_date = parse(data.created_date);
                $scope.sharedData.projects.push(data);
                $mdDialog.hide();
                $mdToast.show($mdToast.simple().position('top right').textContent('The project has been cloned!'));
              }
            });
          };
        }
      })
    }

  }]);
})