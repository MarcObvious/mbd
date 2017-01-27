(function (app) {

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
            $urlRouterProvider.otherwise('/');
            $httpProvider.interceptors.push('cInterceptor');
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            //Root view, very important resolve data async before states
            $stateProvider
                .state('root', {
                    url: '',
                    abstract: true,
                    views: {
                        'header': {
                            templateUrl: 'header.tpl.html',
                            controller: 'FrontController'
                        },
                        'footer': {
                            templateUrl: 'footer.tpl.html',
                            controller: 'FooterController'
                        }
                    }
                });
            //Remove hashtag from URL
            $locationProvider.html5Mode(true);
        }
    ]);

    app.run(['$log', function ($log) {
    }]);

    app.controller('AppController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting AppController');
    }]);

    app.controller('FrontController', ['$scope', '$log','$location', function ($scope, $log, $location) {
        $log.info('App:: Starting FrontController');
    }]);

    app.controller('FooterController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting FooterController');
    }]);

}(angular.module("mbd", [
    'ngResource',
    'ngAnimate',
    'globalService',
    'mbd.home',
    'mbd.auth',
    'ui.bootstrap',
    'templates-app',
    'templates-common',
    'ui.router.state',
    'ui.router',
    'cInterceptor',
    'genericDirectives',
    'ngMap'

])));
