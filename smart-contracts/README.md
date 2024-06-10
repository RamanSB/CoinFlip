# CoinFlip

CoinFlip is an on-chain dApp that allows users to place bets with ETH and predict the outcome of a coin flip. This project is a demonstration of my progress in smart contract development, leveraging Chainlink’s VRF for provably fair randomness.

## Contract Deployment
1. [Arbitrum]() 
    - vrfCoordinator: 0x3C0Ca683b403E37668AE3DC4FB62F4B29B6f7a3e,
    - subscriptionId: 96194385608759427314183591391526943240068207892336735647640395800380702672280,
    - gasLane: 0xe9f223d7d83ec85c4f78042a4845af3a1c8df7757b4997b815ce4b8d07aca68c,
    - callbackGasLimit: 500_000,
    - link: 0xf97f4df75117a78c1A5a0DBb814Af92458539FB4,
    - numOfRequestConfirmations: 1
2. [Sepolia]()
    - vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B, // address from sepolia
    - subscriptionId: 48384453260841176234049252282818005790251747561312733954909049654262149736105, 
    - gasLane: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
    - callbackGasLimit: 1_000_000,
    - link: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
    - numOfRequestConfirmations: 3


## Dependencies

Install depenencies by invoking: ```forge install <dependency>```

- chainlink-brownie-contracts
- solmate (i.e. ```forge install transmissions11/solmate```)
- openzeppelin-contracts (i.e. ```forge install OpenZeppelin/openzeppelin-contracts```)

## Testing

Tests Included

1.	Minimum Bet Revert
    - Test that a bet below the minimum amount causes a revert.
    -  Expectation: CoinFlip__BetIsBelowMinimumAmount.
2.	Active Bet Revert
    - Test that a new bet while having an unresolved bet causes a revert.
    - Expectation: CoinFlip__ExistingBetIsInProgress.
3.	Insufficient Contract Balance Revert
    - Test that a bet causing the contract balance to be insufficient for payout causes a revert.
    - Expectation: CoinFlip__InsufficientFundsForPayout.
4.	Successful Bet
    - Test that a valid bet is placed correctly and the random number request is processed.
5.	Winning Bet Handling
    - Test that a user placing a winning bet receives the correct payout.
6.	Losing Bet Handling
    - Test that a user placing a losing bet does not receive a payout.
7.	Owner Withdrawal
    - Test that only the contract owner can withdraw funds and non-owners cannot.