## CoinFlip

### Features

1. A user / public address can only flip one coin at a time.
2. User selects wager amount and outcome (H or T) and sends transaction to CoinFlip contract.
3. CoinFlip contract generates request for random number (requestRandomWords) using Chainlink VRF.
4. VRFCoordinator detects RequestRandomWordsEvent and generates a random number and sends number along with a verified proof of \
the number being random to CoinFlip contract (fufillRandomWords).
5. requestId can be used to fetch current state of the CoinFlip toss and if the output is as desired pay the owner otherwise notify the user they have lost (can emit Events).


For a user to make a bet:
    1. User must provide a bet amount above the minimum bet value.
    2. Contract must have a balance that is greater than or equal to the amount bet. We must factor in the potential pay out of existing bets from the funds the contract has.
    3. mapping(address => uint256) private totalPotentialPayouts; // Track of how much we potentially owe to a particular address. 
    4. 