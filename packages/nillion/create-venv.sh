#!/usr/bin/env bash

PYTHON_MAJOR_MINOR_VERSION=""

function check_python_version() {
  required_version="3.11"
  current_version=$(python3 --version | cut -d ' ' -f2)
  PYTHON_MAJOR_MINOR_VERSION=$(echo $current_version | cut -d '.' -f1,2)
  if ! printf '%s\n' "$required_version" "$current_version" | sort -V | head -n 1 | grep -qx "$required_version"; then
    echo "This script requires Python ${required_version} or higher. You are running Python $current_version."
    exit 1
  fi
}

function create_venv () {
  if [[ ! -z "${VIRTUAL_ENV:-}" ]]; then
    echo "Virtualenv is already active! Run 'deactivate' to deactivate the virtualenv."
    return 0
  fi

  echo "Creating virtualenv"
  python3 -m pip install --user virtualenv==20.24.6

  NILLION_VENV=".venv"
  mkdir -p "$NILLION_VENV"
  python3 -m virtualenv -p python3 "$NILLION_VENV"
  source "$NILLION_VENV/bin/activate"
  python3 -m pip install -r requirements.txt

  echo "Virtualenv: $NILLION_VENV"
  echo "Check the $NILLION_VENV/lib/python${PYTHON_MAJOR_MINOR_VERSION}/site-packages folder to make sure you have py_nillion_client and nada_dsl packages"
}

check_python_version
create_venv
