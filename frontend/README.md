[CoinFlip](https://nextjs.org/) is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Frontend
CoinFlip's frontend is written using Typescript leveraging NextJS a Framework for React application development. 

### Features
1. Users are able to connect to our applications using their ethereum wallet in their browsers extension. We use the BrowserProvider to generate requests to the user.
2. User can select Heads or Tails along with a predetermined amount of ETH to bet.
3. User is notified when their bet has gone through (i.e. txn contained in the block is processed) and the outcome of win or lose. 


### Dependencies

1. Ethers.js:
    - Provider: Read only connection to blockchain.
    - Signer: Wraps all operations that interact with an account. Accounts have a private key associated with them, signers can use this to sign payloads.
    - Contract: Leverages contract address & ABI to create a Contract object that we can listen to events on.
2. MUI (UI / Component Library)
<br/>


## Getting Started

Begin by installing the dependencies:

```
npm install
```

Then run <code>npm run dev</code> and view the results at [`http://localhost:3000`](http://localhost:3000)

## Requirements

1. User must have an Ethereum wallet extension on their browser, alternatively if they are using mobile they must use a wallet app i.e. MetaMask.


## Resources

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.