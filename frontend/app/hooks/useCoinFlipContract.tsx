import { useMemo } from "react"
import { IWeb3ContextState, useWeb3Context } from "../contexts/Web3Context"
import { Contract } from "ethers";
import ABI from "../../../smart-contracts/out/CoinFlip.sol/CoinFlip.json";
import useWeb3Provider from "./useWeb3Provider";
import { COINFLIP_CONTRACT_ADDRESS_SEPOLIA } from "../utils/constants";


const useCoinFlipContract = () => {
    const { state } = useWeb3Provider();

    const contract = useMemo(() => {
        if (!state.provider || !state.address) return null;
        const signer = state.signer;
        return new Contract(COINFLIP_CONTRACT_ADDRESS_SEPOLIA, ABI['abi'], signer);
    }, [state.provider, state.address]);

    return contract;
};


export default useCoinFlipContract;