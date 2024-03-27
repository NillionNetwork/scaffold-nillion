# 🏗 Scaffold-ETH 2 with Nillion

This template has all the power of Scaffold-ETH 2 with a Nillion integration

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

Before using Nillion, you need to store your user key in MetaMask Snaps

1. Install the [MetaMask Flask browser extension](https://docs.metamask.io/snaps/get-started/install-flask/) that will let you work with experimental snaps

2. [Visit the Nillion Key Management UI](https://github.com/NillionNetwork/nillion-snap) to generate a user key and store it in Snaps

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

3. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

4. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

5. On a third terminal, run a Nillion local cluster

Install [Nillion SDK Binaries](https://docs.nillion.com/quickstart#download-binaries) following the [Install binaries guide](https://docs.nillion.com/quickstart#install-the-nillion-sdk) if you don't have Nillion SDK tools installed locally

Then use the nillion [run-local-cluster tool](https://docs.nillion.com/program-simulator) to spin up a local cluster of Nillion nodes. You will run your app against this local cluster

```
./run-local-cluster
```

After a moment, the tool will log custom cluster information into your command line, for example:

```bash
# Example run-local-cluster output
ℹ️ cluster id is 798d89ce-37f4-4d7d-aab9-ba511ae67ccc
ℹ️ using 256 bit prime
ℹ️ storing state in /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpfyozMh
⛓️ starting blockchain node...
✔️ blockchain node running on endpoint http://localhost:55501
🏃 starting node 12D3KooWSqDTmdKdJ6AWaVMgUKdLBBVeF6mRo2sLuqbgjjCFEtDK
⏳ waiting until bootnode is up...
🏃 starting node 12D3KooWQecC226DfT1q1CiYPxRGiJhrXpeLxV8AtcPZeKYB3wog
🏃 starting node 12D3KooWQc45ubzkGN6P3qipdUdFEgDTTjYtU3UuBbK7hBzJe5Ng
🏃 starting node 12D3KooWBXSwSu77B4vp5QQGL5nt959w2HjQDGcgiZKhaQRkd95J
🏃 starting node 12D3KooWBPfggEeDSSsfHya55oRH9gWgWeeC3yHF2GiQSXeSp91P
🎁 wallet keys written to /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpfyozMh/private-keys.txt
📝 payments configuration written to /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpfyozMh/payments-config.yaml
🥾 bootnode config written to /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpfyozMh/bootnode.yaml
📝 configuration written to /Users/steph/Library/Application Support/nillion.nil-cli/config.yaml
✔️ cluster is running, bootnode is at /ip4/127.0.0.1/tcp/55692/p2p/12D3KooWSqDTmdKdJ6AWaVMgUKdLBBVeF6mRo2sLuqbgjjCFEtDK
🔗 websocket: /ip4/127.0.0.1/tcp/55693/ws/p2p/12D3KooWSqDTmdKdJ6AWaVMgUKdLBBVeF6mRo2sLuqbgjjCFEtDK
```

Use the output values to update all values within your [packages/nextjs/utils/nillion/nillionConfig.ts](https://github.com/NillionNetwork/scaffold-eth-with-nillion/blob/main/packages/nextjs/utils/nillion/nillionConfig.ts) file. Make the following updates:

- update websockets to be an array containing the output 🔗 websocket
- update cluster_id to the output ℹ️ cluster id
- update rpc_endpoint to the blockchain_rpc_endpoint value written into the 📝 payments configuration file
- update blinding_factors_manager to the blinding_factors_manager_sc_address value written into the 📝 payments configuration file
- update payments to the payments_sc_address value written into the 📝 payments configuration file
- update chain_id to the chain_id value written into the 📝 payments configuration file
- update private_key to one of the rotating values written into the 🎁 wallet keys file

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
