"use client";
import { useGameContext } from "@/app/contexts/GameContext";
import useBalance from "@/app/hooks/useBalance";
import { ViewType } from "@/app/types/types";
import { COINFLIP_CONTRACT_ADDRESS_SEPOLIA, COINFLIP_CONTRACT_ADDRESS_ARBITRUM } from "@/app/utils/constants";
import HouseIcon from '@mui/icons-material/House';
import { Button, ButtonGroup, styled } from "@mui/material";
import { Comfortaa } from "next/font/google";
import Image from "next/image";
import styles from "./Navbar.module.css";
import ChainMenu from "./ChainMenu";
import { IWeb3ContextState, useWeb3Context } from "@/app/contexts/Web3Context";
import { determineContractAddress } from "@/app/utils/utils";

const comfortaa = Comfortaa({ subsets: ["latin"] });

const StyledButton = styled(Button)<{ active: string }>(({ theme, active }) => ({
    backgroundColor: active === "true" ? "white" : "transparent",
    color: active === "true" ? "black" : "white",
    borderColor: "white",
    fontFamily: comfortaa.style.fontFamily,
    fontWeight: 400,
    textTransform: "capitalize",
    "&:hover": {
        backgroundColor: active === "true" ? "white" : theme.palette.action.hover,
        border: "1px solid white",
        color: "black",
    },
}));

const Navbar = () => {
    const { viewType, setViewType } = useGameContext();
    return <div className={styles.navbar}>
        <HouseBalance />
        <div className={styles.rightNavbarItem}>
            <ChainMenu />
            <ButtonGroup>
                <StyledButton active={`${viewType === ViewType.CRYPTO}`} onClick={() => setViewType(ViewType.CRYPTO)}>Ξ</StyledButton>
                <StyledButton active={`${viewType === ViewType.FIAT}`} style={{ cursor: "not-allowed" }} onClick={() => setViewType(ViewType.FIAT)}>$</StyledButton>
            </ButtonGroup>
        </div>
    </div>
};



const HouseBalance = () => {
    const { state } = useWeb3Context() as IWeb3ContextState;
    const contractAddress = determineContractAddress(state.chainId);
    if (!contractAddress) {
        return;
    }
    const { balance, loading, fetchBalance } = useBalance(contractAddress);
    return <div className={styles.leftNavbarItem}>
        <HouseIcon style={{ color: "", fontSize: "1.5em" }} />
        <p style={{ fontSize: "0.9em", marginTop: "2px" }}>{Number(balance).toFixed(4)}</p>
        <Image src="/eth-logo-2014.svg" width={15} height={18} alt="" />
    </div>
}


export default Navbar;