"use client";
import BetForm from "@/components/BetForm";
import ConnectButton from "@/components/ConnectButton";
import { formatEther } from "ethers";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useGameContext } from "./contexts/GameContext";
import { IWeb3ContextState, useWeb3Context } from "./contexts/Web3Context";
import useCoinFlipContract from "./hooks/useCoinFlipContract";
import styles from "./page.module.css";
import { Choice, GameState, ViewType } from "./types/types";

const Home = () => {

    const { state } = useWeb3Context() as IWeb3ContextState;
    const { viewType, setViewType, gameState, setGameState } = useGameContext();
    const [message, setMessage] = useState("");
    const contract = useCoinFlipContract();

    const coinflipAudio = useMemo(() => new Audio("coinflip-sfx.mp3"), []);
    const coinLandAudio = useMemo(() => new Audio("coinland-sfx.mp3"), []);
    const winAudio = useMemo(() => new Audio("win-sfx.mp3"), []);
    const loseAudio = useMemo(() => new Audio("lose-sfx.mp3"), []);

    useEffect(() => {

        const setUpEventListeners = async () => {
            if (!contract) {
                return;
            }
            const userAddress = await state.signer?.getAddress();

            contract.on("CoinFlip__FlipRequest", (player, requestId, amount, choice) => {
                console.log(`CoinFlip__FlipRequest(${player}, ${requestId}, ${amount} ${choice})`)
                if (userAddress === player) {
                    coinflipAudio.play();
                    setGameState(GameState.IN_PROGRESS);
                    setMessage(`Flipping ${formatEther(amount)} ETH\n on \n${choice === 0 ? Choice.HEADS : Choice.TAILS}`);
                }
            });

            contract.on("CoinFlip__FlipWin", async (player, requestId, amount) => {
                try {
                    console.log(`FlipWin: Player: ${player}, Request ID: ${requestId}, Amount: ${amount}`);
                    if (userAddress === player) {
                        await coinLandAudio.play();
                        winAudio.play();
                        setMessage(`You Won 🎉 | ${formatEther(amount)} ETH`);
                        setGameState(GameState.WIN);
                        setTimeout(() => {
                            setGameState(GameState.OPEN);
                            setMessage("");
                        }, 5000);
                    }
                } catch (error) {
                    console.log(`Error during FlipWin: ${error}`);
                }
            });

            contract.on("CoinFlip__FlipLoss", async (player, requestId, amount) => {
                try {
                    console.log(`FlipLoss: Player: ${player}, Request ID: ${requestId}, Amount: ${amount}`);
                    if (userAddress === player) {
                        await coinLandAudio.play();
                        loseAudio.play();
                        const strAmount: any = String(amount);
                        console.log(`Amount [String]: ${strAmount}`);
                        const lossAmount = strAmount / 2;
                        console.log(lossAmount);
                        setMessage(`You Lost 😂 | ${formatEther(lossAmount.toFixed(0))} ETH`);
                        setGameState(GameState.LOSS);
                        setTimeout(() => {
                            setGameState(GameState.OPEN);
                            setMessage("");
                        }, 5000);
                    }
                } catch (error) {
                    console.log(`Error during FlipLoss: ${error}`);
                }
            });
        }

        if (state.isAuthenticated) {
            setUpEventListeners();
        }
        return () => {
            console.log(`Tear down contract event listeners...`)
            contract?.removeAllListeners();
        }
    }, [state.isAuthenticated, contract])

    const renderContent = () => {
        if (!state.isAuthenticated) {
            return <ConnectButton />;
        }

        switch (gameState) {
            case GameState.OPEN:
                return <BetForm viewType={ViewType.CRYPTO} setGameState={setGameState} />;
            case GameState.IN_PROGRESS:
                return <p style={{ textAlign: "center", fontSize: "1.5em", lineHeight: 2 }}>{message} <br /> Please Wait...</p>;
            case GameState.LOSS:
            case GameState.WIN:
                const [mainMessage, subMessage] = message.split(" | ");
                console.log(`Message: ${message}`);
                console.log(`Main Message: ${mainMessage}`);
                console.log(`Sub Message: ${subMessage}`);
                return <p style={{ textAlign: "center", fontSize: "1.5em", lineHeight: 2 }}>{mainMessage} <br /> {subMessage}</p>;
            default:
                return null;
        }
    };

    return (
        <div style={{ marginTop: "25%" }}>
            <p style={{ fontSize: "2em", textAlign: "center" }}>CoinFlip</p>
            <div style={{ textAlign: "center" }}>
                {!state.isAuthenticated ? <Image src="/coinflip-heads.png" alt="" width={280} height={280} /> : <Image className={gameState === GameState.IN_PROGRESS ? styles.coin : ""} src="/coin-to-flip.png" width={280} height={280} alt="Coin" />}
            </div>
            {renderContent()}
        </div>
    );
};





export default Home;