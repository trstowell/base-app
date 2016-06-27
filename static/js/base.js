var app = angular.module("APP", ['ngMaterial', 'ngRoute']);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.config(['$interpolateProvider', function($interpolateProvider) {
  // $interpolateProvider.startSymbol('{[');
  // $interpolateProvider.endSymbol(']}');
}]);

app.config( function($routeProvider, $locationProvider) {
     $routeProvider.
         when('/', {
             templateUrl: '/static/partials/home.html'
         }).
         otherwise({
             redirectTo: '/'
         });

         $locationProvider.html5Mode(true);
});

app.controller('HomeController', function($scope, $mdDialog){
    $scope.charities = [
        {'name': 'The Elephant Sanctuary',
        'icon': 'pets'},
        {'name': 'Dana-Farber Cancer Institute',
            'icon': 'place',
        },
        {'name': 'Humane Research Council',
        'icon': 'local_florist'}
    ];
    $scope.cards = [1,2,3];

    $scope.showAlert = function() {
          alert = $mdDialog.alert()
            .title('Attention')
            .textContent('This is an example of how easy dialogs can be!')
            .ok('Close');
          $mdDialog
              .show( alert )
              .finally(function() {
                alert = undefined;
              });
        }
});
