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
        string title;
        string description;
        string targetAudience;
        string publicLink;
        string pollHash;  // Hash of question + options JSON
        address payable owner;
        uint256 price;
        bool isForSale;
        uint256 analyticsCount;  // Number of responses or views
    }

    // Array to store polls
    Poll[] public polls;

    // Event emitted when a poll is created
    event PollCreated(uint256 id, string title, address owner, uint256 price);

    // Event emitted when a poll is purchased
    event PollPurchased(uint256 id, address newOwner);

    // Event emitted when a poll is resold
    event PollResold(uint256 id, uint256 newPrice);

    // Event emitted when analytics count is updated
    event AnalyticsUpdated(uint256 id, uint256 newCount);

    // Reentrancy guard modifier (using Checks-Effects-Interactions pattern)
    bool internal locked;

    modifier noReentrancy() {
        require(!locked, "Reentrancy guard is active");
        locked = true;
        _;
        locked = false;
    }

    // Function to create a new poll
    function createPoll(
        string memory _title,
        string memory _description,
        string memory _targetAudience,
        string memory _publicLink,
        string memory _pollHash,
        uint256 _price
    ) public {
        require(bytes(_title).length > 0, "Poll title cannot be empty");
        require(bytes(_description).length > 0, "Poll description cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        // Creating the poll and pushing to the array
        polls.push(Poll({
            id: polls.length,
            title: _title,
            description: _description,
            targetAudience: _targetAudience,
            publicLink: _publicLink,
            pollHash: _pollHash,
            owner: payable(msg.sender),
            price: _price,
            isForSale: true,
            analyticsCount: 0  // Initialize analytics count to 0
        }));

        // Emit event after poll creation
        emit PollCreated(polls.length - 1, _title, msg.sender, _price);
    }

    // Function to buy a poll
    function buyPoll(uint256 _pollId) public payable noReentrancy {
        require(_pollId < polls.length, "Poll does not exist");
        Poll storage poll = polls[_pollId];
        require(poll.isForSale, "Poll is not for sale");
        require(msg.value >= poll.price, "Not enough TRX sent");

        // Transfer ownership and funds
        poll.owner.transfer(msg.value);
        poll.owner = payable(msg.sender);
        poll.isForSale = false;

        // Emit the purchase event
        emit PollPurchased(_pollId, msg.sender);
    }

    // Function to get all polls
    function getPolls() public view returns (Poll[] memory) {
        return polls;
    }

    // Function to resell a poll
    function resellPoll(uint256 _pollId, uint256 _newPrice) public {
        require(_pollId < polls.length, "Poll does not exist");
        require(msg.sender == polls[_pollId].owner, "Only owner can resell the poll");
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
        require(msg.sender == polls[_pollId].owner || msg.sender == owner, "Only the poll owner or admin can update analytics");

        // Update analytics count
        polls[_pollId].analyticsCount = _newCount;

        // Emit the analytics update event
        emit AnalyticsUpdated(_pollId, _newCount);
    }
}
