define([
  'angular',
  'angular-couch-potato',
  'angular-ui-router',
  'angular-messages',
  'angular-drag-and-drop-lists',
  'angular-material-data-table',
  'ng-file-upload'
], function (ng, couchPotato) {
  'use strict';

  var module = ng.module('app.project.keyword', ['ui.router', 'ngMessages', 'dndLists', 'md.data.table', 'ngFileUpload']);

  module.config(['$stateProvider', '$couchPotatoProvider', function ($stateProvider, $couchPotatoProvider) {
    $stateProvider
    .state('app.project.keyword-suites', {
      url: '/project/:id/keyword/suites',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/suites-search-box.tpl.html',
          controller: 'SuitesActionCtrl'
        },
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/suites.tpl.html',
          controller: 'SuitesCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/suites-ctrl',
              'project/controllers/suites-action-ctrl',
              'project/controllers/execution-func-ctrl',
              'project/services/shared-data-service',
              'services/suite-service',
              'services/keyword-service'
            ])
          }
        },
        'header-box@app.project': {
          templateUrl: 'app/project/views/keyword/suites-header-box.tpl.html',
          controller: 'SuitesActionCtrl'
        }
      },
      data: {
        title: 'Project Keyword Suites',
        requireLogin: true
      }
    })
    .state('app.project.keyword-suites.suite', {
      url: '/:suiteId',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/suite-detail-action.tpl.html',
          controller: 'SuiteActionCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/controllers/suite-detail-action-ctrl',
              'project/services/shared-data-service',
              'services/suite-service',
              'services/case-service'
            ])
          }
        },
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/suite-detail.tpl.html',
          controller: 'SuiteDetailCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/suite-detail-ctrl',
              'project/services/shared-data-service',
              'services/suite-service',
              'services/case-service'
            ])
          }
        }
      },
      data: {
        title: 'Project Keyword Suite Detail',
        requireLogin: true
      }
    })
    .state('app.project.keyword-cases', {
      url: '/project/:id/keyword/cases',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/cases-search-box.tpl.html',
          controller: 'CasesActionCtrl'
        },
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/cases.tpl.html',
          controller: 'CasesCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/cases-ctrl',
              'project/controllers/cases-action-ctrl',
              'project/controllers/execution-func-ctrl',
              'project/services/shared-data-service',
              'services/suite-service',
              'services/case-service',
              'services/keyword-service'
            ])
          }
        },
        'header-box@app.project': {
          templateUrl: 'app/project/views/keyword/cases-header-box.tpl.html',
          controller: 'CasesActionCtrl'
        }
      },
      data: {
        title: 'Project Keyword Cases',
        requireLogin: true
      }
    })
    .state('app.project.keyword-cases.case', {
      url: '/:caseId',
      views: {
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/case-detail.tpl.html',
          controller: 'CaseDetailCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/case-detail-ctrl',
              'services/case-service',
              'services/keyword-service',
              'services/custom-keyword-service',
              'services/data-service'
            ])
          }
        },
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/case-detail-search-box.tpl.html'
        }
      },
      data: {
        title: 'Project Keyword Case Detail',
        requireLogin: true
      }
    })
    .state('app.project.keyword-cases.case.data', {
      url: '/data?projectName&caseName&dataId&params',
      views: {
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/data-driven-in-case.tpl.html',
          controller: 'DataInCaseCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/data-in-case-ctrl',
              'project/controllers/data-action-ctrl',
              'services/case-service',
              'services/data-service'
            ])
          }
        },
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/data-driven-in-case-search-box.tpl.html',
          controller: 'DataActionCtrl'
        }
      },
      data: {
        title: 'Project Keyword Case Data Driven',
        requireLogin: true
      }
    })
    .state('app.project.keyword-data', {
      url: '/project/:id/keyword/data',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/data-driven-search-box.tpl.html',
          controller: 'DataActionCtrl'
        },
        'sub-content@app.project': {
          controller: 'DataCtrl',
          templateUrl: 'app/project/views/keyword/data-driven-list.tpl.html',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/data-ctrl',
              'project/controllers/data-action-ctrl',
              'project/services/shared-data-service',
              'services/data-service'
            ])
          }
        },
        'header-box@app.project': {
          templateUrl: 'app/project/views/keyword/data-driven-header-box.tpl.html',
          controller: 'DataActionCtrl'
        }
      },
      data: {
        title: 'Project Keyword Data Driven',
        requireLogin: true
      }
    })
    .state('app.project.keyword-data.detail', {
      url: '/:dataId',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/data-driven-in-case-search-box.tpl.html',
          controller: 'DataActionCtrl'
        },
        'sub-content@app.project': {
          controller: 'DataDetailCtrl',
          templateUrl: 'app/project/views/keyword/data-driven-detail.tpl.html',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/data-detail-ctrl',
              'project/controllers/data-action-ctrl',
              'project/services/shared-data-service',
              'services/data-service'
            ])
          }
        },
      },
      data: {
        title: 'Project Keyword Data Driven',
        requireLogin: true
      }
    })
    .state('app.project.keyword-customs', {
      url: '/project/:id/keyword/customs',
      views: {
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/customs-search-box.tpl.html',
          controller: 'CustomActionCtrl'
        },
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/customs.tpl.html',
          controller: 'CustomsCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/customs-ctrl',
              'project/controllers/customs-action-ctrl',
              'project/controllers/execution-func-ctrl',
              'project/services/shared-data-service',
              'services/custom-keyword-service',
              'services/keyword-service',
              'services/suite-service'
            ])
          }
        },
        'header-box@app.project': {
          templateUrl: 'app/project/views/keyword/customs-header-box.tpl.html',
          controller: 'CustomActionCtrl'
        }
      },
      data: {
        title: 'Project Keyword Customs',
        requireLogin: true
      }
    })
    .state('app.project.keyword-customs.custom', {
      url: '/:customId',
      views: {
        'sub-content@app.project': {
          templateUrl: 'app/project/views/keyword/custom-detail.tpl.html',
          controller: 'CustomDetailCtrl',
          resolve: {
            deps: $couchPotatoProvider.resolveDependencies([
              'project/directives/project-nav',
              'project/controllers/custom-detail-ctrl',
              'services/case-service',
              'services/keyword-service',
              'services/custom-keyword-service',
              'services/data-service'
            ])
          }
        },
        'search-box@app': {
          templateUrl: 'app/project/views/keyword/custom-detail-search-box.tpl.html'
        }
      },
      data: {
        title: 'Project Keyword Custom Detail',
        requireLogin: true
      }
    })
  }]);

  couchPotato.configureApp(module);

  module.run(function($couchPotato) {
    module.lazy = $couchPotato;
  });

  return module;
});