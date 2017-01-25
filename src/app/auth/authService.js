/* 
 * Api Test Módule
 */
angular.module('authService', [])
        .factory('authService', ['$resource', '$q', '$log', 'globalService','$state',
            function ($resource, $q, $log, globalService, $state) {
                return {
                    api: function (extra_route) {
                        if (!extra_route) {
                            extra_route = '';
                        }
                        return $resource(API_URL + '/auth' + extra_route, {}, {
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
                    getUserInfo: function () {
                        //Service action with promise resolve (then)
                        var def = $q.defer();
                        this.api('').get({}, {}, function (data) {
                            def.resolve(data);
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    autentica: function () {
                        return globalService.getStorage(CUSTOM_HEADER).then(function (data) {
                            if (data == null || data == "no-token") {
                                globalService.setStorage(CUSTOM_HEADER, "no-token");
                                $state.go('root.auth');
                            }

                            return true;
                        });
                    },
                    submitLogin: function (username,password) {
                        //Service action with promise resolve (then)
                        var def = $q.defer();
                        postData = {
                            username:username,
                            password:password
                        };
                        this.api().save({}, postData, function (data) {
                            if(data.token){
                                globalService.removeStorage(CUSTOM_HEADER);
                                globalService.removeStorage('user_data');
                                globalService.setStorage('user_data', {id: data.data.id, username: data.data.username, email: data.data.email, level: data.data.level});
                                globalService.setStorage(CUSTOM_HEADER, data.token);
                                def.resolve(true);
                            }
                            else {
                                def.reject(data);
                            }
                        }, function (err) {
                            def.reject(err);
                        });
                        return def.promise;
                    },
                    testFunction: function () {
                        alert('testFunction');
                    }
                };
            }]);



