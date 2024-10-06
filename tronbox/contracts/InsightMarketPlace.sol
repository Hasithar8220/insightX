// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract InsightMarketplace {

    address public owner = msg.sender;
    uint public last_completed_migration;

    modifier restricted() {
        require(msg.sender == owner, "This function is restricted to the contract's owner");
        _;
    }

    struct Poll {
        uint256 id;
        string pollHash;  // Hash of question + options JSON
        address payable pollOwner; // Changed variable name here
        uint256 price;
        bool isForSale;
        uint256 analyticsCount;  // Number of responses or views
    }

    // Array to store polls
    Poll[] public polls;

    // Event emitted when a poll is created
    event PollCreated(uint256 id, string pollHash, address owner, uint256 price);

    // Event emitted when a poll is purchased
    event PollPurchased(uint256 id, address newOwner);

    // Event emitted when a poll is resold
    event PollResold(uint256 id, uint256 newPrice);

    // Event emitted when analytics count is updated
    event AnalyticsUpdated(uint256 id, uint256 newCount);

    // Reentrancy guard modifier
    bool internal locked;

    modifier noReentrancy() {
        require(!locked, "Reentrancy guard is active");
        locked = true;
        _;
        locked = false;
    }

    // Function to create a new poll
    function createPoll(
        string memory _pollHash,  // Only keep pollHash as input
        uint256 _price
    ) public {
        require(bytes(_pollHash).length > 0, "Poll hash cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        // Creating the poll and pushing to the array
        polls.push(Poll({
            id: polls.length,
            pollHash: _pollHash,
            pollOwner: payable(msg.sender), // Use new variable name here
            price: _price,
            isForSale: true,
            analyticsCount: 0  // Initialize analytics count to 0
        }));

        // Emit event after poll creation
        emit PollCreated(polls.length - 1, _pollHash, msg.sender, _price);
    }

    // Function to buy a poll
    function buyPoll(uint256 _pollId) public payable noReentrancy {
        require(_pollId < polls.length, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(poll.isForSale, "Poll is not for sale");
        require(msg.value >= poll.price, "Not enough TRX sent");

        // Transfer ownership and funds
        poll.pollOwner.transfer(msg.value); // Use new variable name here
        poll.pollOwner = payable(msg.sender); // Use new variable name here
        poll.isForSale = false;

        // Emit the purchase event
        emit PollPurchased(_pollId, msg.sender);
    }

    // Function to get the number of polls
    function getPollCount() public view returns (uint256) {
        return polls.length;
    }

    // Function to get details of a specific poll by ID
    function getPoll(uint256 _pollId) public view returns (
        uint256 id,
        string memory pollHash,
        address pollOwner, // Changed variable name here
        uint256 price,
        bool isForSale,
        uint256 analyticsCount
    ) {
        require(_pollId < polls.length, "Poll does not exist");
        Poll memory poll = polls[_pollId];
        return (
            poll.id,
            poll.pollHash,
            poll.pollOwner, // Use new variable name here
            poll.price,
            poll.isForSale,
            poll.analyticsCount
        );
    }

    // Function to resell a poll
    function resellPoll(uint256 _pollId, uint256 _newPrice) public {
        require(_pollId < polls.length, "Poll does not exist");
        require(msg.sender == polls[_pollId].pollOwner, "Only owner can resell the poll"); // Use new variable name here
        require(_newPrice > 0, "Price must be greater than 0");

        // Set the new price and mark it for sale
        polls[_pollId].price = _newPrice;
        polls[_pollId].isForSale = true;

        // Emit the resell event
        emit PollResold(_pollId, _newPrice);
    }

    // Function to update analytics count (restricted to owner or authorized parties)
    function updateAnalyticsCount(uint256 _pollId, uint256 _newCount) public {
        require(_pollId < polls.length, "Poll does not exist");
        require(msg.sender == polls[_pollId].pollOwner || msg.sender == owner, "Only the poll owner or admin can update analytics");

        // Update analytics count
        polls[_pollId].analyticsCount = _newCount;

        // Emit the analytics update event
        emit AnalyticsUpdated(_pollId, _newCount);
    }
}
