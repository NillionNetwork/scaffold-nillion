# 🏗 Scaffold-Nillion

This template has all the power of the [Scaffold-ETH 2 dapp toolkit](https://github.com/scaffold-eth/scaffold-eth-2) with a Nillion integration so that you can store, retrieve, and run blind computation on secrets stored in Nillion.

## Requirements

Before you begin, you need to install the following tools:

- `nilup`, an installer and version manager for the [Nillion SDK tools](https://docs.nillion.com/nillion-sdk-and-tools). Install nilup:

  _For the security-conscious, please download the `install.sh` script, so that you can inspect how
  it works, before piping it to `bash`._

  ```
  curl https://nilup.nilogy.xyz/install.sh | bash
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

- [python3](https://www.python.org/downloads/) version 3.11 or higher with a working [pip](https://pip.pypa.io/en/stable/getting-started/) installed

  - Confirm that you have python3 (version >=3.11) and pip installed:
    ```
    python3 --version
    python3 -m pip --version
    ```

- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
  - Check version with
    ```
    yarn -v
    ```
- [Git](https://git-scm.com/downloads)

To use Scaffold-ETH 2 with Nillion, you need to have the MetaMask Flask browser extension installed and to store your Nillion user key in MetaMask Snaps

1. Install the [MetaMask Flask browser extension](https://docs.metamask.io/snaps/get-started/install-flask/) that will let you work with experimental snaps.
2. Create a new test wallet in MetaMask Flask
3. Temporarily disable any other wallet browser extensions (Classic MetaMask, Rainbow Wallet, etc.) while using MetaMask Flask
4. [Visit the Nillion Key Management UI](https://nillion-snap-site.vercel.app/) to generate a user key and store it in MetaMask Snaps - this saves your user key within MetaMask so it can be used by other Nillion web apps
5. This quickstart will ask you to "Connect to Snap" to use your Nillion user key

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

### 1. Clone this repo & install dependencies

```
git clone https://github.com/NillionNetwork/scaffold-eth-with-nillion.git
cd scaffold-eth-with-nillion
yarn install
```

### 2. Run the Nillion devnet in the first terminal:

This bootstraps Nillion devnet, a local network of nodes and adds cluster info to your NextJS app .env file and blockchain info to your Hardhat .env file

```
yarn nillion-devnet
```

### 3. Run a local ethereum network in the second terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

### 4. Open a third terminal and deploy the test ethereum contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

### 5. Optional: Nada program setup

If you want to write your own Nada programs, open another terminal to create and activate a python virtual environment

```
cd packages/nillion && sh create-venv.sh && source .venv/bin/activate
```

The [nada tool](https://docs.nillion.com/nada) was used to initiate a project inside of packages/nillion/next-project-programs. Create a new Nada program file in next-project-programs/src

```
cd next-project-programs
touch src/{your-nada-program-name}.py
```

For example, if your program is `tiny_secret_addition.py`, run

```
cd next-project-programs
touch src/tiny_secret_addition.py
```

Write your Nada program in the file you just created. Then add the program path, name, and a prime size to your nada-project.toml file

```toml
[[programs]]
path = "src/{your-nada-program-name}.py"
name = "{your-nada-program-name}"
prime_size = 128
```

For example, if your program was `tiny_secret_addition.py`, add to nada-project.toml:

```toml
[[programs]]
path = "src/tiny_secret_addition.py"
name = "tiny_secret_addition"
prime_size = 128
```

Run the build command to build all programs added to the nada-project.toml file, creating nada.bin files for each Nada program.

```
nada build
```

[Generate a test file](https://docs.nillion.com/nada#generate-a-test-file) for your program passing in the test name and program name.

```
nada generate-test --test-name {your-test-name} {your-nada-program-name}
```

For example, if your program was `tiny_secret_addition.py`, run

```
nada generate-test --test-name tiny_secret_addition tiny_secret_addition
```

Update values in tests/{your-test-name}.yaml and run the test

```
nada run {your-test-name}
```

For example, if your test name was `tiny_secret_addition`, run

```
nada run tiny_secret_addition
```

Copy program binary file ({your-nada-program-name}.nada.bin) into nextjs public programs folder to use them in the nextjs app.

```
cp target/{your-nada-program-name}.nada.bin ../../nextjs/public/programs
```

For example, if your program was `tiny_secret_addition.py`, run

```
cp target/tiny_secret_addition.nada.bin ../../nextjs/public/programs
```

Copy the program file ({your-nada-program-name}.py) into nextjs public programs folder

```
cp src/{your-nada-program-name}.py ../../nextjs/public/programs
```

For example, if your program was `tiny_secret_addition.py`, run

```
cp src/tiny_secret_addition.py ../../nextjs/public/programs
```

Now the NextJs app has the Nada program and binaries in the `nextjs/public/programs` folder, where the program can be stored using the JavaScript Client.

### 6. Open one more terminal to start your NextJS web app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend in `packages/nextjs/pages`
- Edit your deployment scripts in `packages/hardhat/deploy`

### 7. Visit the Nillion Blind Computation demo page and try the working demo

- Visit the Nillion Blind Computation page to try out Blind Computation: `http://localhost:3000/nillion-compute`
- Optinally edit the code for this page in `packages/nextjs/app/nillion-compute/page.tsx`

### 8. Complete the TODOs in the Hello World page to hook up a working Nillion store and retrieve example

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
