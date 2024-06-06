"use client";
import { useGameContext } from "@/app/contexts/GameContext";
import useBalance from "@/app/hooks/useBalance";
import { ViewType } from "@/app/types/types";
import { COINFLIP_CONTRACT_ADDRESS_SEPOLIA } from "@/app/utils/constants";
import HouseIcon from '@mui/icons-material/House';
import { Button, ButtonGroup, Chip, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography, styled } from "@mui/material";
import { Comfortaa } from "next/font/google";
import Image from "next/image";
import styles from "./Navbar.module.css";
import PublicIcon from '@mui/icons-material/Public';
import { useState } from "react";

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
    console.log(`View Type: ${viewType}`);
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

const ChainMenu = () => {
    const chains = ["Sepolia", "Arbitrum"];
    const chainIcons = [<Image src="/sepolia-dolphin-logo.png" alt="Sepolia" width={28} height={28} style={{ marginRight: 8 }} />, <Image src="/arbitrum-logo.png" alt="Arbitrum" width={28} height={28} style={{ marginRight: 8 }} />]
    const [selectedChain, setSelectedChain] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event: any) => {
        console.log(typeof event);
        setSelectedChain(event.currentTarget.title);
        setAnchorEl(null);
    };

    return <div>
        <List style={{ paddingTop: 0, paddingBottom: 0, border: "1px solid white", marginRight: 8, paddingInline: 8, paddingBlock: 6, borderRadius: 8 }}>
            <ListItem style={{ padding: 0 }}>
                <ListItemButton style={{ padding: 0 }} onClick={handleClick}>
                    <ListItemIcon style={{ minWidth: 0, marginRight: 0, color: "white" }}>
                        {selectedChain ? selectedChain : <PublicIcon style={{ color: "white" }} />}
                    </ListItemIcon>

                </ListItemButton>
            </ListItem>
        </List>
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
                style: {
                    maxHeight: 48 * 4.5,
                    width: '20ch',
                },
            }}
        >
            <MenuItem onClick={handleClose} divider selected={selectedChain === "Sepolia"} title="Sepolia">
                {chainIcons[0]}
                <Typography variant="body1">Sepolia</Typography>
            </MenuItem>
            <MenuItem onClick={handleClose} selected={selectedChain === "Arbitrum"} title={"Arbitrum"}>
                {chainIcons[1]}
                <Typography variant="body1">Arbitrum</Typography>
            </MenuItem>
        </Menu>

    </div>
}

const HouseBalance = () => {
    const { balance, loading, fetchBalance } = useBalance(COINFLIP_CONTRACT_ADDRESS_SEPOLIA);
    return <div className={styles.leftNavbarItem}>
        <HouseIcon style={{ color: "", fontSize: "1.5em" }} />
        <p style={{ fontSize: "0.9em", marginTop: "2px" }}>{Number(balance).toFixed(4)}</p>
        <Image src="/eth-logo-2014.svg" width={15} height={18} alt="" />
    </div>
}


export default Navbar;