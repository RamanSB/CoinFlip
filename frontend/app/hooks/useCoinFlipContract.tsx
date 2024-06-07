import { Contract } from "ethers";
import { useMemo } from "react";
import ABI from "../utils/abi.json";
import { COINFLIP_CONTRACT_ADDRESS_SEPOLIA, COINFLIP_CONTRACT_ADDRESS_ARBITRUM } from "../utils/constants";
import useWeb3Provider from "./useWeb3Provider";
import { determineContractAddress } from "../utils/utils";


const useCoinFlipContract = () => {
    const { state } = useWeb3Provider();



    const contract = useMemo(() => {
        if (!state.provider || !state.address) return null;
        const signer = state.signer;
        const contractAddress: string | null = determineContractAddress(state.chainId);
        if (!contractAddress) {
            return;
        }
        return new Contract(contractAddress, ABI['abi'], signer);
    }, [state.provider, state.address, state.chainId]);

    return contract;
};


export default useCoinFlipContract;