"use client";
import Image from "next/image";
import BetForm from "@/components/BetForm";

const Home = () => {
    return (
        <div style={{ marginTop: "25%" }}>
            <p style={{ fontSize: "2em", textAlign: "center" }}>CoinFlip</p>
            <div style={{ textAlign: "center" }}>
                <Image style={{}} src="/coinflip-heads.png" alt="" width={280} height={280} />
            </div>
            {/* isConnected ? <BetForm/> : <ConnectButton/> */}
            <BetForm />

        </div>
    );
};




export default Home;