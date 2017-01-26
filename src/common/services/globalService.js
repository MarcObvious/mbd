/* 
 * Global Services Test Módule
 */
angular.module('globalService', [])
    .factory('globalService', ['$resource', '$q', '$log',
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
                getAction: function () {
                    //Service action with promise resolve (then)
                    var def = $q.defer();
                    this.api().get({}, {}, function (data) {
                        $log.warn('Api::data:: ');
                        $log.warn(data);
                        def.resolve(data);
                    }, function (err) {
                        def.reject(err);
                    });
                    return def.promise;
                },

                getUrlParam: function (parameterName) {
                    parameterName += "=";
                    var parameterValue = (location.hash.indexOf(parameterName)) ? location.hash.substring(location.hash.indexOf(parameterName) + parameterName.length) : null;
                    if (parameterValue !== null && parameterValue.indexOf('&') >= 0) {
                        parameterValue = parameterValue.substring(0, parameterValue.indexOf('&'));
                    }
                    return parameterValue;
                },
                getSideBarContent: function () {
                    var def = $q.defer();

                    var cpedidos = 0;
                    var estados = {
                        filtro_estado: [
                            {n: 'En reparto', c: 0, id: 1},
                            {n: 'Pendiente', c: 0, id: 2},
                            {n: 'Entregado', c: 0, id: 3},
                            {n: 'Incidéncias', c: 0, id: 4}],
                        filtro_repartidor: []
                    };
                    this.api('orders').get({}, {}, function (data) {
                        if(data.data) {
                            angular.forEach(data.data, function(obd) {
                                estados.filtro_repartidor.push({n: obd.id_mensajero, id: obd.id_mensajero, c: obd.num_orders});
                                cpedidos += obd.num_orders;

                                if (obd.num_orders){
                                    angular.forEach(obd.orders, function(order) {
                                        switch (order.order_state) {
                                            case 'Pago acceptado':
                                                ++estados.filtro_estado[1].c;
                                                break;
                                            case 'Albarán de entrega impreso.':
                                                ++estados.filtro_estado[2].c;
                                                break;
                                            default:
                                                ++estados.filtro_estado[1].c;
                                                break;
                                        }
                                        //orders.push(order);
                                    });
                                }
                            });
                        }
                        estados.filtro_estado.push({n: 'Todos los pedidos', c: cpedidos, id:0});
                        estados.filtro_repartidor.push({n: 'Todos los repartidores', c: cpedidos, id:0});

                        def.resolve(estados);
                    }, function (err) {
                        def.reject(err);
                    });
                     return def.promise;
                }


                };
        }]);



