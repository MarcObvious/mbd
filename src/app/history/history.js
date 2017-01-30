(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.history', {
                    url: '/history/?:{option}',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        ordersData: (['historyService', '$q', '$log','$stateParams',
                            function (historyService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var option = $stateParams.option;
                                $log.debug('Home::::ResolveHistory::'+option);

                                if (option === 'entregas') {
                                    historyService.getAllEntregas().then(function(data){
                                        def.resolve({data: data, filterName:'Histórico de entregas'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (option === 'incidencias') {
                                    historyService.getAllIncidencias().then(function(data){
                                        def.resolve({data: data, filterName:'Histórico de incidéncias'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    def.reject(err);
                                }
                                return def.promise;
                            }])
                    },
                    views: {
                        "container@": {
                            controller: 'historyController',
                            templateUrl: 'history/history.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'history'
                    }
                });

        }]);

    app.controller('historyController', ['$log','$scope','$state', 'ordersData',
        function ($log, $scope, $state, ordersData) {

            var init = function () {
                $log.info('App:: Starting HomeController');
                $scope.totalItems = 0;

                $scope.filterBy = ordersData.filterName;
                $scope.ordersData = ordersData.data;
                if (ordersData.data) {
                    $scope.ordersDataSliced = $scope.ordersData.slice(0, 15);
                    $scope.totalItems = $scope.ordersData.length;

                    $scope.currentPage = 2;
                    $scope.numPerPage = 15;

                }

            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);
            };

            $scope.openOrder = function (id_order) {
                $state.go('root.home.orderdetail',{id_order: id_order});
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);


}(angular.module("mbd.history", [
    'ui.router',
    'ngAnimate',
    'historyService'
])));