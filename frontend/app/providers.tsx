"use client";
import { PropsWithChildren } from "react";
import Web3ContextProvider from "./contexts/Web3Context";

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
    return <Web3ContextProvider>
        {children}
    </Web3ContextProvider>

}

export default Providers;