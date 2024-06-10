

// Define Shape of State

import React, { ReactNode, createContext, useContext } from "react";
import useWeb3Provider, { IWeb3State } from "../hooks/useWeb3Provider";

// Create Initial State

// Create Context

// Create ProviderFunction that passes state to newly created Context.Provider and wraps children.


export interface IWeb3ContextState {
    connectWallet: () => Promise<void>;
    disconnect: () => void;
    state: IWeb3State;

}

const Web3Context = createContext<IWeb3ContextState | null>(null);

type Web3ContextProps = {
    children: ReactNode;
}

const Web3ContextProvider: React.FC<Web3ContextProps> = ({ children }) => {

    const { connectWallet, disconnect, state } = useWeb3Provider();

    return <Web3Context.Provider
        value={{ connectWallet, disconnect, state }}>
        {children}

    </Web3Context.Provider>
}

export default Web3ContextProvider;

export const useWeb3Context = () => useContext(Web3Context);