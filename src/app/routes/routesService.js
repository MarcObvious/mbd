angular.module('routesService', [])
    .factory('routesService', ['$resource', '$q',
        function ($resource, $q) {
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
                //getdeliveryroutes/2017-04-28
                getRoutes: function (params) {
                    var def = $q.defer();
                    this.api('getdeliveryroutes/'+params.start+'/'+params.city).get({}, {}, function(data){
                        def.resolve(data.data);
                    }, function (err) {
                        def.reject(err);
                    });

                    return def.promise;
                }

            };
        }]);



