#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

# clean out any old identites in the wallets
rm -rf javascript/wallet/*
rm -rf java/wallet/*
rm -rf typescript/wallet/*
rm -rf go/wallet/*

# launch network; create channel and join peer to channel
pushd ../emr-network
./network.sh down
./network.sh up createChannel -c emr-channel -ca -s couchdb
./network.sh deployCC -c emr-channel -ccn emr-chaincode -ccv 1 -ccl javascript -ccp ../chaincode/admin/
popd

pushd ./javascript
node enrollAdmin.js
node registerUser.js
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

EMR-HyperledgerFabric started successfully :)

EOF
