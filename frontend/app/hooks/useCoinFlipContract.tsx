import { Contract } from "ethers";
import { useMemo } from "react";
import ABI from "../utils/abi.json";
import { determineContractAddress } from "../utils/utils";
import useWeb3Provider from "./useWeb3Provider";

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
    }, [state.provider, state.address, state.chainId, state.signer]);

    return contract;
};


export default useCoinFlipContract;