import { IWeb3ContextState, useWeb3Context } from "@/app/contexts/Web3Context";
import { Button } from "@mui/material"
import { Comfortaa } from "next/font/google";

const comfortaa = Comfortaa({ subsets: ["latin"] });

const ConnectButton = () => {
    const { connectWallet } = useWeb3Context() as IWeb3ContextState;

    const handleConnect = async () => {
        console.log(`handleConnect()...`)
        await connectWallet();
    };

    return <div style={{ textAlign: "center" }}>
        <Button variant="contained" style={{ background: "white", color: "black", textTransform: "capitalize", fontFamily: comfortaa.style.fontFamily }} onClick={handleConnect}>Connect Your Wallet</Button>
    </div>
}

export default ConnectButton;