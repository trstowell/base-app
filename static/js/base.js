var app = angular.module("APP", ['ngMaterial', 'ngRoute', 'ngCookies']);

app.config(['$httpProvider', function ($httpProvider, $http) {
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

app.run(function($rootScope, $cookies, $http) {
    console.log("Checking for guest_id cookie.");

    var guest_id = $cookies.get('guest_id');

    if (guest_id) {
        console.log("Welcome back Guest: ".concat(guest_id));
        // console.log($cookies.getObject("cart"));
    }
    else {
        console.log("guest_id cookie NOT found. Generating...");

        var api_key = 'bntabkgzjfwtblbko25g34b8';
        var url = "http://127.0.0.1:5000/generate";

        $http.get(url)
            .then(
                function successCallback (response){
                    console.log('Setting $COOKIE guest_id to:  '.concat(response.data.guest_id));
                    var expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 7);

                    $cookies.put("guest_id", response.data.guest_id, {expires: expireDate, path: '/'});
                },
                function errorCallback (response){
                    console.log(response);
                }
            );
    }



});

app.controller('HomeController', function($scope, $filter, $mdDialog, $mdSidenav, CartFactory, APIFactory){
    $scope.listings = [];
    
    $scope.charities = [
        {
            'name': 'The Elephant Sanctuary',
            'category': 'animal',
            'icon': 'pets',
            'description': ["The Elephant Sanctuary in Tennessee, founded in 1995, is the nation's largest natural habitat refuge developed specifically for endangered African and Asian elephants.",
                    "The Sanctuary operates on 2,700 acres in Hohenwald, Tennessee-85 miles southwest of Nashville. The Elephant Sanctuary exists to provide captive elephants with individualized care, the companionship of a herd, and the opportunity to live out their lives in a safe haven dedicated to their well-being; and to raise public awareness of the complex needs of elephants in captivity, and the crisis facing elephants in the wild.",
                    "As a true sanctuary, The Elephant Sanctuary is not intended to provide entertainment, and it is therefore closed to the general public."],

            'url': 'http://www.elephants.com/',
            'ein': 7257
        },
        {
            'name': 'Dana-Farber Cancer Institute',
            'category': 'cancer',
            'icon': 'place',
            'description': ["Founded in 1947, Dana-Farber Cancer Institute provides expert, compassionate care to children and adults with cancer while advancing the understanding, diagnosis, treatment, cure, and prevention of cancer and related diseases.",
                "Since 1948, the Jimmy Fund has supported the fight against cancer in children and adults at the Dana-Farber Cancer Institute, helping to raise the chances of survival for cancer patients around the world. The Institute employs about 4,000 people supporting more than 250,000 patient visits a year, is involved in some 700 clinical trials, and is internationally renowned for its blending of research and clinical excellence."],
            "url": "http://www.dana-farber.org",
            "ein": 3597

        },
        {
            'name': 'Earthjustice',
            'category': 'environment',
            'icon': 'local_florist',
            'description': ["Earthjustice is a public interest law firm dedicated to protecting the magnificent places, natural resources, and wildlife of this earth and to defending the right of all people to a healthy environment. We bring about far-reaching change by enforcing and strengthening environmental laws on behalf of hundreds of organizations, coalitions and communities.", "Established as the Sierra Club Legal Defense Fund in 1971, Earthjustice has a legal staff of more than 50 in eight offices around the country. Earthjustice uses federal and state environmental laws to protect the environment by taking government agencies to court for failing to enforce our nation's environmental laws, and corporations for breaking them. Earthjustice does this work on behalf of hundreds of community and environmental groups, providing legal services free of charge."],
            'url': 'http://earthjustice.org/',
            'ein': 3638
        }
    ];
    
    // TODO
    
    
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
  };

    $scope.add = function(listing){
        CartFactory.add(listing);
        CartFactory.set();
    };


    getListings();
    

    function getListings(){
        APIFactory.getListings()
            .then(
                function(response){
                $scope.listings = response.data;
                    console.log($scope.listings);
                },
                function(error){

                });
    }
    //
    // $scope.filterFunctions = {
    //     'animal': function (listings) {
    //         $scope.animal_listings = $.grep(listings, function (listing, i) {
    //             console.log('listing-here');
    //             return listing.category == 'animal';
    //         });
    //
    //         // return animal_listings;
    //
    //     },
    //     'cancer': function (listings) {
    //         $scope.cancer_listings = $.grep(listings, function (listing, i) {
    //             return listing.category == 'cancer';
    //         });
    //     },
    //     'environment': function (listings) {
    //         $scope.environment_listings = $.grep(listings, function (listing, i) {
    //             return listing.category == 'environment';
    //         });
    //     }
    //
    // };

});

app.factory('APIFactory', function($http, $cookies) {
    var base_url = "http://45.55.81.255:5000";
    // var base_url = "http://127.0.0.1:5000";
    var APIFactory = {};

    APIFactory.getListings = function(){  // add a filter word, 'all','animal','etc'
        var url = base_url + '/listings';
        console.log('Polling ' + url);

        return $http.get(url);
    };

    APIFactory.postCart = function(cart){
        var url = base_url + '/cart/' + $cookies.get("guest_id");
        console.log('POSTing cart: ' + url);
        console.log(cart);

        return $http({
            method: 'POST',
            url: url,
            data: {'total': 3, 'quantity': 4, 'listings': []},
            headers: {'Content-Type': 'application/json'}
        })

        $http.post(url, cart)
            .then(
                function successCallback(response){
                    console.log(response);
                },
                function errorCallback(response){

                });

    };

    return APIFactory;

});

app.controller('CartController', function($scope, $http, $cookies, CartFactory, APIFactory) {

    $scope.cart = CartFactory.cart;
    $scope.set = CartFactory.set;
    $scope.empty = CartFactory.empty;


    $scope.category_icons = {
        animal: 'pets',
        cancer: 'place',
        environment: 'local_florist'
    };

    $scope.animal_icon = 'animal';
    $scope.cancer_icon = 'accessible';
    $scope.environment = 'local_florist';

    $scope.donation = CartFactory.cart.total;

    $scope.sendCart = function() {
        var guest_id = $cookies.get('guest_id');

          $http({
          url: 'http://127.0.0.1:5000/cart/' + guest_id,
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          data: CartFactory.cart
        });
    }
});

app.controller('SidenavController', function($scope, $mdSidenav, $http) {

    $scope.listing = {
        'listing_id': '',
        'price': '',
        'quantity': 1,
        'selected_variations': {}
    };

    $scope.categories = {
        'animal': 'pets',
        'cancer': 'place',
        'environment': 'local_florist'
    };

    $scope.sendForm = function () {
        var url = 'http://127.0.0.1:5000/listing/'.concat($scope.listing.listing_id);
        
        $http.post(url, $scope.listing)
            .then(
                function successCallback(response){
                    console.log(response);
                },
                function errorCallback(response){

                });
    };

});

app.factory('CartFactory', function($cookies) {

    var existingCart = $cookies.getObject("cart");
    var cart = {};

    existingCart ? cart = existingCart : cart = {'quantity': 0, 'total': 0, 'listings': []};


    function add(listing) {
        listing._id = 'REMOVED';
        cart.quantity += listing.quantity;
        cart.total += (listing.quantity * listing.price);
        console.log(listing);
        cart.listings.push(listing);
    }

    function setCookie(){
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 7);

        $cookies.putObject("cart", cart, {expires: expireDate, path: '/'});
        console.log("Setting $COOKIE 'cart': ");
        console.log($cookies.getObject("cart"));
    }

    return {
        add: add,
        set: setCookie,
        cart: cart
    };
});