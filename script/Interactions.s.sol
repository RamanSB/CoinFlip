// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {VRFCoordinatorV2PlusMock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2PlusMock.sol";
import {Script, console} from "forge-std/Script.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";

contract CreateSubscription is Script {
    function createSubscription(
        address vrfCoordinator
    ) public returns (uint256) {
        vm.startBroadcast();
        uint256 subId = VRFCoordinatorV2PlusMock(vrfCoordinator)
            .createSubscription();

        vm.stopBroadcast();
        console.log("Creating Subscripton on Chain: ", block.chainid);
        console.log("Created SubId: ", subId);
        console.log("Update SubscriptionId in HelperConfig.s.sol");
        return subId;
    }
}

// Need LINK Token address to Fund
contract FundSubscription is Script {
    uint256 constant SUBSCRIPTION_FUND_AMOUNT = 5 ether; // 5 Link, Link has 18 decimals so does as Ether.

    function fundSubscription(
        address vrfCoordinator,
        uint256 subId,
        address link
    ) public {
        console.log(
            "Funding subscription id with VRF Coordinator: ",
            subId,
            vrfCoordinator
        );
        if (block.chainid == 31337) {
            console.log("Funding Subscription on Anvil...");
            vm.startBroadcast();
            VRFCoordinatorV2PlusMock(vrfCoordinator).fundSubscription(
                subId,
                uint96(SUBSCRIPTION_FUND_AMOUNT)
            );
            vm.stopBroadcast();
        } else {
            console.log("Funding Subscription on: ", block.chainid);
            console.log(
                "Transferring LINK to VRF Coordinator w/SubID: ",
                subId
            );
            vm.startBroadcast();
            LinkToken(link).transferAndCall(
                vrfCoordinator,
                SUBSCRIPTION_FUND_AMOUNT,
                abi.encode(subId)
            );
            vm.stopBroadcast();
        }
    }
}

contract AddConsumer is Script {
    function addConsumer(
        address consumer,
        uint256 subId,
        address vrfCoordinator
    ) public {
        vm.startBroadcast();
        VRFCoordinatorV2PlusMock(vrfCoordinator).addConsumer(subId, consumer);
        vm.stopBroadcast();
    }
}
