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
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
    TODO: Write documentation here (NatSpec)
    TODO: Download CLI tool for setting solc versions
    TODO: Think about functions that can be used by the Owner to withdraw profits and to Fund the contract.
 */
contract CoinFlip is VRFConsumerBaseV2Plus {
    // Enums & Structs
    enum State {
        OPEN, // 0
        FLIPPING, // 1
        FINISHED // 2
    }

    // Even = Heads, Odd = Tails
    enum Choice {
        HEADS, // 0
        TAILS // 1
    }

    struct CoinFlipRequest {
        uint256 requestId;
        uint256 amount;
        State state;
        address user;
        Choice choice;
    }

    // Errors
    error CoinFlip__BetIsBelowMinimumAmount(address player, uint256 amount);
    error CoinFlip__ExistingBetIsInProgress(address player);
    error CoinFlip__InsufficientFundsForPayout(
        address player,
        uint256 wageAmount,
        uint256 balance
    );
    error CoinFlip__NoBetFoundForRequestId(uint256 requestId);
    error CoinFlip__PayoutFailed(
        address player,
        uint256 requestId,
        uint256 amount
    );

    event CoinFlip__PaymentFailed(
        address indexed user,
        uint256 indexed requestId,
        uint256 indexed amount
    );
    event CoinFlip__ErrorLog(string message, uint256 indexed requestId);
    event CoinFlip__FlipRequest(
        address indexed player,
        uint256 indexed requestId,
        uint256 amount,
        Choice choice
    );
    event CoinFlip__FlipWin(
        address indexed player,
        uint256 indexed requestId,
        uint256 amount
    );
    event CoinFlip__FlipLoss(
        address indexed player,
        uint256 indexed requestId,
        uint256 amount
    );

    // VRF State Variables
    uint16 private constant NUMBER_OF_REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUMBER_OF_WORDS = 1;
    address s_vrfCoordinatorAddress;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    bytes32 private immutable i_gasLane;
    mapping(address => bool) internal s_locksByUser;

    uint256 immutable MINIMUM_WAGER;
    uint256 private s_totalPotentialPayout;
    mapping(uint256 => CoinFlipRequest) private s_flipRequestByRequestId;
    mapping(address => CoinFlipRequest) private s_recentFlipRequestByAddress;
    mapping(address => uint256) private s_potentialPayoutByAddress;

    constructor(
        uint256 minimumWager,
        address vrfCoordinatorAddress,
        uint256 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinatorAddress) {
        MINIMUM_WAGER = minimumWager;
        s_vrfCoordinatorAddress = vrfCoordinatorAddress;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_gasLane = gasLane;
    }

    modifier ReEntrancyGuard() {
        require(!s_locksByUser[msg.sender], "ReEntrancy not allowed");
        s_locksByUser[msg.sender] = true;
        _;
        s_locksByUser[msg.sender] = false;
    }

    receive() external payable {}

    fallback() external payable {}

    function bet(uint8 userChoice) external payable ReEntrancyGuard {
        // Checks
        // User bets above minimum amount
        if (msg.value < MINIMUM_WAGER) {
            revert CoinFlip__BetIsBelowMinimumAmount(msg.sender, msg.value);
        }

        // If user has never played a game before, recentFlipRequest will have a state of OPEN, amount will be 0, we can use this.
        CoinFlipRequest memory recentFlipRequest = s_recentFlipRequestByAddress[
            msg.sender
        ];
        if (
            recentFlipRequest.amount != 0 &&
            recentFlipRequest.state != State.FINISHED
        ) {
            // Users recent
            revert CoinFlip__ExistingBetIsInProgress(msg.sender);
        }

        // Check if contract has amount to pay user excluding the funds the user has provided.
        uint256 contractBalanceExcludingBet = address(this).balance - msg.value;
        if (contractBalanceExcludingBet - s_totalPotentialPayout < msg.value) {
            revert CoinFlip__InsufficientFundsForPayout(
                msg.sender,
                msg.value,
                contractBalanceExcludingBet
            );
        }

        // Effects
        uint256 payoutAmount = 2 * msg.value;
        s_potentialPayoutByAddress[msg.sender] = payoutAmount;
        s_totalPotentialPayout += payoutAmount;
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: NUMBER_OF_REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUMBER_OF_WORDS,
                extraArgs: ""
            })
        );

        emit CoinFlip__FlipRequest(
            msg.sender,
            requestId,
            msg.value,
            Choice(userChoice % 2)
        );

        CoinFlipRequest memory flipRequest = CoinFlipRequest({
            amount: msg.value,
            state: State.OPEN,
            requestId: requestId,
            user: msg.sender,
            choice: Choice(userChoice % 2)
        });

        s_flipRequestByRequestId[requestId] = flipRequest;
        s_recentFlipRequestByAddress[msg.sender] = flipRequest;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        // This function will be called by the VRF service
        Choice result = Choice(randomWords[0] % 2);
        CoinFlipRequest memory recentRequest = s_flipRequestByRequestId[
            requestId
        ];
        if (recentRequest.amount == 0) {
            emit CoinFlip__ErrorLog("Invalid request data", requestId);
            return;
        }
        uint256 potentialPayoutAmount = 2 * recentRequest.amount;
        s_totalPotentialPayout -= potentialPayoutAmount;
        delete s_potentialPayoutByAddress[recentRequest.user];
        recentRequest.state = State.FINISHED;
        s_flipRequestByRequestId[requestId] = recentRequest;
        s_recentFlipRequestByAddress[recentRequest.user] = recentRequest;
        if (recentRequest.choice == result) {
            // User has won.
            (bool sent /* bytes memory data */, ) = (recentRequest.user).call{
                value: potentialPayoutAmount
            }("");

            if (!sent) {
                emit CoinFlip__PaymentFailed(
                    recentRequest.user,
                    requestId,
                    potentialPayoutAmount
                );
            }

            emit CoinFlip__FlipWin(
                recentRequest.user,
                requestId,
                potentialPayoutAmount
            );
        } else {
            // User has lost.
            emit CoinFlip__FlipLoss(
                recentRequest.user,
                requestId,
                potentialPayoutAmount
            );
        }
    }

    function getRecentCoinFlipResultByAddress(
        address user
    ) public view returns (CoinFlipRequest memory) {
        return s_recentFlipRequestByAddress[user];
    }

    function getTotalPotentialPayout() public view returns (uint256) {
        return s_totalPotentialPayout;
    }

    function getPotentialPayoutForAddress(
        address user
    ) public view returns (uint256) {
        return s_potentialPayoutByAddress[user];
    }

    function getResultByRequestId(
        uint256 requestId
    ) public view returns (CoinFlipRequest memory) {
        return s_flipRequestByRequestId[requestId];
    }
}
