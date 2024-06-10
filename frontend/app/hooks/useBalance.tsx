import { formatEther } from "ethers";
import { useCallback, useEffect, useState } from "react";
import useWeb3Provider from "./useWeb3Provider";

const useBalance = (address: string) => {

    const { state } = useWeb3Provider();
    const [balance, setBalance] = useState<string>("0");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchBalance = useCallback(async () => {
        if (!state.provider) {
            console.log("Provider not available");
            return;
        }

        setLoading(true);
        try {
            const balance = await state.provider.getBalance(address);
            setBalance(formatEther(balance));
        } catch (error) {
            console.error(`Error fetching balance for ${address}:`, error);
        } finally {
            setLoading(false);
        }
    }, [address, state.provider])

    useEffect(() => {
        if (!address) {
            return;
        }
        fetchBalance();
        const interval = setInterval(fetchBalance, 20000); // 20 seconds
        return () => clearInterval(interval);
    }, [address, state.provider, fetchBalance]);

    return { balance, loading, fetchBalance };
};

export default useBalance;