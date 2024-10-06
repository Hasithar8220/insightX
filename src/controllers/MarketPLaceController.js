angular.module('app')
  .controller('MarketplaceController', function ($scope, TronService, $http, UtilityService) {
    
    // Initialize polls array
    $scope.polls = [];

    // Fetch all polls from the smart contract
    $scope.loadPolls = async function () {
      try {
        // Call the TronService to fetch the polls from the smart contract
        const polls = await TronService.getPolls();console.log(polls);
        $scope.polls = polls;
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
            UtilityService.showSimpleToast("Poll is not for sale!",7);
          return;
        }

        // Trigger the buyPoll function from the smart contract using TronService
        const result = await TronService.buyPoll(pollId, poll.price);
        alert("Poll purchased successfully!");
        $scope.loadPolls();  // Reload polls after purchase
      } catch (error) {
        console.error("Error purchasing poll:", error);
        alert("Purchase failed! Please try again.");
      }
    };
    
  });
