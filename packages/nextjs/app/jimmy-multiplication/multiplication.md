# Jimmy Multiplication Program
This template has all the power of the Scaffold-ETH 2 dapp toolkit with a Nillion integration so that you can store, retrieve, and run blind computation on secrets stored in Nillion. This tutorial program documents the steps in creating a multiplcation blind app with Nillion. 


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

1. Install the [MetaMask Flask browser extension](https://docs.metamask.io/snaps/get-started/install-flask/) that will let you work with experimental snaps
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

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`

### 4. Open a third terminal and deploy the test ethereum contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script

### 5. Jimmy multiplication App

If you want to write your own Nada programs, open another terminal to create and activate a python virtual environment

```
cd packages/nillion && sh create-venv.sh && source .venv/bin/activate
```

The [nada tool](https://docs.nillion.com/nada) was used to initiate a project inside of packages/nillion/next-project-programs. Create a new Nada program file in next-project-programs/src

```
cd next-project-programs
touch src/{your-nada-program-name}.py
```

For example, if your program is `jimmy_multiplication.py`, run

```
cd next-project-programs
touch src/jimmy_multiplication.py
```

Write your Nada program in the file you just created. Ensure you review [nada language](https://docs.nillion.com/nada-lang) for data types, built-in operations, and more

```bash
from nada_dsl import *

def nada_main():
party1 = Party(name="Party1")
party2 = Party(name="Party2")
party3 = Party(name="Party3")

# Define the inputs for the secret integers
secret_int1 = SecretInteger(Input(name="secret_int1", party=party1))
secret_int2 = SecretInteger(Input(name="secret_int2", party=party2))

# Perform multiplication
result = secret_int1 * secret_int2

# Return the result to party3
return [Output(result, "multiplication_result", party3)]
```

Let's breakdown this program we wrote:

```bash
from nada_dsl import *
```
This line imports everything from the nada_dsl module. nada_dsl is a library that helps you write programs that can perform secure, decentralized computations on secret data

```bash
def nada_main():
```
This line defines the main function of the program.

```bash
party1 = Party(name="Party1")
party2 = Party(name="Party2")
party3 = Party(name="Party3")
```
Here, three parties are being defined. A party represents a participant in the computation who owns some secret data. Party(name="Party1") creates a new party with the name “Party1”

```bash
# Define the inputs for the secret integers
secret_int1 = SecretInteger(Input(name="secret_int1", party=party1))
secret_int2 = SecretInteger(Input(name="secret_int2", party=party2))
```
These lines define two secret integer inputs. SecretInteger(Input(name="secret_int1", party=party1)) means that secret_int1 is a secret integer provided by party1. Similarly, secret_int2 is a secret integer provided by party2

```bash
# Perform multiplication
result = secret_int1 * secret_int2
```
This line multiplies the two secret integers. The result of this multiplication is stored in the variable result

```bash
# Return the result to party3
return [Output(result, "multiplication_result", party3)]
```
Finally, the result of the multiplication is returned to party3. Output(result, "multiplication_result", party3) creates an output named “multiplication_result” that contains the result of the computation and is given to party3

Then add the program path, name, and a prime size to your nada-project.toml file
```bash
[[programs]]
path = "src/{your-nada-program-name}.py"
name = "{your-nada-program-name}"
prime_size = 128
```

For example, if your program was `jimmy_multiplication.py`, add to nada-project.toml:

```bash
[[programs]]
path = "src/jimmy_multiplication.py"
name = "jimmy_multiplication"
prime_size = 128
```

Run the build command to build all programs added to the nada-project.toml file, creating nada.bin files for each Nada program

```
nada build
```

[Generate a test file](https://docs.nillion.com/nada#generate-a-test-file) for your program passing in the test name and program name

```
nada generate-test --test-name {your-test-name} {your-nada-program-name}
```

For example, if your program was `jimmy_multiplication`, run

```
nada generate-test --test-name jimmy_multiplication jimmy_multiplication
```

Update values in tests/{your-test-name}.yaml and run the test

```
nada run {your-test-name}
```

For example, if your test name was `jimmy_multiplication`, run

```
nada run jimmy_multiplication
```

Copy program binary file ({your-nada-program-name}.nada.bin) into nextjs public programs folder to use them in the nextjs app

```
cp target/{your-nada-program-name}.nada.bin ../../nextjs/public/programs
```

For example, if your program was `jimmy_multiplication.py`, run

```
cp target/jimmy_multiplication.nada.bin ../../nextjs/public/programs
```

Copy the program file ({your-nada-program-name}.py) into nextjs public programs folder

```
cp src/{your-nada-program-name}.py ../../nextjs/public/programs
```

For example, if your program was `jimmy_multiplication.py`, run

```
cp src/jimmy_multiplication.py ../../nextjs/public/programs
```

Now the NextJs app has the Nada program and binaries in the `nextjs/public/programs` folder, where the program can be stored using the JavaScript Client.

### 6. Open one more terminal to start your NextJS web app:

```
yarn start
```

Visit your app on: `http://localhost:3000`.

### 7. Visit the Nillion Blind Computation demo page and try the working demo

- Visit the Nillion Blind Computation page to try out Blind Computation: `http://localhost:3000/jimmy-multiplication`
- Optinally edit the code for this page in `packages/nextjs/app/jimmy-multiplication/page.tsx`

### 8. Create a new folder called jimmy-multiplication

- In the existing scaffold-eth-with-nillion repo, head to packges/nextjs/app and make a new file by called page.tsx
- Use the nillion-compute code in page.tsx as a starting point
- Update your page.tsx and test your program
