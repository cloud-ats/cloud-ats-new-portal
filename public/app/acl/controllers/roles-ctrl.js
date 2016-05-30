define(['acl/module', 'lodash'], function (module, _) {
	
	'use strict';
	module.registerController('RolesCtrl', ['TenantAdminService', 'SpaceService', 'RoleService', '$filter','$scope', '$mdToast',
		function (TenantAdminService, SpaceService, RoleService, $filter, $scope, $mdToast) {
      
      $scope.permTemplate = {
        tenant: {
          manage_spaces: false,
          view_spaces: false,
          grant_permission: false
        },
        space: {
          update_space: false,
          manage_projects: false,
          view_projects: false,
          grant_permission: false
        },
        project: {
          manage_functional: false,
          upload_selenium: false,
          manage_performance: false,
          grant_permission: false,
          view_functional: false,
          view_performance: false
        }
      }
      $scope.checkCreate = false;
      $scope.roles = [];
      $scope.listSpaces = [];
      $scope.listprojects = [];

      $scope.clickSave = function(){
        var permTransf = [];
        _.forEach($scope.currentRole.permissions, function(perm, key) {
        	 _.forEach(perm, function(feature, obj) {
        		_.forEach(feature, function(value,action) {
        			var rule = {
        				rule:undefined
        			};
      				if(value == true && obj != "$$hashKey") {
      					rule.rule = obj+":"+action+"@";
      					permTransf.push(rule);
      				}
        		});
	        });
        });
        var role = angular.copy($scope.currentRole);
        role.permissions = permTransf ;
        RoleService.update(role, function(resp, status){
        	if (status == 201) {
            var role = _.find($scope.roles, function (role) {
              return role._id === $scope.currentRole._id;
            });
            role = resp;
            $scope.currentRole._id = resp._id;
            $scope.currentRole.name = resp.name;
            $scope.currentRole.space = getSpace(resp.space._id);
            $scope.currentRole.permissions = buildPermission(resp);
            console.log()
            $scope.edit = false;

        		$mdToast.show($mdToast.simple().position('top right').textContent('Submit Role Success!'));
        	} else {
        		$mdToast.show($mdToast.simple().position('top right').textContent('Submit Role Error!'));
        	}
        });
      }

      $scope.clickNew = function() {
        $scope.currentRole = undefined ;
        $scope.edit = true;
        $scope.checkCreate = true;
        var permTemplate = angular.copy($scope.permTemplate);
        var role = {
          name: undefined,
          space: {},
          permissions: [ permTemplate ],
          listUser: []
        };

        $scope.currentRole = role;
        $scope.roles.push(role);
      }

      $scope.normalize = function(str) {
        var terms = str.split('_');
        var normalizeStr = ''
        _.forEach(terms, function(term) {
          normalizeStr += term.charAt(0).toUpperCase() + term.slice(1);
          normalizeStr += ' ';
        });
        return normalizeStr;
      }

      var initData =  function() {
      	SpaceService.list(function(data){
          $scope.listSpaces = data ;
          RoleService.list(function(resp, status) {
	          _.forEach(resp, function(role) {
	            role.permissions = buildPermission(role);
	            RoleService.listUser(role._id, function(resp, status){
	            	role.listUser = resp;
	            });
	            if(role.space && role.space._id){
	            	role.space = getSpace(role.space._id);
	            }
	            $scope.roles.push(role);
	          });
	          if ($scope.roles.length > 0) {
	            $scope.currentRole = $scope.roles[0];
	            $scope.originRoles = angular.copy($scope.roles);
	          }
	        })
        });
      }

      var getSpace = function(spaceId){
      	var result = _.find($scope.listSpaces, function (obj) {
      		return obj._id === spaceId;
      	});
      	return result;
      }

      initData();

      var buildPermission = function(role){
      	var permissions = [];
      	var permTemplate = angular.copy($scope.permTemplate);
      	_.forEach(role.permissions, function(perm) {
          if (perm.rule === "*:*@fsoft:*") {
            _.forEach(permTemplate, function(feature) {
              _.forEach(feature, function(value, key) {
                feature[key] = true;
              });
            });
          } else {
          	var foo = perm.rule.split('@')[0];
						var feature = foo.split(':')[0];
    				var action = foo.split(':')[1];
    				permTemplate[feature][action] = true;
          }
        });
        permissions.push(permTemplate);
        return permissions ;
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

      $scope.addUser = function(user){
      	$scope.currentRole.listUser.push(user);
				$scope.searchText = "";
			};

      $scope.removeUser = function(user){
        var index = $scope.currentRole.listUser.indexOf(user);
        $scope.currentRole.listUser.splice(index, 1);
      };

			$scope.selectRole = function(role){
				$scope.currentRole = angular.copy(role);
				$scope.edit = false;
			};
			$scope.deleteRole = function(roleId){
				RoleService.delete(roleId, function(data, status){
					if(status==201){
						_.remove($scope.roles, function (obj) {
		  				return roleId === obj._id;
		  			});
		  			$scope.currentRole = $scope.roles[0];
						$mdToast.show($mdToast.simple().position('top right').textContent('Delete Role Success!'));
					} else {
						$mdToast.show($mdToast.simple().position('top right').textContent('Delete Role Error!'));
					}
				});
			};
			$scope.editRole = function(ev){
				$scope.edit = true;
        $scope.checkCreate = false;
				ev.stopPropagation();
			};
			$scope.clickCancel = function(){
				$scope.roles = $scope.originRoles ;
				$scope.currentRole = $scope.roles[0];
				$scope.edit = false;
        $scope.checkCreate = false;
			};

	}]);
});