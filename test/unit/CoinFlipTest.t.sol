// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test, console} from "forge-std/Test.sol";

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

    HelperConfig config;
    CoinFlip coinFlip;
    address vrfCoordinator;
    uint256 subscriptionId;
    bytes32 gasLane;
    uint32 callbackGasLimit;
    address link;

    uint256 constant COINFLIP_INITIAL_BALANCE = 10 ether;
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

    /* 
        // TODO: Come back to this... Requires our user to be able to place a bet or to use forge-std env cheatcode (store) to modify mapping directly.
        function test_shouldRevertWhenUserHasAnUnfinishedExistingBet(
            uint8 betChoice
        ) public {
            hoax(PLAYER_ONE, 1 ether);
        } 
    */

    function test_userPlacesABet() public {
        // given - CoinFlip contract has sufficient funds.
        vm.deal(address(coinFlip), COINFLIP_INITIAL_BALANCE);

        hoax(PLAYER_ONE, 1 ether);

        // when

        vm.expectEmit(true, true, false, true);
        emit CoinFlip__FlipRequest(
            PLAYER_ONE,
            1,
            0.25 ether,
            CoinFlip.Choice.HEADS
        );
        coinFlip.bet{value: 0.25 ether}(0); // Heads

        // then
        CoinFlip.CoinFlipRequest memory result = coinFlip
            .getRecentCoinFlipResultByAddress(PLAYER_ONE);
        CoinFlip.CoinFlipRequest memory resultByRequestId = coinFlip
            .getResultByRequestId(1);

        assertTrue(compareCoinFlipRequest(result, resultByRequestId));
        assert(result.state == CoinFlip.State.OPEN);
        assert(result.amount == 0.25 ether);
        assert(result.user == PLAYER_ONE);
        assert(result.choice == CoinFlip.Choice.HEADS);
        assert(
            address(coinFlip).balance == COINFLIP_INITIAL_BALANCE + 0.25 ether
        );
        assert(coinFlip.getTotalPotentialPayout() == 0.5 ether);
        assert(coinFlip.getPotentialPayoutForAddress(PLAYER_ONE) == 0.5 ether);
    }

    function test_shouldRevertWhenContractHasInsufficientFunds(
        uint8 betChoice
    ) public {
        // given - CoinFlip contract has 0 funds (ether).
        hoax(PLAYER_ONE, 1 ether);
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
        startHoax(PLAYER_ONE, 1 ether);

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
