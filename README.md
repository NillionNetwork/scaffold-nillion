# 🏗 Scaffold-ETH 2 with Nillion

This template has all the power of the Scaffold-ETH 2 dapp toolkit with a Nillion integration so that you can store, retrieve, and run blind computation on secrets stored in Nillion.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

To use Scaffold-ETH 2 with Nillion, you need to store your user key in MetaMask Snaps

1. Install the [MetaMask Flask browser extension](https://docs.metamask.io/snaps/get-started/install-flask/) that will let you work with experimental snaps

2. [Visit the Nillion Key Management UI](https://nillion-snap-site.vercel.app/) to generate a user key and store it in MetaMask Snaps - this saves your user key within MetaMask so it can be used by other Nillion web apps

3. Run through this quickstart and "Connect to Snap" from the UI

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/NillionNetwork/scaffold-eth-with-nillion.git
cd scaffold-eth-with-nillion
```

Installation steps

Complete these temporary install steps to install the private @nillion/nillion-client-js-browser package

Remove the @nillion/nillion-client-js-browser package

```
yarn remove @nillion/nillion-client-js-browser
```

Reinstall @nillion/nillion-client-js-browser with your NPM_TOKEN

```
NPM_TOKEN=your_npm_token npm i @nillion/nillion-client-js-browser
```

Then install the rest of the dependencies

```bash
yarn install
```

3. Run a local ethereum network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

4. On a second terminal, deploy the test ethereum contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

5. On a third terminal, run a Nillion local network cluster. This bootstraps a Nillion local network of nodes and adds cluster info to your NextJS app .env file

```
yarn run-local-cluster
```

6. On a fourth terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

7. Visit the Nillion Blind Computation demo page and try the working demo

- Visit the Nillion Blind Computation page to try out Blind Computation: `http://localhost:3000/nillion-compute`
- Optinally edit the code for this page in `packages/nextjs/app/nillion-compute/page.tsx`

8. Complete the TODOs in the Hello World page to hook up a working Nillion store and retrieve example

- Visit the Nillion Hello World page: `http://localhost:3000/nillion-hello-world`
- Notice that the buttons and functionality for this page are not hooked up yet.
- Edit the code for this page in `packages/nextjs/app/nillion-hello-world/page.tsx` to complete each of the 🎯 TODOs to get the page working
- Need a hint on how to get something working? Take a look at the completed `packages/nextjs/nillion-hello-world/page-complete.tsx` page

## About Scaffold-ETH 2

🧪 [Scaffold-ETH 2](https://docs.scaffoldeth.io) is an open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)
