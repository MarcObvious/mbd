angular.module('homeService', [])
    .factory('homeService', ['$resource', '$q', '$log',
        function ($resource, $q, $log) {
            return {
                api: function (extra_route) {
                    if (!extra_route) {
                        extra_route = '';
                    }
                    return $resource(API_URL + '/' + extra_route, {}, {
                        query: {
                            timeout: 15000
                        },
                        save: {
                            timeout: 15000,
                            method: 'POST'
                        },
                        get: {
                            timeout: 15000,
                            method: 'GET'
                        }
                    });
                },
                getAllOrders: function (params) {
                    var def = $q.defer();
                    this.getOrdersByDelivery(params).then(function(data){
                        this.convertOrdersByDeliveryToOrders(data).then(function(orders){
                            def.resolve(orders);
                        });
                    });
                    /*
                     this.api().get(params, {}, function (data) {

                     */
                    return def.promise;
                },
                getOrdersByDelivery: function (params) {
                    var def = $q.defer();
                    this.api('orders').get(params, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },

                getOrdersByDeliveryMan: function (params) {
                    var def = $q.defer();
                    this.api('orders_by_deliveryman/'+ params.id).get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getOrdersByStatus: function (params) {
                    var def = $q.defer();
                    this.api('orders_by_deliveryman/'+ params.id).get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                getOrder: function (params) {
                    var def = $q.defer();
                    this.api('order_detail/'+params.id).get({}, {}, function (data) {
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },
                convertOrdersByDeliveryToOrders: function (obds) {
                    var orders = [];
                    angular.forEach(obds, function(obd) {
                        if (obd.orders.length !== 0){
                            angular.forEach(obd.orders, function(order) {
                                orders.push(order);
                            });
                        }
                    });
                    return orders;
                },
                classTraductor: function (orderData) {
                        switch (orderData.order_state) {
                            case 'Pago acceptado':
                                orderData.state_class = 'pendiente';
                                orderData.state_name = 'Pendiente';
                                break;
                            case 'Albarán de entrega impreso.':
                                orderData.state_class = 'encurso';
                                orderData.state_name = 'En curso';
                                break;
                            default:
                                orderData.state_class = 'incidencia';
                                orderData.state_name = 'Incidéncia';
                                break;
                        }

                    return orderData;
                }

            };
        }]);



