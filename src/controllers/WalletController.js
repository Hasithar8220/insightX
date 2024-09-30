angular.module('app').controller('WalletController', function ($scope, $rootScope, $window, $http) {

  // Initialize Web3
  const web3 = new Web3(window.ethereum || "http://localhost:8545");

  $scope.connectWallet = async function () {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      $scope.account = accounts[0];  // Get the first account
      console.log("Connected wallet:", $scope.account);

      // Ensure Angular updates the view when account is retrieved
      if (!$scope.$$phase) {
        $scope.$apply();  
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };


  $scope.getShortAccount = function(account) {
    if (account) {
        return account.substring(0, 3) + '....' + account.substring(account.length - 3);
    }
    return ''; // Return an empty string if account is not available
};


});
