var app = angular.module("APP", ['ngMaterial', 'ngRoute', 'ngCookies']);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
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

app.run(function($cookies) {
    // var expireDate = new Date();
    // expireDate.setDate(expireDate.getDate() + 7);
    //
    // $cookies.put("CartID", '111', {expires: expireDate, path: '/'});
    // console.log($cookies.get("CartID"));
    // console.log(expireDate);
});

app.controller('HomeController', function($scope, $mdDialog, $mdSidenav, CartFactory){

    $scope.charities = [
        {
            'name': 'The Elephant Sanctuary',
            'icon': 'pets',
            'description': ["The Elephant Sanctuary in Tennessee, founded in 1995, is the nation's largest natural habitat refuge developed specifically for endangered African and Asian elephants.",
                    "The Sanctuary operates on 2,700 acres in Hohenwald, Tennessee-85 miles southwest of Nashville. The Elephant Sanctuary exists to provide captive elephants with individualized care, the companionship of a herd, and the opportunity to live out their lives in a safe haven dedicated to their well-being; and to raise public awareness of the complex needs of elephants in captivity, and the crisis facing elephants in the wild.",
                    "As a true sanctuary, The Elephant Sanctuary is not intended to provide entertainment, and it is therefore closed to the general public."],

            'url': 'http://www.elephants.com/',
            'ein': 7257
        },
        {
            'name': 'Dana-Farber Cancer Institute',
            'icon': 'place',
            'description': ["Founded in 1947, Dana-Farber Cancer Institute provides expert, compassionate care to children and adults with cancer while advancing the understanding, diagnosis, treatment, cure, and prevention of cancer and related diseases.",
                "Since 1948, the Jimmy Fund has supported the fight against cancer in children and adults at the Dana-Farber Cancer Institute, helping to raise the chances of survival for cancer patients around the world. The Institute employs about 4,000 people supporting more than 250,000 patient visits a year, is involved in some 700 clinical trials, and is internationally renowned for its blending of research and clinical excellence."],
            "url": "http://www.dana-farber.org",
            "ein": 3597

        },
        {
            'name': 'Earthjustice',
            'icon': 'local_florist',
            'description': ["Earthjustice is a public interest law firm dedicated to protecting the magnificent places, natural resources, and wildlife of this earth and to defending the right of all people to a healthy environment. We bring about far-reaching change by enforcing and strengthening environmental laws on behalf of hundreds of organizations, coalitions and communities.", "Established as the Sierra Club Legal Defense Fund in 1971, Earthjustice has a legal staff of more than 50 in eight offices around the country. Earthjustice uses federal and state environmental laws to protect the environment by taking government agencies to court for failing to enforce our nation's environmental laws, and corporations for breaking them. Earthjustice does this work on behalf of hundreds of community and environmental groups, providing legal services free of charge."],
            'url': 'http://earthjustice.org/',
            'ein': 3638
        }
    ];
    $scope.cards = [1,2,3];
    $scope.showCustom = function(charity) {
        console.log(charity.name);
               $mdDialog.show({
                  clickOutsideToClose: true,
                  scope: $scope,        
                  preserveScope: true,
                   templateUrl: '/static/partials/charityDialog.tmpl.html',
                   local: {charity: charity},
                  controller: function DialogController($scope, $mdDialog) {
                        $scope.charity = charity;
                        $scope.closeDialog = function() {
                            $mdDialog.hide();
                        }
                  }
               });
            };

    $scope.toggleLeft = function() {
        $mdSidenav('left').toggle();
        CartFactory.add({'listing_id': 123, 'name': 'bracelet'});
  };

    $scope.add = CartFactory.add;
    $scope.set = CartFactory.set;
    $scope.empty = CartFactory.empty;

});

app.factory('CartFactory', function($cookies) {

    var cart = {
        'quantity': 0,
        'total': 0,
        'listings': []
    };

    cart.add = function() {
        cart.listings.push(
            {
                'listing_id': '123',
                'price': 3,
                'quantity': 1,
                'selected_variations': {}
            });
        cart.quantity = cart.quantity + 1;
        cart.total = cart.quantity * 3;
        console.log(cart);
        cart.set();
    };

    cart.set = function(){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);

        $cookies.putObject("cart", cart, {expires: expireDate, path: '/'});
        console.log($cookies.getObject("cart"));
    };

    cart.empty = function() {
        cart = {};
    };

    return cart;
});