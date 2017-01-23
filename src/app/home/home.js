(function (app) {
    app.config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('root.home', {
                    url: '/',
                    parent: 'root',
                    resolve: {
                        homeData: (['homeService', '$q', '$log',
                            function (homeService, $q, $log) {
                                $log.info('Home::::ResolveFakeOrders::');
                                var pedidos = [];
                                for (var i = Math.floor((Math.random() * 100) + 1); i > 0; --i) {
                                    var status = { code: Math.floor((Math.random() * 3) + 1)};
                                    if (status.code === 1) {
                                        status.text = 'En curso';
                                    }
                                    else if (status.code === 2) {
                                        status.text = 'Pendiente';
                                    }
                                    else {
                                        status.text = 'Incidéncia';
                                    }
                                    pedidos.push({
                                        id: '#' + Math.floor((Math.random() * 1000) + 1),
                                        destinatario : {
                                            dir: { street: 'C/' + i, cp: '08050', city:'Barcelona'},
                                        },
                                        repartidor: { name: 'Blablabla', id: 1234},
                                        observaciones: { text: 'blablaba'},
                                        status: status,
                                        location: {lat: '54256', lon: '123456'}
                                    });
                                }
                                return pedidos;
                            }]),
                        ordersData: (['homeService', '$q', '$log',
                            function (homeService, $q, $log) {
                                $log.info('Home::::ResolveOrders::');
                                var def = $q.defer();
                                homeService.getOrdersByDelivery().then(function(data){
                                    def.resolve(homeService.convertOrdersByDeliveryToOrders(data));
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    },
                    views: {
                        "container@": {
                            controller: 'HomeController',
                            templateUrl: 'home/home.tpl.html'
                        }
                    },
                    data: {
                        pageTitle: 'Home'
                    }
                });
        }]);

    app.controller('HomeController', ['$log','$scope','$state','homeData','ordersData','$uibModal', 'NgMap',
        function ($log, $scope, $state, homeData, ordersData,$uibModal, NgMap) {

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
                console.log($scope.positions);

                $('#loadingWidget').hide();
/*
                NgMap.getMap().then(function(map) {
                    console.log(map.getCenter());
                    console.log('markers', map.markers);
                    console.log('shapes', map.shapes);
                });

*/
                NgMap.getMap().then(function(map) {
                    $scope.map = map;
                    console.log(map.getCenter());
                    console.log('markers', map.markers);
                    console.log('shapes', map.shapes);
                });
            };


            $scope.openOrder = function (id_order) {
                $scope.modalInstance = $uibModal.open({
                    templateUrl: 'home/singleOrder.modal.tpl.html',
                    size: 'lg',
                    controller: 'singleOrder',
                    resolve: {
                        orderData:  (['homeService', '$q', '$log',
                            function (homeService, $q, $log) {
                                var def = $q.defer();
                                homeService.getOrder(id_order).then(function(data){
                                    def.resolve(data[0]);
                                }, function (err) {
                                    def.reject(err);
                                });
                                return def.promise;
                            }])
                    }
                });
                $scope.modalInstance.result.then(function () {

                }, function () {

                });
            };

            init();

        }]);
    app.controller('singleOrder', ['$scope', '$uibModalInstance', 'orderData','NgMap','$timeout',
        function ($scope, $uibModalInstance, orderData, NgMap,$timeout) {
            var init = function (){
                $scope.orderData = orderData;
                console.log(orderData);
                $timeout(function(){
                    //any code in here will automatically have an apply run afterwards
                    NgMap.getMap().then(function(map) {
                        $scope.map = map;
                        console.log(map.getCenter());
                        console.log('markers', map.markers);
                        console.log('shapes', map.shapes);

                    });
                });

            };
            init();

        }]);

    app.directive('maps',['homeService', function(homeService) {
        return {
            templateUrl:'home/maps.tpl.html',
            restrict: 'E',
            scope: {
                mapsData: '='
            },
            replace: true
        };
    }]);
}(angular.module("mbd.home", [
    'ui.router',
    'ngAnimate',
    'homeService'
])));