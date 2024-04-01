# 🏗 Scaffold-Nillion

This template has all the power of the [Scaffold-ETH 2 dapp toolkit](https://github.com/scaffold-eth/scaffold-eth-2) with a Nillion integration so that you can store, retrieve, and run blind computation on secrets stored in Nillion.

## Requirements

Before you begin, you need to install the following tools:

- `nilup`, an installer and version manager for the [Nillion SDK tools](https://docs.nillion.com/nillion-sdk-and-tools). Install nilup:
  ```
  curl https://nilup.nilogy.xyz | bash
  ```
  - Confirm `nilup` installation
    ```
    nilup -V
    ```
- [Nillion SDK tools](https://docs.nillion.com/nillion-sdk-and-tools) Use `nilup` to install these:
  ```bash
  nilup install latest
  nilup use latest
  nilup init
  ```
  - Confirm global Nillion tool installation
    ```
    nillion -V
    ```
- [Node (>= v18.17)](https://nodejs.org/en/download/)
  - Check version with
    ```
    node -v
    ```
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
  - Check version with
    ```
    yarn -v
    ```
- [Git](https://git-scm.com/downloads)

To use Scaffold-ETH 2 with Nillion, you need have the MetaMask Flask browser extension installed and to store your Nillion user key in MetaMask Snaps

1. Install the [MetaMask Flask browser extension](https://docs.metamask.io/snaps/get-started/install-flask/) that will let you work with experimental snaps.
2. Create a new test wallet in MetaMask Flask
3. Temporarily disable any other wallet browser extensions (Classic MetaMask, Rainbow Wallet, etc.) while using MetaMask Flask
4. [Visit the Nillion Key Management UI](https://nillion-snap-site.vercel.app/) to generate a user key and store it in MetaMask Snaps - this saves your user key within MetaMask so it can be used by other Nillion web apps
5. This quickstart will ask you to "Connect to Snap" to use your Nillion user key

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/NillionNetwork/scaffold-eth-with-nillion.git
cd scaffold-eth-with-nillion
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

5. On a third terminal, run the Nillion devnet. This bootstraps Nillion devnet, a local network of nodes and adds cluster info to your NextJS app .env file

```
yarn nillion-devnet
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
- Need a hint on how to get something working? Take a look at the completed `packages/nextjs/app/nillion-hello-world-complete/page.tsx` page

## About Scaffold-ETH 2

🧪 [Scaffold-ETH 2](https://docs.scaffoldeth.io) is an open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)
