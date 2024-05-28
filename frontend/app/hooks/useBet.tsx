import { useState } from "react";
import { TransactionReceipt, TransactionResponse, parseUnits } from "ethers";
import useCoinFlipContract from "./useCoinFlipContract";

const useBet = () => {
    const contract = useCoinFlipContract();
    const [loading, setLoading] = useState(false);

    const bet = async (choice: number, amount: number) => {
        console.log(`useBet(${choice}, ${amount})`);
        if (!contract) return;

        setLoading(true);

        try {
            const betAmount = parseUnits(amount.toString(), 18);
            const transaction: TransactionResponse = await contract.bet(choice, { value: betAmount });
            console.log(`bet(): Txn Hash: ${transaction.hash}`)
            console.log(`bet(): Nonce: ${transaction.nonce}`)
            console.log(`bet(): Data: ${transaction.data}`)
            console.log(`bet(): Provider: ${transaction.provider}`)
            const receipt: TransactionReceipt | null = await transaction.wait();
            if (receipt) {
                console.log(`bet() - Receipt -`);
                console.log(`bet(): Status: ${receipt.status}`);
                console.log(`bet(): TxnHash: ${receipt.hash}`);
                console.log(`bet(): Gas Price: ${receipt.gasPrice}`);
                console.log(`bet(): Gas Used: ${receipt.gasUsed}`);
                console.log(`bet(): Logs: ${JSON.stringify(receipt.logs)}`);
                console.log(`bet(): Logs Bloom: ${receipt.logsBloom}`);
            }
        } catch (error) {
            console.log(`Error whilst invoking bet(${choice}, ${parseUnits(amount.toString(), 18)}): ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return { bet, loading };
};

export default useBet;