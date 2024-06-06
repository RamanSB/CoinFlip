// Define shape of GameState

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";
import { GameState, ViewType } from "../types/types";

// Declare initial State

// Create Context with initial State

// Create Provider Wrapper w/ProviderWrapper Props

// Define state in provider wrapper & pass to value prop

export interface IGameContextState {
    viewType: ViewType;
    gameState: GameState;
    setViewType: Dispatch<SetStateAction<ViewType>>,
    setGameState: Dispatch<SetStateAction<GameState>>
}

export const GameContext = createContext<IGameContextState>({
    viewType: ViewType.CRYPTO,
    gameState: GameState.OPEN,
    setViewType: () => { },
    setGameState: () => { }
});

const GameContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [viewType, setViewType] = useState(ViewType.CRYPTO);
    const [gameState, setGameState] = useState(GameState.OPEN);
    return <GameContext.Provider value={{ viewType, setViewType, gameState, setGameState }}>
        {children}
    </GameContext.Provider>
}

export default GameContextProvider;

export const useGameContext = () => useContext(GameContext)