// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CoinFlip} from "../src/CoinFlip.sol";
import {CreateSubscription, FundSubscription, AddConsumer} from "./Interactions.s.sol";

/* 
    In this deployment script we should expect to create & fund a subscription and add our consuming contract to that subscription.
    If one has not been created already.

    In the case of Sepolia we would have already created a subscription via the Chainlink GUI.
    Otherwise 
*/
contract DeployCoinFlip is Script {
    uint256 constant MINIMUM_WAGER = 0.001 ether; // Change this to 0.005. Post Testing

    function run() external returns (CoinFlip, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        (
            address vrfCoordinator,
            uint256 subscriptionId,
            bytes32 gasLane,
            uint32 callbackGasLimit,
            address link
        ) = helperConfig.activeNetworkConfig();

        if (subscriptionId == 0) {
            // Ideally only on Anvil (otherwise we can create s)
            CreateSubscription createSubscription = new CreateSubscription();
            subscriptionId = createSubscription.createSubscription(
                vrfCoordinator
            );
            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(
                vrfCoordinator,
                subscriptionId,
                link
            );
        }

        vm.startBroadcast();
        CoinFlip coinFlip = new CoinFlip(
            MINIMUM_WAGER,
            vrfCoordinator,
            subscriptionId,
            gasLane,
            callbackGasLimit
        );
        vm.stopBroadcast();

        AddConsumer addConsumer = new AddConsumer();
        addConsumer.addConsumer(
            address(coinFlip),
            subscriptionId,
            vrfCoordinator
        );
        console.log("Deployer Address: ", address(this));
        return (coinFlip, helperConfig);
    }
}
