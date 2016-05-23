define(['project/keyword-module'], function (module) {
  'use strict';

  module.registerController('CustomActionCtrl', [
    'SharedDataService', '$scope', 'CustomKeywordService', '$state', '$stateParams', '$mdDialog',
    function (SharedDataService, $scope, CustomKeywordService, $state, $stateParams, $mdDialog) {
      $scope.projectId = $stateParams.id;
      $scope.sharedData = SharedDataService;

      $scope.create = function (ev) {
        $mdDialog.show({
            
          templateUrl: 'app/project/views/keyword/custom-create-dialog.tpl.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          scope: $scope,
          preserveScope: true,
          controller: function() {

            $scope.custom = {};
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.submit = function() {
              $scope.custom.steps = [];
              CustomKeywordService.create($scope.projectId, $scope.custom, function (data, status){
                if (status === 201) {
                  $mdDialog.hide();
                  $state.go('app.project.keyword-customs.custom', {id : $scope.projectId, customId : data._id});
                }
              });
            };
          }
        })
      }
    }]);
})