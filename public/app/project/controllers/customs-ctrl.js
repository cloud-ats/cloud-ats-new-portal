define(['project/keyword-module', 'lodash'], function (module, _) {
	'use strict';

	module.registerController('CustomsCtrl', [
    'SharedDataService', '$mdMedia', '$mdSidenav', '$scope', 'CustomKeywordService', '$state', '$stateParams', '$mdDialog', '$mdToast', 
    function (SharedDataService, $mdMedia, $mdSidenav, $scope, CustomKeywordService, $state, $stateParams, $mdDialog, $mdToast) {

		$scope.$parent.isSidenavOpen = true;
    $scope.$parent.isSidenavLockedOpen = $mdMedia('gt-md');

    $scope.$watch(function() { return $mdMedia('gt-md'); }, function(big) {
      $scope.$parent.isSidenavLockedOpen = big;
      $scope.$parent.isSidenavOpen = big;
    });

    $scope.toggleProjectNavLeft = function() {
      $scope.$parent.isSidenavLockedOpen = false;
      $mdSidenav('project-nav-left').toggle();
    };

    $scope.projectId = $stateParams.id;
    $scope.sharedData = SharedDataService;
    
    CustomKeywordService.list($scope.projectId, function(response) {
      $scope.sharedData.project = response;
    });
    
    $scope.parse = function (timestamp) {

      var date = new Date(timestamp);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

      var result = months[date.getMonth()] +" " + date.getDate() +" "+ date.getFullYear();

      return result;
    }

    $scope.clickCustom = function (ev, id) {
      $state.go('app.project.keyword-customs.custom', {id : $scope.projectId, customId : id});
    }
    
		$scope.delete = function (ev, id) {
			var confirm = $mdDialog.confirm()
        .title('Would you like to delete your case?')
        .targetEvent(ev)
        .clickOutsideToClose(true)
        .ok('Delete')
        .cancel('Cancel');
	    $mdDialog.show(confirm).then(function() {
	    	CustomKeywordService.delete($scope.projectId, id, function (data, status) {
	    		if (status === 200) {

	    			_.remove($scope.sharedData.project.customs, function (custom) {
	    				return custom._id === id;
	    			});
	    			$mdToast.show($mdToast.simple().position('top right').textContent('Delete The Group keyword Success!'));
	    		}
	    	});
	    }, function() {
	    });
		}
	}]);
})