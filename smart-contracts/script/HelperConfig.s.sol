// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {VRFCoordinatorV2PlusMock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2PlusMock.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";

/**
    The only thing that is changing reagrding the networks is the VRF parameters 
*/
contract HelperConfig is Script {
    struct NetworkConfig {
        address vrfCoordinator;
        uint256 subscriptionId;
        bytes32 gasLane;
        uint32 callbackGasLimit;
        address link;
        uint16 numOfRequestConfirmations;
    }

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 31337) {
            activeNetworkConfig = getOrCreateAnvilNetworkConfig();
        } else if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaNetworkConfig();
        } else if (block.chainid == 42161) {
            activeNetworkConfig = getArbitrumNetworkConfig();
        } else {
            revert("Unrecognized chain id");
        }
    }

    // Not required
    // function run() external {}

    function getOrCreateAnvilNetworkConfig()
        public
        returns (NetworkConfig memory)
    {
        if (activeNetworkConfig.vrfCoordinator != address(0)) {
            return activeNetworkConfig;
        }

        uint96 baseFee = 1000 gwei;
        uint96 gasPriceLink = 1 gwei;

        vm.startBroadcast();
        VRFCoordinatorV2PlusMock vrfCoordinatorMock = new VRFCoordinatorV2PlusMock(
                baseFee,
                gasPriceLink
            );
        LinkToken link = new LinkToken();
        vm.stopBroadcast();

        return
            NetworkConfig({
                subscriptionId: 0,
                gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
                callbackGasLimit: 500_000,
                vrfCoordinator: address(vrfCoordinatorMock),
                link: address(link),
                numOfRequestConfirmations: 3
            });
    }

    function getSepoliaNetworkConfig()
        public
        pure
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B, // address from sepolia
                subscriptionId: 48384453260841176234049252282818005790251747561312733954909049654262149736105, // https://vrf.chain.link/sepolia
                gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
                callbackGasLimit: 1_000_000,
                link: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
                numOfRequestConfirmations: 3
            });
    }

    function getArbitrumNetworkConfig()
        public
        pure
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                vrfCoordinator: 0x3C0Ca683b403E37668AE3DC4FB62F4B29B6f7a3e,
                subscriptionId: 96194385608759427314183591391526943240068207892336735647640395800380702672280,
                gasLane: 0xe9f223d7d83ec85c4f78042a4845af3a1c8df7757b4997b815ce4b8d07aca68c,
                callbackGasLimit: 500_000,
                link: 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4,
                numOfRequestConfirmations: 1
            });
    }
}
