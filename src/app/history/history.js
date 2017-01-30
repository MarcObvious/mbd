(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.history', {
                    url: '/history/?:{option}&:{start}&:{end}',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        ordersData: (['historyService', '$q', '$log','$stateParams',
                            function (historyService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var option = $stateParams.option;
                                var params = {};
                                if ($stateParams.start && $stateParams.end) {
                                    params.start = $stateParams.start;
                                    params.end = $stateParams.end;
                                }
                                $log.debug('Home::::ResolveHistory::'+option+'::'+params.start+'::'+params.end);

                                if (option === 'entregas') {
                                    historyService.getAllEntregas(params).then(function(data) {
                                        def.resolve({data: data, option: option, dates: params, name:'Histórico de entregas'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (option === 'incidencias') {
                                    historyService.getAllIncidencias(params).then(function(data) {
                                        def.resolve({data: data, option: option, dates: params, name:'Histórico de incidéncias'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    def.reject(false);
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

                var date = new Date();

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.date = new Date(date.getTime() - 24*60*60*1000*7);
                $scope.dateStart.opened = false;

                $scope.dateEnd = {};
                $scope.dateEnd.format = 'dd-MM-yyyy';
                $scope.dateEnd.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateEnd.date = date;
                $scope.dateEnd.opened = false;

                if (ordersData.data) {
                    if(angular.isDefined(ordersData.dates.start)) {
                        $scope.dateStart.date = new Date(Date.parse(ordersData.dates.start));
                    }
                    if(angular.isDefined(ordersData.dates.end)) {
                        $scope.dateEnd.date = new Date(Date.parse(ordersData.dates.end));
                    }

                    $scope.option = ordersData.option;
                    $scope.name = ordersData.name;
                    $scope.ordersData = ordersData.data;

                    $scope.ordersDataSliced = $scope.ordersData.slice(0, 15);
                    $scope.totalItems = $scope.ordersData.length;

                    $scope.currentPage = 2;
                    $scope.numPerPage = 15;

                }

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().replace("T"," ").replace("Z","");
                var end =  $scope.dateEnd.date.toJSON().replace("T"," ").replace("Z","");
                $state.go('root.history', {option: $scope.option, start: start, end: end});
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