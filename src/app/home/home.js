(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.home', {
                    url: '',
                    parent: 'root',
                    abstract: true,
                    views: {
                        "container@": {
                            controller: 'HomeController',
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
                                $log.info('Home::::ResolveOrders::');
                                var def = $q.defer();
                                var filter_by = $stateParams.filter_by;
                                var id = $stateParams.id;

                                $log.debug(filter_by);
                                $log.debug(id);

                               if (filter_by == 'repartidor' && parseInt(id) !== 0) {
                                    homeService.getOrdersByDeliveryMan({id:id}).then(function(data){
                                        def.resolve({data: data, filterName:'Pedidos del repartidor ' + id});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else if (filter_by == 'estado' && parseInt(id) !== 0) {
                                    homeService.getOrdersByStatus({id:id}).then(function(data){
                                        def.resolve({data: data, filterName:'Pedidos en estado ' + id});
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    homeService.getOrdersByDelivery().then(function (data) {
                                        var data2 = homeService.convertOrdersByDeliveryToOrders(data);
                                        def.resolve({data: data2, filterName:'Todos los pedidos'});
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
                                $log.info('Home::::ResolveOrderDetail::');
                                var def = $q.defer();
                                if($stateParams.id_order){
                                    homeService.getOrder($stateParams.id_order).then(function(data){
                                        def.resolve(data[0]);
                                    }, function (err) {
                                        def.reject(err);
                                    });
                                }
                                else {
                                    def.reject();
                                }
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

    app.controller('HomeController', ['$log','$scope','$state', 'NgMap',
        function ($log, $scope, $state, NgMap) {

            var init = function() {

            };

            init();
        }]);

    app.controller('orderDetailController', ['$log','$scope','$state','orderData', '$rootScope',
        function ($log, $scope, $state, orderData, $rootScope) {

            var init = function() {
                $scope.orderData = orderData;
                console.log(orderData.lat);
                console.log(orderData.lng);
                $scope.positions = {pos:[orderData.lat, orderData.lng]};

                //$scope.positions = [{pos:[41.390205,2.154007],name:1}];

                $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});
            };

            $scope.goBack = function(){
                $state.go('root.home.ordergrid');
            };

            init();
        }]);

    app.controller('orderGridController', ['$log','$scope','$state','ordersData','$uibModal', 'NgMap','$rootScope',
        function ($log, $scope, $state, ordersData, $uibModal, NgMap, $rootScope) {

            var init = function () {
                $log.info('App:: Starting HomeController');
                $scope.model = {};
                $scope.model.pageTitle = $state.current.data.pageTitle;
                $scope.ordersData = ordersData.data;
                $scope.ordersDataSliced = $scope.ordersData.slice(0, 6);
                $scope.positions = [{pos:[41.415674,2.160047],name:1}];


                $scope.totalItems = $scope.ordersData.length;
                $scope.filterBy = ordersData.filterName;
                $scope.currentPage = 1;

                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };

                $scope.pageChanged = function() {
                    $log.log('Page changed to: ' + $scope.currentPage);
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage), end = begin + $scope.numPerPage;
                    $scope.ordersDataSliced = $scope.ordersData.slice(begin, end);
                };


                $scope.numPerPage = 6;

                angular.forEach(ordersData, function(data,index){
                    if (data.lat && data.lng) {
                        $scope.positions.push({pos:[data.lat,data.lng],name:index});
                    }
                    console.log(data);
                });

                $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});

                console.log($scope.positions);

                $('#loadingWidget').hide();
                /*
                 NgMap.getMap().then(function(map) {
                 console.log(map.getCenter());
                 console.log('markers', map.markers);
                 console.log('shapes', map.shapes);
                 });

                 */
                /*  NgMap.getMap().then(function(map) {
                 $scope.map = map;
                 console.log(map.getCenter());
                 console.log('markers', map.markers);
                 console.log('shapes', map.shapes);
                 });*/
            };


            $scope.openOrder = function (id_order) {

                $state.go('root.home.orderdetail',{id_order:id_order});
            };

            init();

        }]);
    app.controller('singleOrder', ['$scope', '$uibModalInstance', 'orderData','NgMap','$timeout','$rootScope',
        function ($scope, $uibModalInstance, orderData, NgMap,$timeout, $rootScope) {
            var init = function (){
                $scope.orderData = orderData;
                console.log(orderData.lat);
                console.log(orderData.lng);
                //$scope.positions = {pos:[orderData.lat, orderData.lng]};

                $scope.positions = [{pos:[41.390205,2.154007],name:1}];

                $rootScope.$emit('positions.positionsChange', {positions: $scope.positions});

                /*  $timeout(function(){
                 //any code in here will automatically have an apply run afterwards
                 NgMap.getMap().then(function(map) {
                 $scope.map = map;
                 console.log(map.getCenter());
                 console.log('markers', map.markers);
                 console.log('shapes', map.shapes);

                 });
                 });*/

            };
            init();

        }]);


}(angular.module("mbd.home", [
    'ui.router',
    'ngAnimate',
    'homeService'
])));