# CoinFlip

(CoinFlip)["http://www.google.com"] is an on-chain dApp that allows users to place bets with ETH and predict the outcome of a coin flip. This project is a demonstration of my progress in smart contract development, leveraging Chainlink’s VRF for provably fair randomness.

[Notion Notes](https://www.notion.so/b4ea221c91e4427596df655b9738053f?pvs=25)

[CoinFlip Video Demo](https://github.com/RamanSB/CoinFlip/blob/main/frontend/public/coinflip-demo.mp4)


## Development & Issues

- See the ViewType.tsx component, implement this: Allow users to switch between viewing bet amounts in ETH & $. Requires usage of an API that will not rate limit so we can poll for the latest price of Ether.
- Add a way for users to fund the house via the Frontend (Currently only possible via interacting with the smart contract on chain).

## Tech Stack
- NextJS, React, ethers.js
- Foundry
    - Chainlink

## Features

1.	Single Active Bet: A user can only have one active bet at a time.
2.	Bet Placement: Users select a wager amount and their choice of heads or tails, then send a transaction to the CoinFlip contract.
3.	Random Number Generation: The contract requests a random number from Chainlink VRF v2.5, ensuring fairness.
4.	Randomness Proof: Chainlink VRF provides proof that the random number is untampered, ensuring the game is fair.
5.	Result Handling: The contract uses the random number to determine the outcome and either pays the user if they win or notifies them if they lose.

## How It Works

1.	Betting:
    -	Users must bet an amount above the minimum value.
    -	The contract checks if it has enough balance to cover potential payouts for all active bets.
    -	The contract keeps track of potential payouts using mapping(address => uint256) private totalPotentialPayouts;.
2.	Random Number Request:
    -	The contract generates a request for a random number using requestRandomWords.
    -	Chainlink VRF processes this request and provides a random number along with proof.
3.	Outcome and Payout:
    -	The random number determines the outcome (heads or tails).
    -	If the user wins, they receive double their wager amount.
    -	If the user loses, they are notified via an event.

## Requirements for a Bet

1.	Minimum Bet Amount: The bet must be above the minimum specified value.
2.	Sufficient Contract Balance: The contract must have enough balance to cover the potential payout, factoring in all active bets.
3.	No Active Bets: The user must not have any active bets that are unresolved.
