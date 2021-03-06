(function (app) {

    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', 'localStorageServiceProvider',
        function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {
            $urlRouterProvider.otherwise('/');
            $httpProvider.interceptors.push('cInterceptor');
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            localStorageServiceProvider
                .setPrefix('')
                .setStorageType('localStorage')
                .setStorageCookie(7, '/')
                .setStorageCookieDomain('lmbd.iaproject.net/')
                .setNotify(true, true);


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

    app.controller('AppController', ['$scope', '$log','geolocationService', function ($scope, $log, geolocationService) {
        $log.info('App:: Starting AppController');
        $log.info('App::Geolocation::' + geolocationService.getNearestCity());
    }]);

    app.controller('FrontController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting FrontController');
    }]);

    app.controller('FooterController', ['$scope', '$log', function ($scope, $log) {
        $log.info('App:: Starting FooterController');
    }]);

}(angular.module("mbd", [
    'ngResource',
    'ngAnimate',
    'globalService',
    'geolocationService',
    'mbd.home',
    'mbd.history',
    'mbd.routes',
    'mbd.auth',
    'LocalStorageModule',
    'ui.bootstrap',
    'templates-app',
    'templates-common',
    'ui.router.state',
    'ui.router',
    'cInterceptor',
    'genericDirectives',
    'ngMap',
    'ngTable',
    'ngCsv'

])));
