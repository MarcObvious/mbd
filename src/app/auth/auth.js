(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.auth', {
                    url: '/auth',
                    parent: 'root',
                    views: {
                        "container@": {
                            controller: 'authController',
                            templateUrl: 'auth/auth.tpl.html'
                        }
                    },
                    /*resolve: {
                        autentica: (['globalService', '$state','$log',  function (globalService, $state, $log) {
                            return globalService.removeStorage(CUSTOM_HEADER);
                        }])

                    },*/
                    data: {
                        pageTitle: 'auth'
                    }
                });
        }]);

    app.controller('authController', ['$scope','$log', 'authService','$state', function ($scope,$log, authService,$state) {
        $scope.myjson={};

        var init = function () {
            $log.info('App:: Starting authController');

            $scope.model={};
            $scope.model.pageTitle=$state.current.data.pageTitle;

            $scope.isAuthenticated = function(){
                authService.getUserInfo().then(function (data) {
                }, function (err) {
                    $log.error(err);
                });
            };
        };

        $scope.submitLogin = function(){
            authService.submitLogin($scope.login.username,$scope.login.password).then(function (data) {
                if(data === true) {
                    $state.go('root.home');
                    return true;
                }
                else {
                    alert('Credenciales incorrectas');
                }
            }, function (err) {
                alert('Credenciales incorrectas');
                $log.error(err);
            });
        };

        init();
    }]);

}(angular.module("mbd.auth", [
    'ui.router',
    'authService'
])));