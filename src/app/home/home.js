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
                    url: '/?:{filter_by}',
                    parent: 'root.home',
                    resolve: {
                        ordersData: (['homeService', '$q', '$log','$stateParams',
                            function (homeService, $q, $log, $stateParams) {
                                $log.info('Home::::ResolveOrders::');
                                var def = $q.defer();
                                var filter_by = ($stateParams.filter_by);
                                if(!filter_by) {
                                    homeService.getOrdersByDelivery().then(function(data){
                                        def.resolve(homeService.convertOrdersByDeliveryToOrders(data));
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
                        pageTitle: 'OrderDetail'
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
                        pageTitle: 'OrderGrid'
                    }
                });
        }]);

    app.controller('HomeController', ['$log','$scope','$state','$uibModal', 'NgMap',
        function ($log, $scope, $state,$uibModal, NgMap) {

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
                $scope.model.pageTitle=$state.current.data.pageTitle;
                $scope.ordersData = ordersData;
                $scope.ordersDataSliced = $scope.ordersData.slice(0, 6);
                $scope.positions = [{pos:[41.415674,2.160047],name:1}];


                $scope.totalItems = ordersData.length;
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

    app.directive('maps', [function() {
        return {
            templateUrl:'home/maps.tpl.html',
            restrict: 'E',
            replace: true,
            controller: ('mapsController', ['$scope', '$log', '$rootScope', function($scope, $log, $rootScope) {
                var init = function() {
                    $scope.centerMap = [41.390205, 2.154007];
                    $log.info('Home::::mapsController::');
                };

                $rootScope.$on('positions.positionsChange', function(event, aValues){
                    console.log('position changed');

                    $scope.centerMap = aValues.positions.pos ? aValues.positions.pos : [41.390205, 2.154007];
                    console.log(aValues);

                    $scope.positions = aValues.positions;
                });
                init();
            }])
        };
    }]);
}(angular.module("mbd.home", [
    'ui.router',
    'ngAnimate',
    'homeService'
])));