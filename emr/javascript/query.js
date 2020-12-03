/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const util = require('util')


async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        // const identity = await wallet.get('appUser');
        // if (!identity) {
        //     console.log('An identity for the user "appUser" does not exist in the wallet');
        //     console.log('Run the registerUser.js application before retrying');
        //     return;
        // }

        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('emr-channel');

        // Get the contract from the network.
        const contract = network.getContract('emr-chaincode');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')

        // const result = await contract.evaluateTransaction('queryAllEMRs');
        // const json_result = JSON.parse(result.toString());
        // json_result.forEach(element => {
        //     console.log(element);
        // });

        // Get EMR by ID
        // const result = await contract.evaluateTransaction('queryAllEMRs');
        // const result = await contract.evaluateTransaction('getHistoryEMR', '9858302d-041b-4bec-98d4-a017f2449295');
        // const result = await contract.evaluateTransaction('queryEMR', '9858302d-041b-4bec-98d4-a017f2449295');
        const result = await contract.evaluateTransaction('queryOwnEMR', '7067da01-43ff-4c54-a228-76b1956666e3');
        // const json_result = JSON.parse(result.toString()); 
        // console.log(json_result);

        // let str = JSON.parse(result.toString())
        // console.log(JSON.stringify(str))

        console.log(JSON.stringify(JSON.parse(result.toString()), null, 4))

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
