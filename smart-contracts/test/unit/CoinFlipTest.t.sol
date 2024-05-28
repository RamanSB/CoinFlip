// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test, console} from "forge-std/Test.sol";

import {VRFCoordinatorV2PlusMock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2PlusMock.sol";
import {DeployCoinFlip} from "../../script/DeployCoinFlip.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {CoinFlip} from "../../src/CoinFlip.sol";

contract CoinFlipTest is Test {
    event CoinFlip__FlipRequest(
        address indexed player,
        uint256 indexed requestId,
        uint256 amount,
        CoinFlip.Choice choice
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

    HelperConfig config;
    CoinFlip coinFlip;
    address vrfCoordinator;
    uint256 subscriptionId;
    bytes32 gasLane;
    uint32 callbackGasLimit;
    address link;

    uint256 constant COINFLIP_INITIAL_BALANCE = 10 ether;
    uint256 constant INITIAL_PLAYER_BALANCE = 1 ether;
    uint256 constant MINIMUM_WAGER = 0.001 ether;
    address PLAYER_ONE = makeAddr("Player 1");
    address PLAYER_TWO = makeAddr("Player 2");

    function setUp() external {
        DeployCoinFlip deployCoinFlip = new DeployCoinFlip();
        (coinFlip, config) = deployCoinFlip.run();
        (
            vrfCoordinator,
            subscriptionId,
            gasLane,
            callbackGasLimit,
            link
        ) = config.activeNetworkConfig();
        console.log("CoinFlip balance: ", address(coinFlip).balance);
    }

    function test_shouldRevertWhenBetIsBelowMinimumAmount(
        uint8 betChoice
    ) public {
        // Given
        hoax(PLAYER_ONE, 1 ether);
        // When - placing a bet below the minimum amount we expect a revert.
        vm.expectRevert(
            abi.encodeWithSelector(
                CoinFlip.CoinFlip__BetIsBelowMinimumAmount.selector,
                PLAYER_ONE,
                MINIMUM_WAGER / 2
            )
        );
        coinFlip.bet{value: MINIMUM_WAGER / 2}(betChoice);
    }

    function test_shouldRevertWhenContractHasInsufficientFunds(
        uint8 betChoice
    ) public {
        // given - CoinFlip contract has 0 funds (ether).
        hoax(PLAYER_ONE, INITIAL_PLAYER_BALANCE);
        assert(address(coinFlip).balance == 0);

        // when
        vm.expectRevert(
            abi.encodeWithSelector(
                CoinFlip.CoinFlip__InsufficientFundsForPayout.selector,
                PLAYER_ONE,
                0.25 ether,
                0 ether
            )
        );
        coinFlip.bet{value: 0.25 ether}(betChoice);
    }

    function test_shouldRevertWhenUserHasExistingBetInProgress(
        uint8 betChoice
    ) public {
        // given - CoinFlip contract has 0 funds (ether).
        vm.deal(address(coinFlip), COINFLIP_INITIAL_BALANCE);
        startHoax(PLAYER_ONE, INITIAL_PLAYER_BALANCE);

        // when
        coinFlip.bet{value: 0.25 ether}(betChoice);
        CoinFlip.CoinFlipRequest memory resultByAddress = coinFlip
            .getRecentCoinFlipResultByAddress(PLAYER_ONE);
        console.log("result by address: ", resultByAddress.amount);
        console.log("result by state: ", uint256(resultByAddress.state));
        assert(resultByAddress.state == CoinFlip.State.OPEN);
        vm.expectRevert(
            abi.encodeWithSelector(
                CoinFlip.CoinFlip__ExistingBetIsInProgress.selector,
                PLAYER_ONE
            )
        );
        coinFlip.bet{value: 0.25 ether}(betChoice);
    }

    function test_userPlacesAWinningBet() public {
        // given - CoinFlip contract has sufficient funds.
        vm.deal(address(coinFlip), COINFLIP_INITIAL_BALANCE);
        uint256 BET_AMOUNT = 0.25 ether;
        hoax(PLAYER_ONE, INITIAL_PLAYER_BALANCE);

        // when - making a bet
        vm.expectEmit(true, true, false, true);
        emit CoinFlip__FlipRequest(
            PLAYER_ONE,
            1,
            0.25 ether,
            CoinFlip.Choice.HEADS
        );
        coinFlip.bet{value: BET_AMOUNT}(0); // Heads

        // then - once the bet has been placed
        CoinFlip.CoinFlipRequest memory result = coinFlip
            .getRecentCoinFlipResultByAddress(PLAYER_ONE);
        CoinFlip.CoinFlipRequest memory resultByRequestId = coinFlip
            .getResultByRequestId(1);

        assertTrue(compareCoinFlipRequest(result, resultByRequestId));
        assert(result.state == CoinFlip.State.OPEN);
        assert(result.amount == BET_AMOUNT);
        assert(result.user == PLAYER_ONE);
        assert(result.choice == CoinFlip.Choice.HEADS);
        assert(
            address(coinFlip).balance == COINFLIP_INITIAL_BALANCE + BET_AMOUNT
        );
        assert(coinFlip.getTotalPotentialPayout() == 2 * BET_AMOUNT);
        assert(
            coinFlip.getPotentialPayoutForAddress(PLAYER_ONE) == 2 * BET_AMOUNT
        );

        // when - Executing a Winning bet.
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 50; // Output will be heads. A win ***.

        vm.expectEmit(true, true, false, true);
        emit CoinFlip__FlipWin(PLAYER_ONE, 1, 0.5 ether);
        VRFCoordinatorV2PlusMock(vrfCoordinator).fulfillRandomWordsWithOverride(
            1,
            address(coinFlip),
            randomWords
        );
        result = coinFlip.getRecentCoinFlipResultByAddress(PLAYER_ONE);
        resultByRequestId = coinFlip.getResultByRequestId(1);

        // then
        assert(result.state == CoinFlip.State.WIN);
        assertTrue(compareCoinFlipRequest(result, resultByRequestId));
        assert(coinFlip.getPotentialPayoutForAddress(PLAYER_ONE) == 0 ether);
        assert(coinFlip.getTotalPotentialPayout() == 0 ether);
        assert(
            address(coinFlip).balance == COINFLIP_INITIAL_BALANCE - BET_AMOUNT
        );
        assert(PLAYER_ONE.balance == INITIAL_PLAYER_BALANCE + BET_AMOUNT);
    }

    function test_userPlacesALosingBet() public {
        // given - CoinFlip contract has sufficient funds.
        vm.deal(address(coinFlip), COINFLIP_INITIAL_BALANCE);
        uint256 BET_AMOUNT = 0.25 ether;
        hoax(PLAYER_ONE, INITIAL_PLAYER_BALANCE);

        // when - making a bet
        vm.expectEmit(true, true, false, true);
        emit CoinFlip__FlipRequest(
            PLAYER_ONE,
            1,
            0.25 ether,
            CoinFlip.Choice.TAILS
        );
        coinFlip.bet{value: BET_AMOUNT}(1); // Tails

        // then - once the bet has been placed
        CoinFlip.CoinFlipRequest memory result = coinFlip
            .getRecentCoinFlipResultByAddress(PLAYER_ONE);
        CoinFlip.CoinFlipRequest memory resultByRequestId = coinFlip
            .getResultByRequestId(1);

        assertTrue(compareCoinFlipRequest(result, resultByRequestId));
        assert(result.state == CoinFlip.State.OPEN);
        assert(result.amount == BET_AMOUNT);
        assert(result.user == PLAYER_ONE);
        assert(result.choice == CoinFlip.Choice.TAILS);
        assert(
            address(coinFlip).balance == COINFLIP_INITIAL_BALANCE + BET_AMOUNT
        );
        assert(coinFlip.getTotalPotentialPayout() == 2 * BET_AMOUNT);
        assert(
            coinFlip.getPotentialPayoutForAddress(PLAYER_ONE) == 2 * BET_AMOUNT
        );

        // when - Executing a Losing bet.
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2; // Output will be heads. A Loss ***.

        vm.expectEmit(true, true, false, true);
        emit CoinFlip__FlipLoss(PLAYER_ONE, 1, 0.5 ether);
        VRFCoordinatorV2PlusMock(vrfCoordinator).fulfillRandomWordsWithOverride(
            1,
            address(coinFlip),
            randomWords
        );
        result = coinFlip.getRecentCoinFlipResultByAddress(PLAYER_ONE);
        resultByRequestId = coinFlip.getResultByRequestId(1);

        // then
        assert(result.state == CoinFlip.State.LOSS);
        assertTrue(compareCoinFlipRequest(result, resultByRequestId));
        assert(coinFlip.getPotentialPayoutForAddress(PLAYER_ONE) == 0 ether);
        assert(coinFlip.getTotalPotentialPayout() == 0 ether);
        assert(
            address(coinFlip).balance == COINFLIP_INITIAL_BALANCE + BET_AMOUNT
        );
        assert(PLAYER_ONE.balance == INITIAL_PLAYER_BALANCE - BET_AMOUNT);
    }

    function compareCoinFlipRequest(
        CoinFlip.CoinFlipRequest memory reqA,
        CoinFlip.CoinFlipRequest memory reqB
    ) internal pure returns (bool) {
        return
            (reqA.amount == reqB.amount) &&
            (reqA.choice == reqB.choice) &&
            (reqA.requestId == reqB.requestId) &&
            (reqA.state == reqB.state) &&
            (reqA.user == reqB.user);
    }
}
