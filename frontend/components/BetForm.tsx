"use client";
import Image from "next/image";
import { Button, ButtonGroup, Grid, styled } from "@mui/material";
import { useState } from "react";
import { Comfortaa } from "next/font/google";
import { CatchingPokemonSharp } from "@mui/icons-material";
import useBet from "@/app/hooks/useBet";
import { ethers, parseUnits } from "ethers";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export enum Choice {
    HEADS = "Heads",
    TAILS = "Tails"
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

const BetButton = styled(Button)(({ theme }) => ({
    color: "white",
    border: "1px solid white",
    fontFamily: comfortaa.style.fontFamily,
    textTransform: "capitalize",
    "&:disabled": {
        backgroundColor: "gray",
        color: "black",
    },
    "&:hover": {
        border: "1px solid white"
    }
}));

const BetForm = () => {

    const [choice, setChoice] = useState<Choice | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const { bet, loading } = useBet();
    const PRESET_BET_AMOUNTS: number[] = [0.0005, 0.0025, 0.01, 0.05, 0.1, 0.25];

    const handleBet = async () => {
        // TODO: Fill this out.
        console.log(`handleBet(${choice}, ${selectedAmount})`);
        if (!selectedAmount) {
            return;
        }

        await bet(choice === Choice.HEADS ? 0 : 1, selectedAmount);
    }


    return <div style={{ padding: "16px" }}>
        <p style={{ marginBottom: "16px", textAlign: "center", fontSize: "1.5em" }}>I would like</p>
        <ButtonGroup fullWidth>
            <StyledButton
                variant="outlined"
                active={`${choice === Choice.HEADS}`}
                onClick={() => setChoice(Choice.HEADS)}
            >
                {Choice.HEADS}
            </StyledButton>
            <StyledButton
                variant="outlined"
                active={`${choice === Choice.TAILS}`}
                onClick={() => setChoice(Choice.TAILS)}
            >
                {Choice.TAILS}
            </StyledButton>
        </ButtonGroup>
        <p style={{ marginBlock: "16px", textAlign: "center", fontSize: "1.5em" }}>For</p>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {PRESET_BET_AMOUNTS.map((amount, index) => (
                <Grid item xs={2} sm={4} md={4} key={index}>
                    <StyledButton
                        fullWidth
                        variant="outlined"
                        endIcon={<Image src="/eth-logo-2014.svg" width={15} height={20} alt="" />}
                        active={`${selectedAmount === amount}`}
                        onClick={() => setSelectedAmount(amount)}
                    >
                        {amount}
                    </StyledButton>
                </Grid>
            ))}
        </Grid>
        <BetButton fullWidth variant="outlined" style={{ marginTop: "16px" }} disabled={!choice || !selectedAmount} onClick={() => handleBet()}>
            Bet
        </BetButton>
    </div>
}

export default BetForm;