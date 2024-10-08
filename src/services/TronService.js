angular.module('app').service('TronService', function ($window,InsightService, $q) {
    const TRON_NETWORK = 'https://api.shasta.trongrid.io';  // Using Shasta test network
    const CONTRACT_ADDRESS = 'TFkWKML8G5RpwSBUTeSuaeW2KgUJ3sCZvE';

    // Function to interact with the smart contract
    this.getContract = async function () {
        return await window.tronWeb.contract().at(CONTRACT_ADDRESS);
    };

    // Create poll function
    this.createPoll = async function (pollHash, price) {  // Only taking pollHash and price
        try {
            console.log(pollHash, price);
            const contract = await this.getContract();

            // Call the createPoll function
            const result = await contract.createPoll(
                pollHash,  // Only pass pollHash
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

    // Get all polls from the contract
    this.getPolls = async function () {
        const contract = await this.getContract();
        const pollsCount = await contract.getPollCount().call();  // Get the number of polls
        const pollsData = [];

        // Iterate over each poll to retrieve its details
        for (let i = 0; i < pollsCount; i++) {
            const poll = await contract.getPoll(i).call();  // Fetch each poll's details
            let d={};
            d.pollHash = poll.pollHash;
            const data = await InsightService.getmetadata(d);
            const md= data.data;
            console.log(md,poll);
            let newpoll={
                id: poll.id,
                pollHash: poll.pollHash,
                owner: poll.pollOwner,  // Updated variable name
                price: poll.price,
                isForSale: poll.isForSale,
                analyticsCount: poll.analyticsCount
            };
            if(md){
                newpoll.title=md.title;
                newpoll.description = md.description;
                newpoll.analyticsCount = md.responsescount;
            }
            pollsData.push(newpoll);
        }

        //console.log(pollsData);
        return pollsData;
    };

    // Buy a poll
    this.buyPoll = async function (pollId, price) {
        try {
            price = price * 1000000;
            const contract = await this.getContract();
            const result = await contract.buyPoll(pollId).send({ callValue: price });
            console.log('Poll Purchased:', result);
            return result;
        } catch (error) {
            console.error('Error purchasing poll:', error);
            return $q.reject(error);
        }
    };
});
