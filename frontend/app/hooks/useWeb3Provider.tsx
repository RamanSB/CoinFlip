import { Network, Signer } from "ethers";
import { BrowserProvider, ethers, JsonRpcSigner } from "ethers";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

// Defining Auth & (Blockchain) Credentials State.
export interface IWeb3State {
    address: string | null;
    chainId: number | null;
    signer: Signer | null;
    provider: BrowserProvider | null;
    isAuthenticated: boolean;
}

const IS_AUTHENTICATED_STORAGE_KEY = "CoinFlip__isAuthenticated";

declare global {
    interface Window {
        ethereum?: BrowserProvider
    }
}

const useWeb3Provider = () => {
    const initialState: IWeb3State = {
        address: null,
        chainId: null,
        signer: null,
        provider: null,
        isAuthenticated: false
    }

    const [state, setState]: [IWeb3State, Dispatch<SetStateAction<IWeb3State>>] = useState(initialState);

    const connectWallet = useCallback(async () => {
        console.log(`connectWallet(${JSON.stringify(state)})`);
        if (state.isAuthenticated) {
            console.log(`connectWallet: isAuthenticated: ${state.isAuthenticated}`);
            return;
        }

        try {
            const { ethereum } = window as (Window & typeof globalThis & { ethereum: any });

            if (!ethereum) {
                console.log("Unable to detect window.ethereum property: user does not have an ETH wallet extension ");
                // Do something user does not have an ETH wallet extension 
            }

            const provider: BrowserProvider = new ethers.BrowserProvider(ethereum);
            const accounts: string[] = await provider.send("eth_requestAccounts", []);
            if (accounts.length > 0) {
                const signer: Signer = await provider.getSigner();
                const chain = Number(await (await provider.getNetwork()).chainId);
                console.log(`${(await provider.getNetwork()).name}`)
                console.log(`Connecting wallet to: ${Network.from(chain).name}`);
                setState({
                    ...state,
                    address: accounts[0],
                    signer,
                    chainId: chain,
                    provider,
                    isAuthenticated: true
                });

                localStorage.setItem(IS_AUTHENTICATED_STORAGE_KEY, "true");
            }
        } catch (error) {
            console.log(`Error while attempting to connect wallet: ${error}`);
        }
    }, [state]);

    const disconnect = () => {
        setState(initialState);
        localStorage.removeItem(IS_AUTHENTICATED_STORAGE_KEY);
    }


    // Connects are wallet automatically if we have isAuthenticated stored as true from prior visits.
    useEffect(() => {
        if (window == null) return;

        if (localStorage.hasOwnProperty(IS_AUTHENTICATED_STORAGE_KEY)) {
            connectWallet();
        }

    }, [connectWallet, state.isAuthenticated]);

    // Updates state when user changes accounts or network on MetaMask.
    useEffect(() => {
        if (typeof window?.ethereum === "undefined") return;

        window.ethereum.on("accountsChanged", (accounts: string[]) => {
            console.log(`User changed accounts: ${JSON.stringify(accounts)}`);
            setState({ ...state, address: accounts[0] });
        });

        window.ethereum.on("chainChanged", (network: string) => {
            console.log(`Switched chain to: ${network}`);
            setState({ ...state, chainId: Number(network) });
            window.location.reload();
        });

        return () => {
            window.ethereum?.removeAllListeners();
        }
    }, [state]);

    return { connectWallet, disconnect, state };

}

export default useWeb3Provider;