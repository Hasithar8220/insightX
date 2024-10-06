angular.module('app').controller('WalletController', function ($scope, $rootScope, $window, $http) {

  // Initialize Web3 for MetaMask (Ethereum)
  const web3 = new Web3(window.ethereum || "http://localhost:8545");

  // MetaMask Wallet Connection
  $scope.connectWallet_MetaMask = async function () {
    try {
      // Request account access from MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      $scope.account = accounts[0];  // Get the first account
      console.log("Connected MetaMask wallet:", $scope.account);

      // Ensure Angular updates the view when account is retrieved
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    } catch (error) {
      console.error("MetaMask wallet connection failed:", error);
    }
  };

  // Retry logic to fetch TronLink account
  function retryFetchAccount(retries = 5, delay = 500) {
    return new Promise((resolve, reject) => {
      const checkAccount = () => {
        const account = window.tronWeb && window.tronWeb.defaultAddress.base58;
        if (account) {
          resolve(account);
        } else if (retries > 0) {
          setTimeout(() => {
            retries -= 1;
            checkAccount();
          }, delay);
        } else {
          reject(new Error("Failed to retrieve TronLink wallet address after retries."));
        }
      };
      checkAccount();
    });
  }

  // Check TronLink wallet connection (TronWeb)
  $scope.connectWallet = async function () {
    try {
      // Check if TronLink and TronWeb are available
      if (window.tronLink) {
        // Request account access via TronLink (if supported)
        if (window.tronLink.request) {
          await window.tronLink.request({ method: 'tron_requestAccounts' });
        } else {
          console.log("TronLink requestAccounts method not supported, skipping.");
        }

        // Retry fetching the account address with retries
        const account = await retryFetchAccount();
        
        $scope.account = account;
        console.log("Connected TronLink wallet:", $scope.account);

        // Ensure Angular updates the view when the account is retrieved
        if (!$scope.$$phase) {
          $scope.$apply();
        }
      } else {
        alert("TronLink is not installed. Please install TronLink extension.");
      }
    } catch (error) {
      console.error("TronLink wallet connection failed:", error.message);     
        alert('Please login to your TronLink wallet extension');     
    }
  };

  // Helper function to show a short version of the account
  $scope.getShortAccount = function(account) {
    if (account) {
      return account.substring(0, 3) + '....' + account.substring(account.length - 3);
    }
    return ''; // Return an empty string if account is not available
  };

});
