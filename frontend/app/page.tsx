"use client";
import Image from "next/image";
import BetForm from "@/components/BetForm";
import ConnectButton from "@/components/ConnectButton";
import { IWeb3ContextState, useWeb3Context } from "./contexts/Web3Context";
import useBet from "./hooks/useBet";

const Home = () => {

    const { state } = useWeb3Context() as IWeb3ContextState;


    return (
        <div style={{ marginTop: "25%" }}>
            <p style={{ fontSize: "2em", textAlign: "center" }}>CoinFlip</p>
            <div style={{ textAlign: "center" }}>
                <Image style={{}} src="/coinflip-heads.png" alt="" width={280} height={280} />
            </div>
            {state.isAuthenticated ? <BetForm /> : <ConnectButton />}
        </div>
    );
};




export default Home;