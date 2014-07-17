var todoApp = angular.module('todoApp', ['ui.router']);

todoApp.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            views: {
                main: {
                    templateUrl: 'login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('todos', {
            url: '/todos',
            loginRequired: true,
            views: {
                main: {
                    templateUrl: 'todo-list.html',
                    controller: 'TodoController'
                }
            }
        });
    
    $urlRouterProvider.otherwise("/login");
});

todoApp.run(function($rootScope, $state, UserService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
        if (toState.loginRequired && !UserService.isAuthenticated()) {
            event.preventDefault();
            $state.go('login');
        }
    });
});

todoApp.service('UserService', function($q, $http) {
    var _user = undefined;
    
    return {
        login: function(user) {
            var d = $q.defer();
            
            $http.post('/users/login', user)
                .success(function(resp) {
                    _user = resp;
                    d.resolve(_user);
                })
                .error(function(err) {
                    console.log(err);
                    d.reject(err);
                });
            
            return d.promise;
        },
        logout: function() {
            var d = $q.defer();
            _user = undefined;
            
            $http.post('/users/logout')
                .success(function(resp) {
                    console.log(resp);
                    d.resolve();
                })
                .error(function(err) {
                    console.log(err);
                    d.reject(err);
                });

            return d.promise;
        },
        getUser: function() {
            return _user;
        },
        isAuthenticated: function() {
            return Boolean(_user);
        }
    };
});

todoApp.controller('LoginController', function(UserService, $location, $scope) {
    $scope.user = {};
    
    $scope.login = function(user) {
        UserService.login(user).then(
            function(user) {
                $location.path('/todos');
            }, 
            function(err) {
                alert(err.message);
            }
        );
    };
});

todoApp.controller('TodoController', function($scope, $http, $location, UserService) {

    $scope.todos = [];

    dpd.on('todos:changed', function(user) {
        loadTodoList();
    });
    
    var loadTodoList = function() {
        // Get all todos
        $http.get('/todos')
            .success(function(todos) {
                $scope.loaded = true;
                $scope.todos = todos;
            }).error(function(err) {
                alert(err);
            });
    };
    
    loadTodoList();
    
    $scope.logout = function() {
        console.log("Logout");
        UserService.logout().then(
            function() {
                $location.path('/login');
            },
            function() {
                $location.path('/login');
            }
        );        
    };
    
    $scope.addTodo = function(title) {
        $http.post('/todos', {
            title: title
        }).success(function(todo) {
            $scope.newTodoTitle = '';
        }).error(function(err) {
            // Alert if there's an error
            return alert(err.message || "an error occurred");
        });
    };

    $scope.changeCompleted = function(todo) {
        // Update the todo
        $http.put('/todos/' + todo.id, {
            completed: todo.completed
        }).error(function(err) {
            return alert(err.message || (err.errors && err.errors.completed) || "an error occurred");
        });
    };

    $scope.removeCompletedItems = function() {
        $http.get('/todos', {
                params: {
                    completed: true
                }
            }).success(function(todos) {
                todos.forEach(function(t) { deleteTodo(t); });
            });
    };

    function deleteTodo(todo) {
        $http.delete('/todos/' + todo.id, {
            params: {
                completed: true
            }
        }).success(function() {
            console.log('deleteTodo: ' + todo.id);
        }).error(function(err) {
            alert(err.message || "an error occurred");
        });
    }
});