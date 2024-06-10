"use client";
import { IWeb3ContextState, useWeb3Context } from "@/app/contexts/Web3Context";
import useBalance from "@/app/hooks/useBalance";
import { determineContractAddress } from "@/app/utils/utils";
import HouseIcon from '@mui/icons-material/House';
import Image from "next/image";
import ChainMenu from "./ChainMenu";
import styles from "./Navbar.module.css";

const Navbar = () => {
    const { state } = useWeb3Context() as IWeb3ContextState;
    return <div className={styles.navbar}>
        {state.isAuthenticated && <HouseBalance />}
        <div className={styles.rightNavbarItem}>
            <ChainMenu />
        </div>
    </div>
};

const HouseBalance = () => {
    const { state } = useWeb3Context() as IWeb3ContextState;
    const contractAddress = determineContractAddress(state.chainId);
    if (!contractAddress) {
        return;
    }
    const { balance } = useBalance(contractAddress);
    return <div className={styles.leftNavbarItem}>
        <HouseIcon style={{ color: "", fontSize: "1.5em" }} />
        <p style={{ fontSize: "0.9em", marginTop: "2px" }}>{Number(balance).toFixed(4)}</p>
        <Image src="/eth-logo-2014.svg" width={15} height={18} alt="" />
    </div>
}


export default Navbar;