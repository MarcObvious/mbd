(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.routes', {
                    url: '/routes/?:{page}:{option}:{start}:{end}',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService',  function (authService) {
                            return authService.autentica();
                        }]),
                        routesData: (['routesService', '$q', '$log','$stateParams',
                            function (routesService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var option = $stateParams.option;
                                var params = {};
                                if ($stateParams.start) {
                                    params.start = $stateParams.start;
                                }
                                else {
                                    var start = new Date();
                                    params.start = start.toJSON().substr(0,10);
                                }
                                $log.debug('Home::::Resolveroutes::'+option+'::'+params.start+'::'+params.end);

                                routesService.getRoutes(params).then(function(data) {
                                    def.resolve({data: data, option: option, dates: params });
                                }, function (err) {
                                    def.reject(err);
                                });

                                return def.promise;
                            }])
                    },
                    views: {
                        "container@": {
                            controller: 'routesController',
                            templateUrl: 'routes/routes.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'routes'
                    }
                });

        }]);

    app.controller('routesController', ['$log','$scope','$state', 'routesData', '$stateParams','ngTableParams',
        function ($log, $scope, $state, routesData, $stateParams, NGTableParams) {

            var init = function () {
                $log.info('App:: Starting HomeController');
                $scope.totalItems = 0;

                $scope.dateStart = {};
                $scope.dateStart.format = 'dd-MM-yyyy';
                $scope.dateStart.dateOptions = { formatYear: 'yy', startingDay: 1 };
                $scope.dateStart.opened = false;
                if(angular.isDefined($stateParams.start)) {
                    $scope.dateStart.date = new Date(Date.parse($stateParams.start));
                }
                else {
                    $scope.dateStart.date = new Date();
                }
                console.log();


                $scope.vm = {};
                $scope.vm.tableParams = new NGTableParams({count:25, sorting:{route_id:'asc'}}, {data: [],counts:[]});

                $scope.name = 'Organizador de rutas';
                $scope.name_csv = 'Rutas_' + $scope.dateStart.date.toJSON().substr(0,10);
                $scope.routesData = false;
                console.log(routesData.data);
                if (angular.isDefined(routesData.data)) {

                    $scope.routesData = true;
                    $scope.routesDataA = [];
                    angular.forEach(routesData.data.good_routes, function (good_routes, index) {
                        //console.log(good_routes);
                        angular.forEach(good_routes.deliveries, function (deliveries, index) {
                            var d = {
                                route_id : good_routes.route_id,
                                order_id : deliveries.order_id,
                                address : deliveries.info[0].address,
                                city : deliveries.info[0].city,
                                zipcode : deliveries.info[0].zipcode,
                                hora_entrega : deliveries.info[0].hora_entrega
                            };
                            $scope.routesDataA.push(d);
                        });
                    });
                    //console.log($scope.routesData);
                    $scope.vm.tableParams = new NGTableParams({count:25, sorting:{route_id:'asc'}}, {data: $scope.routesDataA ,counts:[25,50,100,200]});
                }

            };

            $scope.openDatepicker = function(date) {
                $scope[date].opened = true;
            };

            $scope.mostrar = function() {
                var start =  $scope.dateStart.date.toJSON().substr(0,10);
                $state.go('root.routes', {option: $scope.option, start: start});
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);


}(angular.module("mbd.routes", [
    'ui.router',
    'ngAnimate',
    'routesService'
])));