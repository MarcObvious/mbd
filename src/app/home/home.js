(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.home', {
                    url: '',
                    parent: 'root',
                    resolve: {
                        autentica: (['authService', function (authService) {
                            return authService.autentica();
                        }])
                    },
                    abstract: true,
                    views: {
                        "container@": {
                            templateUrl: 'home/home.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Home'
                    }
                })
                .state('root.home.ordergrid', {
                    url: '/?:{filter_by}/:{id}',
                    parent: 'root.home',
                    resolve: {
                        ordersData: (['homeService', '$q', '$log','$stateParams',
                            function (homeService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var filter_by = $stateParams.filter_by;
                                var id = $stateParams.id;
                                $log.debug('Home::::ResolveOrderGrid::'+filter_by+'::'+id);

                                if (filter_by === 'repartidor' && parseInt(id) !== 0) {
                                    homeService.getOrdersByDeliveryMan({id: id}).then(function(data){
                                        def.resolve({data: data, filterName:'Pedidos del repartidor ' + id});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (filter_by === 'estado' && parseInt(id) !== 0) {
                                    homeService.getOrdersByStatus({id: id}).then(function(data){
                                        def.resolve({data: data, filterName:'Pedidos en estado ' + id});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    homeService.getAllOrders().then(function (data) {
                                        def.resolve({data: data, filterName:'Todos los pedidos'});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }

                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.home": {
                            controller: 'orderGridController',
                            templateUrl: 'home/orderGrid.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Orders'
                    }
                })
                .state('root.home.orderdetail', {
                    url: '/orderDetail/{id_order}',
                    parent: 'root.home',
                    resolve: {
                        orderData: (['homeService', '$q', '$log','$stateParams',
                            function (homeService, $q, $log, $stateParams) {
                                var def = $q.defer();
                                var id = $stateParams.id_order;
                                $log.debug('Home::::ResolveOrderDetail::'+id);

                                homeService.getOrder({id: id}).then(function(data){
                                    def.resolve(data[0]);
                                }, function (err) {
                                    def.reject(err);
                                });

                                return def.promise;
                            }])
                    },
                    views: {
                        "subcontainer@root.home": {
                            controller: 'orderDetailController',
                            templateUrl: 'home/orderDetail.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'OrderDetail'
                    }
                });
        }]);

    app.controller('orderDetailController', ['$log','$scope','$state','orderData', '$rootScope','$timeout', 'homeService',
        function ($log, $scope, $state, orderData, $rootScope, $timeout, homeService) {

            var init = function() {
                $scope.orderData = orderData;
                if (orderData) {
                    $scope.orderData = homeService.classTraductor(orderData);
                    $scope.positions = [];

                    if (angular.isDefined(orderData.lat) && angular.isDefined(orderData.lng)) {
                        $scope.positions.push({pos:[orderData.lat, orderData.lng], name: 0, state_class: orderData.state_class});
                    }

                    if(angular.isDefined(orderData.id_mensajero)){
                        homeService.getLocation({id:orderData.id_mensajero}).then(function(data){

                            if(angular.isDefined(data[0])) {
                                $scope.positions.push({pos:[data[0].lat, data[0].lng], name: 0, state_class: 'motorbike'});

                            }
                        });
                    }

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });
                }
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);

    app.controller('orderGridController', ['$log','$scope','$state','ordersData','$uibModal', 'NgMap','$rootScope','$timeout', 'homeService',
        function ($log, $scope, $state, ordersData, $uibModal, NgMap, $rootScope, $timeout, homeService) {

            var init = function () {
                $log.info('App:: Starting HomeController');
                $scope.totalItems = 0;

                $scope.filterBy = ordersData.filterName;
                $scope.ordersData = ordersData.data;
                if (ordersData.data) {
                    $scope.ordersDataSliced = $scope.ordersData.slice(0, 6);
                    $scope.positions = [{pos: [41.415674, 2.160047], name: 1, state_class: 'poi_encurso'}];
                    //$scope.positions = [];
                    $scope.totalItems = $scope.ordersData.length;

                    $scope.currentPage = 1;
                    $scope.numPerPage = 6;

                    angular.forEach($scope.ordersData, function (data, index) {
                        var data2 = homeService.classTraductor(data);
                        $scope.ordersData[index] = data2;

                        if (angular.isDefined(data.lat) && angular.isDefined(data.lng)) {
                            $scope.positions.push({pos:[data.lat, data.lng], name: index, state_class: data2.state_class});
                        }


                    });

                    $timeout(function() {
                        $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
                    });
                }

            };

            $scope.pageChanged = function () {
                var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);
            };

            $scope.openOrder = function (id_order) {
                $state.go('root.home.orderdetail',{id_order: id_order});
            };

            init();

        }]);


}(angular.module("mbd.home", [
    'ui.router',
    'ngAnimate',
    'homeService',
    'authService'
])));