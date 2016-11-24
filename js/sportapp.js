var module = angular.module("sportApp", ["ui.router"]);

module.config(function ($urlRouterProvider, $stateProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider.state("home", {
        url: "/",
        templateUrl: "templates/home.html",
        controller: "homeCtrl"
    }).state("addgame", {
        url: "/addgame",
        templateUrl: "templates/addgame.html",
        controller: "addgameCtrl"
    }).state("changegame",{
        url: "/changegame",
        templateUrl: "templates/changegame.html",
        controller: "changegameCtrl"
    });
    
});
module.controller("changegameCtrl",function ($scope,$rootScope,sportService){
    var promise = sportService.getGames();
    promise.then(function (data){
        $scope.games = data;
    });
    
    sportService.getTeams().then(function (data) {
        console.log(data);
        $scope.teams = data;
    });
    
    $scope.resolveTeam = function (id){
        for(var i = 0; i < $scope.teams.length; i++){
            if(id === $scope.teams[i].id){
                return $scope.teams[i].lagnamn;
            }
        }
    };
    
    $scope.removeGame = function (id){
        sportService.removeGame(id);
    };
    $scope.fillForm = function (id){
      for(var i = 0; i <  $scope.games.length;i++){
          if( $scope.games[i].id === id){
           $scope.formId = id;
           $scope.formHL = $scope.games[i].hemmalag;
           $scope.formBL = $scope.games[i].bortalag;
           $scope.formPH = $scope.games[i].poanghemma;
           $scope.formPB = $scope.games[i].poangborta;
              
          }          
      }
        
    };
    
    $scope.submitForm = function (){
        sportService.updateGame( $scope.formId,$scope.formHL,$scope.formBL, $scope.formPH, $scope.formPB);
        
    }
    
});

module.controller("homeCtrl", function ($scope, $rootScope, sportService) {
    var promise = sportService.getTable();
    promise.then(function (data) {
        $scope.table = data;
    });


});

module.controller("addgameCtrl", function ($scope, $rootScope, sportService) {

    sportService.getTeams().then(function (data) {
        console.log(data);
        $scope.teams = data;
    });

    $scope.loggIn = function () {
        sportService.loggIn($scope.username, $scope.password);
    };
    $scope.addGame = function () {
        sportService.addGame(Number($scope.hl), Number($scope.bl), $scope.ph, $scope.pb)
    };
});

module.service("sportService", function ($q, $http, $rootScope, $route) {
    this.getTable = function () {
        var deffer = $q.defer();
        var url = "http://localhost:8080/SportsApp/webresources/table";
        $http.get(url).success(function (data) {
            deffer.resolve(data);
        });
        return deffer.promise;
    };
    this.getTeams = function () {
        var deffer = $q.defer();
        var url = "http://localhost:8080/SportsApp/webresources/teams";
        var auth = "Basic " + window.btoa($rootScope.user + ":" + $rootScope.pass);

        $http({
            url: url,
            method: "GET",
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            deffer.resolve(data);
        });
        return deffer.promise;
    };
    this.addGame = function (hl, bl, ph, pb) {
        var data = {
            hemmalag: hl,
            bortalag: bl,
            poanghemma: ph,
            poangborta: pb
        };
        var url = "http://localhost:8080/SportsApp/webresources/game";
        var auth = "Basic " + window.btoa($rootScope.user + ":" + $rootScope.pass);

        $http({
            url: url,
            method: "POST",
            data: data,
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            console.log("Match tillagd");

        }).error(function (data, status) {
            console.log("det blev fel");
        });
    };
    
    this.updateGame = function (id,hl, bl, ph, pb) {
        var data = {
            id:id,
            hemmalag: hl,
            bortalag: bl,
            poanghemma: ph,
            poangborta: pb
        };
        var url = "http://localhost:8080/SportsApp/webresources/game";
        var auth = "Basic " + window.btoa($rootScope.user + ":" + $rootScope.pass);

        $http({
            url: url,
            method: "PUT",
            data: data,
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            console.log("Match uppdaterad");

        }).error(function (data, status) {
            console.log("det blev fel");
        });
    };
    this.loggIn = function (username, password) {
        var url = "http://localhost:8080/SportsApp/webresources/login";
        var auth = "Basic " + window.btoa(username + ":" + password);

        $http({
            url: url,
            method: "POST",
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            console.log("Du är inloggad!");
            $rootScope.isLoggedIn = true;
            $rootScope.user = username;
            $rootScope.pass = password;
        })
                .error(function (data, status) {
                    console.log("du är inte inloggad!");
                });
    };
    this.getGames = function () {
        var deffer = $q.defer();
        var url = "http://localhost:8080/SportsApp/webresources/games";
        var auth = "Basic " + window.btoa($rootScope.user + ":" + $rootScope.pass);

        $http({
            url: url,
            method: "GET",
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            deffer.resolve(data);
        });
        return deffer.promise;
    };
    
    this.removeGame = function (id){
        var url = "http://localhost:8080/SportsApp/webresources/game/"+id;
        var auth = "Basic " + window.btoa($rootScope.user + ":" + $rootScope.pass);

        $http({
            url: url,
            method: "DELETE",
            headers: {'Authorization': auth}
        }).success(function (data, status) {
            console.log("Match borttagen");
           $route.reload();
        }).error(function (data, status) {
            console.log("det blev fel");
        });
        
    };
});