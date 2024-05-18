// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**

// Solidity Contract Layout:
// 1. Pragmas
// 2. Import Statements
// 3. Interfaces
// 4. Libraries
// 5. Contracts
// 6. Enums and Structs
// 7. Errors
// 7. Events
// 8. State Variables
// 9. Constructor
// 10. Modifiers
// 11. Functions
 */
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/libraries/VRFV2PlusClient.sol";

contract CoinFlip is VRFConsumerBaseV2Plus {

    enum State {
        OPEN,
        FLIPPING,
        FINISHED
    }

    struct CoinFlipRequest {
        requestId: uint256;
        amount: uint256;
        state: State;
        user: address;
    }

    error CoinFlip__BetIsBelowMinimumAmount(address player, uint256 amount);
    error CoinFlip__ExistingBetIsInProgress(address player);
    error CoinFlip__ContractHasInsufficientFundsForPayout(address player, uint256 wageAmount, uint256 balance);

    // VRF State Variables
    address s_vrfCoordinatorAddress;

    uint256 immutable MINIMUM_WAGER;
    uint256 private s_lastRequestId;
    uint256 private s_wager; // Amount user will bet
    address payable[] s_players; // Array of all players who have played.
    uint256 private s_totalPotentialPayout;
    mapping(requestId => CoinFlipRequest) private s_flipRequestByRequestId; 
    mapping(address => CoinFlipRequest) private s_recentFlipRequestByAddress;
    mapping(address => uint256) private s_potentialPayoutByAddress; // Track of how much we potentially owe to a particular address

    constructor (uint256 minimumWager, vrfCoordinatorAddress) VRFConsumerBaseV2Plus(vrfCoordinatorAddress) {
        MINIMUM_WAGER = minimumWager;
        s_vrfCoordinatorAddress = vrfCoordinatorAddress;
    }

    // Functions
    function bet() external payable{
        // Checks
        // User bets above minimum amount
        if (msg.value < MINIMUM_WAGER) {
            revert CoinFlip__BetIsBelowMinimumAmount(msg.sender, msg.value);
        }
        
        // If user has never played a game before, recentFlipRequest will have a state of OPEN, amount will be 0, we can use this.
        CoinFlipRequest recentFlipRequest = s_recentFlipRequestByAddress[msg.sender];
        if (recentFlipRequest.amount != 0 && recentFlipRequest.state != State.FINISHED) { // Users recent 
            revert CoinFlip__ExistingBetIsInProgress(msg.sender);
        }

        // Check if contract has amount to pay user.
        uint256 contractBalance = address(this).balance;
        if (contractBalance - s_totalPotentialPayout < msg.value) {
            revert CoinFlip__InsufficientFundsForPayout(msg.sender, msg.value, contractBalance);
        }
        
        // Effects
        uint256 payoutAmount = 2 * msg.value;
        s_potentialPayoutByAddress[msg.sender] = payoutAmount;
        s_totalPotentialPayout += payoutAmount;
        // Trigger request
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({})
        ) // trigger request using vrfCoordinator
        
        CoinFlipRequest flipRequest = CoinFlipRequest({
            amount: msg.value,
            state: State.OPEN,
            requestId: requestId, // Add requestId
            user: msg.sender
        });

        // Associate flipRequest with state
        s_flipRequestByRequestId[requestId] = flipRequest;
        s_recentFlipRequestByAddress[msg.sender] = flipRequest;
        

    }

}
