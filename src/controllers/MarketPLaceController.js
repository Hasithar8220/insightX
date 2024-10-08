angular.module('app')
  .controller('MarketplaceController', function ($scope, TronService, $http,$routeParams, UtilityService, InsightService) {
    
    // Initialize polls array
    $scope.polls = [];
    $scope.loadingpolls=null;

    // Fetch all polls from the smart contract
    $scope.loadPolls = async function () {
      try {
        $scope.loadingpolls = true;
        // Call the TronService to fetch the polls from the smart contract
        const polls = await TronService.getPolls();console.log(polls);
        $scope.polls = polls;
        $scope.loadingpolls = false;
        $scope.$apply();  // Ensure UI updates with data
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    // Call this function when the controller loads
    $scope.loadPolls();

    // Buy a poll
    $scope.buyPoll = async function (pollId) {
      try {
        const poll = $scope.polls.find(p => p.id === pollId);

        // Ensure the poll is for sale
        if (!poll.isForSale) {
            UtilityService.showSimpleToast("Poll is not for sale!",5000);
          return;
        }

        // Trigger the buyPoll function from the smart contract using TronService
        const result = await TronService.buyPoll(pollId, poll.price);
        UtilityService.showSimpleToast("Poll purchased successfully!",5000);
        $scope.loadPolls();  // Reload polls after purchase
      } catch (error) {
        console.error("Error purchasing poll:", error);
        alert("Purchase failed! Please try again.");
      }
    };

    $scope.getpoll = async function(){
       $scope.loadingpolls=true;
        let d={};
        d.pollHash = $routeParams.id;
        let json = await InsightService.getmetadata(d);
        $scope.poll = JSON.parse(json.data.jsonobj);
        $scope.loadingpolls=false;
        $scope.$apply();
    }

    $scope.vote = async function(val){
      
       
       let d={};
       d.pollhash = $routeParams.id;
       d.vote = val;
       let json = await InsightService.vote(d);
       
       UtilityService.showSimpleToast("Success!",5000);
       
   }
    
  });
