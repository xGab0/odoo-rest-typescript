#!/bin/bash

# Absolute path of the Virtual Environment
venv_path="/Users/gabriele/Desktop/repositories/odoo-rest-typescript/python/venv/bin"

# Check if this command is running in Fish shell
if [[ -n "$FISH_VERSION" ]]; then
    activate_script="$venv_path/activate.fish"
else
    activate_script="$venv_path/activate"
fi

# Activate the Virtual Environment
source "$activate_script"

# Absolute path of the Odoo bin
odoo_bin="/Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/src/odoo-bin"

# Odoo start command
odoo_command="$odoo_bin -c /Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/odoo.conf --xmlrpc-port=8070 -u odoo-rest -u dummy"

# Esegui il comando
$odoo_command
