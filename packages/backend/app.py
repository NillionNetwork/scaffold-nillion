import base64
from decimal import Decimal
import json
import os
import py_nillion_client
import serverless_wsgi
import subprocess
import tempfile
from waterbear import Bear
from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3 import Web3
from web3.middleware import construct_sign_and_send_raw_middleware, geth_poa_middleware

from flask import Flask, jsonify, request
from flask_cors import CORS


NILLION_CLUSTER_CONFIG = "/var/task/remote.json"
BIN_CAST = "/root/.foundry/bin/cast"
BIN_PYNADAC = "/var/task/pynadac"

NILLION_FAUCET_PK = os.environ["NILLION_FAUCET_PK"]
NILLION_SERVICE_PK = os.environ["NILLION_SERVICE_PK"]
NILLION_NODE_SEED = os.environ.get("NILLION_NODE_SEED", "test-seed-0")

ETH_LOW_BALANCE_THRESHOLD = 0.5
ETH_FAUCET_TRANSFER_AMT = 3.0

with open(NILLION_CLUSTER_CONFIG, "r") as fp:
    config = json.load(fp)
    config = Bear(**config)

app = Flask(__name__)
CORS(app)


@app.route("/upload-nada-source/<program_name>", methods=["POST"])
async def upload_nada_source(program_name):
    print(f"starting upload-nada-source of {program_name}")
    data = request.get_json()
    base64_nadasource = data["nadalang"]
    source = base64.b64decode(base64_nadasource).decode("utf-8")

    with tempfile.NamedTemporaryFile(
        mode="w", dir="/tmp", suffix=".py", delete=False
    ) as temp_file:
        temp_file.write(source)

    target_dir = os.path.dirname(temp_file.name)
    try:
        result = subprocess.run(
            [BIN_PYNADAC, "--target-dir", target_dir, temp_file.name],
            capture_output=True,
            text=True,
        )
        if "failed" in result.stderr.lower():
            raise Exception("|".join([result.stderr, result.stdout]))
    except Exception as e:
        error_message = f"pynadac execution failed: [{e}]"
        return jsonify({"statusCode": 400, "error": error_message})

    only_file_name = os.path.basename(temp_file.name)
    compiled_name = os.path.splitext(only_file_name)[0] + ".nada.bin"
    compiled_program = os.path.join(target_dir, compiled_name)

    payments_config = py_nillion_client.PaymentsConfig(
        config.payments_config.rpc_endpoint,
        NILLION_SERVICE_PK,
        int(config.payments_config.signer.wallet.chain_id),
        config.payments_config.smart_contract_addresses.payments,
        config.payments_config.smart_contract_addresses.blinding_factors_manager,
    )

    nodekey = py_nillion_client.NodeKey.from_seed(NILLION_NODE_SEED)
    userkey = py_nillion_client.UserKey.generate()
    client = py_nillion_client.NillionClient(
        nodekey,
        config.bootnodes,
        py_nillion_client.ConnectionMode.relay(),
        userkey,
        payments_config,
    )

    result = await client.store_program(
        config.cluster_id, program_name, compiled_program
    )
    return jsonify(
        {
            "statusCode": 200,
            "guid": result,
            "programid": f"{client.user_id()}/{program_name}",
        }
    )


@app.route("/faucet/<address>", methods=["POST"])
def faucet(address):

    try:
        print(f"starting faucet for address {address}")

        rpc_url = config.payments_config.rpc_endpoint
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        assert w3.is_connected(), "Failed to connect to rpc backend"

        prime_account: LocalAccount = Account.from_key(NILLION_FAUCET_PK)
        w3.middleware_onion.add(construct_sign_and_send_raw_middleware(prime_account))

        print(f"Your hot wallet address is {prime_account.address}")

        low_balance_threshold_amount_wei = Web3.to_wei(
            Decimal(ETH_LOW_BALANCE_THRESHOLD), "ether"
        )

        wallet_balance_wei = w3.eth.get_balance(address)
        if wallet_balance_wei > low_balance_threshold_amount_wei:
            raise Exception("wallet not eligable for faucet")

        tx_hash = w3.eth.send_transaction(
            {
                "from": prime_account.address,
                "to": address,
                "value": Web3.to_wei(Decimal(ETH_FAUCET_TRANSFER_AMT), "ether"),
            }
        )

        tx = w3.eth.get_transaction(tx_hash)
        assert tx["from"] == prime_account.address
        return jsonify({"statusCode": 200, "tx": tx_hash.hex()})

    except Exception as e:
        error_message = f"faucet execution failed: {e}"
        return jsonify({"statusCode": 400, "error": error_message})


def handler(event, context):
    return serverless_wsgi.handle_request(app, event, context)
