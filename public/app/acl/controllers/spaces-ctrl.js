define(['acl/module', 'lodash'], function (module, _) {
	
	'use strict';
	module.registerController('SpacesCtrl', ['TenantAdminService', '$filter','$scope', '$mdDialog', 'SpaceService', '$mdToast',
		function (TenantAdminService, $filter, $scope, $mdDialog, SpaceService, $mdToast) {

		$scope.spaces = [];
		$scope.currentSpace = null ;
		$scope.edit = false;

		$scope.parse = function (timestamp) {
      var date = new Date(timestamp);
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      var result = months[date.getMonth()] +" " + date.getDate() +" "+ date.getFullYear();
      return result;
	  };

		var initData =  function() {
			SpaceService.list(function(data){
				$scope.spaces = data ;
				$scope.originSpaces = angular.copy($scope.spaces);
				if ($scope.spaces.length > 0) {
					$scope.currentSpace = $scope.spaces[0] ;
				}
			});
		}

		initData();

		$scope.editSpace = function (ev){
			$scope.edit = true;
			ev.stopPropagation();
		};

		$scope.$watch('searchText', function(newText, oldText) {
      if (newText !== oldText) {
      	if(newText){
      		$scope.listUserSearch = [];
      		TenantAdminService.search(newText, function (data, status) {
      			angular.forEach(data, function(value, key) {
			  			$scope.listUserSearch.push(value);
						});
					});
      	}
      }
    });

		$scope.selectSpace = function(space){
				$scope.currentSpace = angular.copy(space);
				$scope.edit = false;
		};

		$scope.addUser = function(user){
    	$scope.currentSpace.listUser.push(user);
			$scope.searchText = "";
		};

		$scope.removeUser = function(user){
			var index = $scope.currentSpace.listUser.indexOf(user);
    	$scope.currentSpace.listUser.splice(index, 1);
		};

		$scope.clickSave = function() {
			SpaceService.update($scope.currentSpace, function(resp, status){
				if(status == 201){
					$scope.currentSpace._id = resp._id;
    			$mdToast.show($mdToast.simple().position('top right').textContent('Submit Space Success!'));
    			$scope.edit = false;
    		} else {
    			$mdToast.show($mdToast.simple().position('top right').textContent('Submit Space Error!'));
    		}
			});
		};
		$scope.clickNewSpace = function() {
			var space = {
          name: undefined,
          desc: undefined,
          listUser: []
        };
			$scope.currentSpace = space;
			$scope.spaces.push(space);
			$scope.edit = true;
		};

		$scope.clickCancel = function(){
			$scope.spaces = $scope.originSpaces;
			$scope.currentSpace = $scope.spaces[0];
			$scope.edit = false;
		};
		$scope.deleteSpace = function(space){
			var index = $scope.spaces.indexOf(space);
			SpaceService.delete(space._id, function(resp, status){
				$scope.spaces.splice(index, 1);
				$scoe.currentSpace = scope.spaces[0];
				if(status == 200){
    			$mdToast.show($mdToast.simple().position('top right').textContent('Delete Space Success!'));
    		} else {
    			$mdToast.show($mdToast.simple().position('top right').textContent('Delete Space Error!'));
    		}
			});
		};

	}]);
});