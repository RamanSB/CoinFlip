"use client";
import { PropsWithChildren } from "react";
import Web3ContextProvider from "./contexts/Web3Context";
import GameContextProvider, { GameContext } from "./contexts/GameContext";

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
    return <Web3ContextProvider>
        <GameContextProvider>
            {children}
        </GameContextProvider>
    </Web3ContextProvider>

}

export default Providers;