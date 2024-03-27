#!/usr/bin/env bash

RUN_LOCAL_CLUSTER="./run-local-cluster"
USER_KEYGEN="./user-keygen"
NODE_KEYGEN="./node-keygen"

echo $RUN_LOCAL_CLUSTER
# kill any other run-local-cluster processes
pkill -9 -f $RUN_LOCAL_CLUSTER

for var in RUN_LOCAL_CLUSTER USER_KEYGEN NODE_KEYGEN; do
  printf "ℹ️ found bin %-18s -> [${!var:?Failed to discover $var}]\n" "$var"
done

OUTFILE=$(mktemp);
PIDFILE=$(mktemp);

echo $OUTFILE

# Create node keys
NODEKEY_FILE_PARTY_1=$(mktemp);
NODEKEY_FILE_PARTY_2=$(mktemp);
NODEKEY_FILE_PARTY_3=$(mktemp);
NODEKEY_FILE_PARTY_4=$(mktemp);
NODEKEY_FILE_PARTY_5=$(mktemp);

# Crete user keys
USERKEY_FILE_PARTY_1=$(mktemp);
USERKEY_FILE_PARTY_2=$(mktemp);
USERKEY_FILE_PARTY_3=$(mktemp);
USERKEY_FILE_PARTY_4=$(mktemp);
USERKEY_FILE_PARTY_5=$(mktemp);

"$RUN_LOCAL_CLUSTER" >"$OUTFILE" & echo $! >"$PIDFILE";
ENV_TO_UPDATE=".env ../nextjs/.env"
echo "--------------------"
echo "Updating your ${ENV_TO_UPDATE} files with run-local-cluster environment info... This may take a minute."
echo "--------------------"
time_limit=160
while true; do
    # Use 'wait' to check if the log file contains the string
    if grep "cluster is running, bootnode is at" "$OUTFILE"; then
        break
    fi

    # If the time limit has been reached, print an error message and exit
    if [[ $SECONDS -ge $time_limit ]]; then
        echo "Timeout reached while waiting for cluster to be ready in '$OUTFILE'" >&2
        exit 1
    fi
    sleep 5
done

echo "ℹ️ Cluster has been STARTED (see $OUTFILE)"
cat "$OUTFILE"

CLUSTER_ID=$(grep "cluster id is" "$OUTFILE" | awk '{print $4}');
WEBSOCKET=$(grep "websocket:" "$OUTFILE" | awk '{print $2}');
BOOT_MULTIADDR=$(grep "cluster is running, bootnode is at" "$OUTFILE" | awk '{print $7}');
PAYMENTS_CONFIG_FILE=$(grep "payments configuration written to" "$OUTFILE" | awk '{print $5}');
WALLET_KEYS_FILE=$(grep "wallet keys written to" "$OUTFILE" | awk '{print $5}');
PAYMENTS_RPC=$(grep "blockchain_rpc_endpoint:" "$PAYMENTS_CONFIG_FILE" | awk '{print $2}');
PAYMENTS_CHAIN=$(grep "chain_id:" "$PAYMENTS_CONFIG_FILE" | awk '{print $2}');
PAYMENTS_SC_ADDR=$(grep "payments_sc_address:" "$PAYMENTS_CONFIG_FILE" | awk '{print $2}');
PAYMENTS_BF_ADDR=$(grep "blinding_factors_manager_sc_address:" "$PAYMENTS_CONFIG_FILE" | awk '{print $2}');
WALLET_PRIVATE_KEY=$(tail -n1 "$WALLET_KEYS_FILE")

# Generate multiple node keys
"$NODE_KEYGEN" "$NODEKEY_FILE_PARTY_1"
"$NODE_KEYGEN" "$NODEKEY_FILE_PARTY_2"
"$NODE_KEYGEN" "$NODEKEY_FILE_PARTY_3"
"$NODE_KEYGEN" "$NODEKEY_FILE_PARTY_4"
"$NODE_KEYGEN" "$NODEKEY_FILE_PARTY_5"

# Generate multiple user keys
"$USER_KEYGEN" "$USERKEY_FILE_PARTY_1"
"$USER_KEYGEN" "$USERKEY_FILE_PARTY_2"
"$USER_KEYGEN" "$USERKEY_FILE_PARTY_3"
"$USER_KEYGEN" "$USERKEY_FILE_PARTY_4"
"$USER_KEYGEN" "$USERKEY_FILE_PARTY_5"

