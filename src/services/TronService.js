angular.module('app').service('TronService', function ($window, $q) {
    const TRON_NETWORK = 'https://api.shasta.trongrid.io';  // Using Shasta test network
    const CONTRACT_ADDRESS = 'TEjMX1FMF4TFP9t6U96vm7M2P4n2VBzw7g';


    // Function to interact with the smart contract
    this.getContract = async function () {
        return await window.tronWeb.contract().at(CONTRACT_ADDRESS);
    };

    // Create poll function
    this.createPoll = async function (title, description, targetAudience, publicLink, pollHash, price) {
        try {
            console.log(title, description, targetAudience, publicLink, pollHash, price);
            const contract = await this.getContract();

            // Call the createPoll function
            const result = await contract.createPoll(
                title,
                description,
                targetAudience,
                publicLink,
                pollHash,
                price
            ).send({
                from: window.tronWeb.defaultAddress.base58
            });

            console.log('Poll Created:', result);
            return result;
        } catch (error) {
            console.error('Error creating poll:', error);
            return $q.reject(error);
        }
    };
});
