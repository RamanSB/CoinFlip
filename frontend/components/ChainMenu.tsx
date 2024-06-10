"use client";
import { IWeb3ContextState, useWeb3Context } from '@/app/contexts/Web3Context';
import PublicIcon from '@mui/icons-material/Public';
import { List, ListItem, ListItemButton, ListItemIcon, Menu, MenuItem, Typography } from "@mui/material";
import { toBeHex } from 'ethers';
import Image from "next/image";
import { useEffect, useState } from "react";

const SUPPORTED_CHAIN_IDS = [42161, 11155111];
const CHAIN_IDS_MAP: { [key: string]: number } = {
    sepolia: 11155111,
    arbitrum: 42161
};

const ChainMenu = () => {
    const chainIcons = [
        <Image src="/arbitrum-logo.png" alt="Arbitrum" key={0} width={28} height={28} style={{ marginRight: 8 }} />,
        <Image src="/sepolia-dolphin-logo.png" alt="Sepolia" key={1} width={28} height={28} style={{ marginRight: 8 }} />
    ];
    const [selectedChain, setSelectedChain] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const { state } = useWeb3Context() as IWeb3ContextState;

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = async (event: any) => {
        const networkName = event.currentTarget.title;
        const networkId = CHAIN_IDS_MAP[networkName];

        if (state.chainId === networkId) {
            console.log(`Already on chain: ${networkName}`);
            setAnchorEl(null);
            return;
        }

        const isNetworkChanged = await changeNetwork(networkId);
        if (isNetworkChanged) { setSelectedChain(networkName) }
        setAnchorEl(null);
    };

    const changeNetwork = async (chainId: number) => {
        try {
            console.log(`ChangeNetwork(${chainId})`);
            const { ethereum } = window as (Window & typeof globalThis & { ethereum: any });
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: toBeHex(chainId) }],
            });
            return true;
        } catch (error) {
            console.error(`Failed to switch network: ${error}`);
            return false;
        }
    };

    useEffect(() => {
        if (state.chainId && SUPPORTED_CHAIN_IDS.includes(state.chainId)) {
            const networkName = Object.keys(CHAIN_IDS_MAP).find(key => CHAIN_IDS_MAP[key] === state.chainId);
            console.log(`useEffect - setSelectChain(${networkName})`);
            setSelectedChain(networkName || null);
        }
    }, [state.chainId]);

    return (
        <div>
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
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    style: {
                        maxHeight: 48 * 4.5,
                        width: '20ch',
                    },
                }}
            >
                <MenuItem onClick={handleClose} selected={selectedChain === "arbitrum"} title={"arbitrum"}>
                    {chainIcons[0]}
                    <Typography variant="body1">Arbitrum</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose} divider selected={selectedChain === "sepolia"} title="sepolia">
                    {chainIcons[1]}
                    <Typography variant="body1">Sepolia</Typography>
                </MenuItem>
            </Menu>
        </div>
    );
};

export default ChainMenu;