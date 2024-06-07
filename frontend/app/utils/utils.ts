import { COINFLIP_CONTRACT_ADDRESS_ARBITRUM, COINFLIP_CONTRACT_ADDRESS_SEPOLIA } from "./constants";

export const determineContractAddress = (chainId: number | null): string | null => {
    switch (chainId) {
        case 11155111:
            return COINFLIP_CONTRACT_ADDRESS_SEPOLIA;
        case 42161:
            return COINFLIP_CONTRACT_ADDRESS_ARBITRUM;
        default:
            console.log(`Unsupported chainId: ${chainId}`);
            return null;
    }
}

