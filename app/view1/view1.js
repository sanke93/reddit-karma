//'use strict';

angular.module('myApp.view1', ['ngRoute', 'twitterApp.services'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope, twitterService, $q, $http) {
	console.log('hi',$scope);
	scope_ctrl = $scope;
	twitterService.initialize();
	$scope.buttonClicked = function(){
		console.log("hi", $scope.subreddit)
		twitterService.getLatestTweets($scope.subreddit).then(function(data) {
		    $scope.tweets = data.statuses;
		    console.log("data", $scope.tweets)
		}, function() {
		    $scope.rateLimitError = true;
		});
		
		$http({
		  method: 'GET',
		  url: 'https://www.reddit.com/top.json?r='+$scope.subreddit+'&t=all'
		  //&t=all'
		}).then(function successCallback(response) {
				$scope.redditPosts = response.data.data.children;


				$q.all($scope.redditPosts.map(function (item) {
					// $http({
					//   method: 'POST',
					//   url: 'ttp://text-processing.com/api/sentiment/',
					//   data: {
					//   	text:item.data.title
					//   }
					// });
					$http.post("http://sentiment.vivekn.com/api/text/", {txt:item.data.title});
				    
				}))
				.then(function (results) {
				    var resultObj = {};
				    results.forEach(function (val, i) {
				        resultObj[$scope.redditPosts[i]] = val.data;
				    });
				    console.log("sentiment", resultObj);        
				});
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	}

	$scope.tweets = []; //array of tweets

    //when the user clicks the connect twitter button, the popup authorization window opens
    $scope.connectButton = function() {
        twitterService.connectTwitter().then(function() {
            if (twitterService.isReady()) {
                //if the authorization is successful, hide the connect button and display the tweets
                $('#connectButton').fadeOut(function() {
                    $('#getTimelineButton, #signOut').fadeIn();
                    //$scope.refreshTimeline();
                    $scope.connectedTwitter = true;
                });
            } else {

            }
        });
    }

    //sign out clears the OAuth cache, the user will have to reauthenticate when returning
    $scope.signOut = function() {
        twitterService.clearCache();
        $scope.tweets.length = 0;
        $('#getTimelineButton, #signOut').fadeOut(function() {
            $('#connectButton').fadeIn();
            $scope.$apply(function() {
                $scope.connectedTwitter = false
            })
        });
    }

    //if the user is a returning user, hide the sign in button and display the tweets
    if (twitterService.isReady()) {
        $('#connectButton').hide();
        $('#getTimelineButton, #signOut').show();
        $scope.connectedTwitter = true;
        
    }
});