/**
 * Created by hadock on 8/09/15.
 */
angular.module('genericDirectives', [])

    .directive('chat',function(){
        return {
            templateUrl: 'directives/templates/chat.tpl.html',
            restrict: 'E',
            replace: true,
        };
    })

    .directive('stats',function() {
        return {
            templateUrl: 'directives/templates/stats.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {
                'model': '=',
                'comments': '@',
                'number': '@',
                'name': '@',
                'colour': '@',
                'details': '@',
                'type': '@',
                'goto': '@'
            }

        };
    })

    .directive('header',function(){
        return {
            templateUrl:'directives/templates/header.tpl.html',
            restrict: 'E',
            replace: true,
        };
    })
    /*
     .directive('headerNotification',function() {
     return {
     templateUrl: 'directives/templates/header-notification.tpl.html',
     restrict: 'E',
     replace: true,
     };
     })
     */
    .directive('notifications',function(){
        return {
            templateUrl:'directives/templates/notifications.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {
                actionData: '='
            }
        };
    })

    .directive('feedback',function(){
        return {
            templateUrl:'directives/templates/feedback.tpl.html',
            restrict: 'E',
            replace: true,
        };
    })

    .directive('sidebar',['$location','$state','globalService',
        function($location, $state, globalService) {
            return {
                templateUrl:'directives/templates/sidebar.tpl.html',
                restrict: 'E',
                replace: true,
                scope: {
                },
                controller:function($scope, $rootScope, authService){


                    var init = function(){
                        $scope.collapseVar = 999;
                        $scope.multiCollapseVar = 0;

                        $scope.check(1);
                        globalService.getSideBarContent().then(function(content){
                            $scope.sidebarContent = content;
                        });
                        $scope.logged = authService.autentica();
                    };

                    $rootScope.$on('logged.loggedChange', function(event, aValues) {
                        console.log('changed!');
                        $scope.logged = aValues.logged;
                    });

                    $scope.check = function(x){

                        if(x === $scope.collapseVar){
                            $scope.collapseVar = 0;
                        } else {
                            $scope.collapseVar = x;
                        }

                    };

                    $scope.multiCheck = function(y){

                        if(y === $scope.multiCollapseVar){
                            $scope.multiCollapseVar = 0;
                        } else {
                            $scope.multiCollapseVar = y;
                        }

                    };

                    init();
                }
            };
        }])

    .directive('maps', [function() {
        return {
            templateUrl:'home/maps.tpl.html',
            restrict: 'E',
            replace: true,
            controller: ('mapsController', ['$scope', '$log', '$rootScope',
                function($scope, $log, $rootScope) {
                    var init = function() {
                        $log.debug('Maps::::mapsController::');
                        //$scope.centerMap = [41.390205, 2.154007];
                    };

                    $rootScope.$on('positions.positionsChange', function(event, aValues) {
                        $scope.centerMap = angular.isDefined(aValues.positions[0]) ? aValues.positions[0].pos : [41.390205, 2.154007];
                        $scope.positions = aValues.positions;
                    });

                    init();
                }])
        };
    }])



    .directive('sidebarSearch',['$state', function($state) {
        return {
            templateUrl:'directives/templates/sidebar-search.tpl.html',
            restrict: 'E',
            replace: true,
            scope: {},
            controller:function($scope){
                var init = function(){
                    $scope.string_search = '';
                    $scope.selectedMenu = 'home';
                };

                $scope.searchF = function () {
                    $state.go('root.home.orderdetail',{id_order:$scope.string_search});
                    $scope.string_search = '';
                };

                init();
            }
        };
    }])




    .directive('contentItem',['$compile','$log', function ($compile,$log) {
        var imageTemplate = '<div class="entry-photo"><h2>&nbsp;</h2><div class="entry-img"><span><a href="{{rootDirectory}}{{content.data}}"><img ng-src="{{rootDirectory}}{{content.data}}" alt="entry photo"></a></span></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var videoTemplate = '<div class="entry-video"><h2>&nbsp;</h2><div class="entry-vid"><h1>{{content.data}}</h1></div><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.description}}</div></div></div>';
        var noteTemplate = '<div class="entry-note"><h2>&nbsp;</h2><div class="entry-text"><div class="entry-title">{{content.title}}</div><div class="entry-copy">{{content.data}}</div></div></div>';

        var getTemplate = function(contentType) {
            var template = '';

            switch(contentType) {
                case 'image':
                    template = imageTemplate;
                    break;
                case 'video':
                    template = videoTemplate;
                    break;
                case 'notes':
                    template = noteTemplate;
                    break;
            }

            return template;
        };

        var linker = function(scope, element, attrs) {
            //scope.rootDirectory = 'images/';
            ///$log.debug(element);
            // angular.element(element).html($compile(getTemplate(scope.content.content_type))(scope));
            // console.log($compile(markup)(scope));
            element.html(getTemplate(scope.content.content_type));

            $compile(element.contents())(scope);
        };

        return {
            restrict: "E",
            link: linker,
            scope: {
                content:'='
            }
        };
    }]);








