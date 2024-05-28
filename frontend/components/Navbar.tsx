"use client";
import Image from "next/image";
import styles from "./Navbar.module.css";
import HouseIcon from '@mui/icons-material/House';
import { Button, ButtonGroup, styled } from "@mui/material";
import { Comfortaa } from "next/font/google";
import { useState } from "react";
import useBalance from "@/app/hooks/useBalance";
import { COINFLIP_CONTRACT_ADDRESS_SEPOLIA } from "@/app/utils/constants";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export enum ViewType {
    FIAT = "Fiat",
    CRYPTO = "Crypto"
}

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


    const [viewType, setViewType] = useState<null | ViewType>(ViewType.CRYPTO);
    console.log(`View Type: ${viewType}`);
    return <div className={styles.navbar}>
        <HouseBalance />
        <div className={styles.rightNavbarItem}>
            <ButtonGroup>
                <StyledButton active={`${viewType === ViewType.CRYPTO}`} onClick={() => setViewType(ViewType.CRYPTO)}>Ξ</StyledButton>
                <StyledButton active={`${viewType === ViewType.FIAT}`} onClick={() => setViewType(ViewType.FIAT)}>$</StyledButton>
            </ButtonGroup>
        </div>
    </div>
};

const HouseBalance = () => {
    const { balance, loading, fetchBalance } = useBalance(COINFLIP_CONTRACT_ADDRESS_SEPOLIA);
    return <div className={styles.leftNavbarItem}>
        <HouseIcon style={{ color: "", fontSize: "1.5em" }} />
        <p style={{ fontSize: "0.9em", marginTop: "2px" }}>{balance}</p>
        <Image src="/eth-logo-2014.svg" width={15} height={18} alt="" />
    </div>
}

export default Navbar;