echo "🔑 Node key and user keys have been generated"

# Function to update or add an environment variable 
update_env() {
    local key=$1
    local value=$2
    # Skip the first two arguments to get the file paths
    local files=("${@:3}")

    for file in "${files[@]}"; do
        if [ -f "$file" ]; then  # Check if file exists
            # Check if the key exists in the file and remove it
            if grep -q "^$key=" "$file"; then
                # Key exists, remove it
                grep -v "^$key=" "$file" > temp.txt && mv temp.txt "$file"
            fi

            # Append the new key-value pair to the file
            echo "$key=$value" >> "$file"
        else
            echo "File $file not found. Creating $file"
            touch $file
            echo "$key=$value" >> "$file"
        fi
    done
}

log_file_contents() {
    local file_path=$1  # Direct path to the target file

    # Check if the file exists at the path
    if [[ ! -f "$file_path" ]]; then
        echo "File $file_path does not exist."
        return 1  # Exit the function with an error status if the file does not exist
    fi

    # If the file exists, cat its contents
    cat "$file_path"
}

# Add environment variables to .env
update_env "NEXT_PUBLIC_NILLION_WEBSOCKETS" "$WEBSOCKET" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_CLUSTER_ID" "$CLUSTER_ID" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_BLOCKCHAIN_RPC_ENDPOINT" "$PAYMENTS_RPC" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_BLINDING_FACTORS_MANAGER_SC_ADDRESS" "$PAYMENTS_BF_ADDR" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_PAYMENTS_SC_ADDRESS" "$PAYMENTS_SC_ADDR" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_CHAIN_ID" "$PAYMENTS_CHAIN" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_WALLET_PRIVATE_KEY" "$WALLET_PRIVATE_KEY" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_BOOTNODE_MULTIADDRESS" "$BOOT_MULTIADDR" $ENV_TO_UPDATE

# Add user key paths and user keys to .env
update_env "NEXT_PUBLIC_NILLION_USERKEY_PATH_PARTY_1" "$USERKEY_FILE_PARTY_1" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_TEXT_PARTY_1" $(log_file_contents $USERKEY_FILE_PARTY_1) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_PATH_PARTY_2" "$USERKEY_FILE_PARTY_2" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_TEXT_PARTY_2" $(log_file_contents $USERKEY_FILE_PARTY_2) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_PATH_PARTY_3" "$USERKEY_FILE_PARTY_3" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_TEXT_PARTY_3" $(log_file_contents $USERKEY_FILE_PARTY_3) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_PATH_PARTY_4" "$USERKEY_FILE_PARTY_4" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_TEXT_PARTY_4" $(log_file_contents $USERKEY_FILE_PARTY_4) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_PATH_PARTY_5" "$USERKEY_FILE_PARTY_5" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_USERKEY_TEXT_PARTY_5" $(log_file_contents $USERKEY_FILE_PARTY_5) $ENV_TO_UPDATE

# Add node key paths and node keys to .env
update_env "NEXT_PUBLIC_NILLION_NODEKEY_PATH_PARTY_1" "$NODEKEY_FILE_PARTY_1" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_TEXT_PARTY_1" $(log_file_contents $NODEKEY_FILE_PARTY_1) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_PATH_PARTY_2" "$NODEKEY_FILE_PARTY_2" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_TEXT_PARTY_2" $(log_file_contents $NODEKEY_FILE_PARTY_2) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_PATH_PARTY_3" "$NODEKEY_FILE_PARTY_3" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_TEXT_PARTY_3" $(log_file_contents $NODEKEY_FILE_PARTY_3) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_PATH_PARTY_4" "$NODEKEY_FILE_PARTY_4" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_TEXT_PARTY_4" $(log_file_contents $NODEKEY_FILE_PARTY_4) $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_PATH_PARTY_5" "$NODEKEY_FILE_PARTY_5" $ENV_TO_UPDATE
update_env "NEXT_PUBLIC_NILLION_NODEKEY_TEXT_PARTY_5" $(log_file_contents $NODEKEY_FILE_PARTY_5) $ENV_TO_UPDATE

echo "--------------------"
echo "ℹ️  Updated your $ENV_TO_UPDATE file configurations with variables: websocket, cluster id, keys, blockchain info"
echo "💻 Your Nillion local cluster is still running - process pid: $(pgrep -f $RUN_LOCAL_CLUSTER)"

exit 0