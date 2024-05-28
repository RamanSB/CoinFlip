import { useMemo } from "react"
import { IWeb3ContextState, useWeb3Context } from "../contexts/Web3Context"
import { Contract } from "ethers";
import ABI from "../../../smart-contracts/out/CoinFlip.sol/CoinFlip.json";

const COINFLIP_CONTRACT_ADDRESS_SEPOLIA: string = "0x20073262626d2bae2a11239cf940fa76fffe4601";
const useCoinFlipContract = () => {
    const { state } = useWeb3Context() as IWeb3ContextState;
    return useMemo(
        () => state.signer && new Contract(COINFLIP_CONTRACT_ADDRESS_SEPOLIA, ABI['abi'], state.signer),
        [state.signer]
    )
}

export default useCoinFlipContract;