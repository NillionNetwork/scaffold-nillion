#!/usr/bin/env bash

set -ex

curl -L https://foundry.paradigm.xyz | bash

FOUNDRY_PATH="$HOME/.foundry/bin"
echo "Add $FOUNDRY_PATH to your PATH to have the foundryup available in your shell."

# The foundryup command uses its "latest" tag when no args are specified. We
# previously tried to pin the tag to a specific nightly release, but it turns
# out the foundry project deletes those tags periodically.
$FOUNDRY_PATH/foundryup
