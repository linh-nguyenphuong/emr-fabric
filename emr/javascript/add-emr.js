/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('emr-channel');

        // Get the contract from the network.
        const contract = network.getContract('emr-chaincode');

        // Submit the specified transaction.
        let patient = {
            id: "7067da01-43ff-4c54-a228-76b1956666e2",
            first_name: "Ed",
            last_name: "Helen",
            gender: "Nữ",
            role: "patient",
            avatar: null,
            DOB: "1990-01-01"
        }
        let physician = {
            id: "86274125-3bb4-4a2a-9bf2-809204db06b9",
            first_name: "EMR",
            last_name: "Physician",
            gender: "Nam",
            role: "physician",
            avatar: "https://res.cloudinary.com/linhpnguyen/image/upload/v1603557722/emr/user_avatar/ath7tysqsrneqimhvtb0.jpg"
        }
        let room = "Phòng 21"
        let living_functions = {
            heartbeat: "110",
            temp: "10",
            pressure: "10",
            breathing: "110",
            height: "160",
            weight: "62",
            bmi: 24.218749999999996
        }
        let emr_diseases = [
            {
                diseaseCategory: "3bc180fe-676b-4dd8-87ea-15e2c36d62d3",
                disease: "Bệnh 5"
            }
        ]
        let emr_services = [
            {
                service: "Dịch vụ 1",
                price: "123"
            },
            {
                service: "Dịch vụ 2",
                price: "456"
            }
        ]
        let emr_drugs = [
            {
                total: "4",
                numberOfDays: "1",
                morning: "1",
                afternoon: "1",
                evening: "1",
                night: "1",
                drugInstruction: "Hướng dẫn sử dụng",
                drugCategory: "e74efef3-841f-4538-acf0-573da4d3a071",
                drug: "Thuốc cảm"
              },
              {
                total: "8",
                drugCategory: "e74efef3-841f-4538-acf0-573da4d3a071",
                drug: "Thuốc cảm",
                drugInstruction: "Hướng dẫn sử dụng",
                numberOfDays: "2",
                morning: "1",
                afternoon: "1",
                evening: "1",
                night: "1"
              }
        ]
        let images = []
        await contract.submitTransaction('createEMR', '9858302d-041b-4bec-98d4-a017f2449294', JSON.stringify(patient), JSON.stringify(physician), JSON.stringify(room), JSON.stringify(living_functions), JSON.stringify(emr_diseases), JSON.stringify(emr_services), JSON.stringify(emr_drugs), JSON.stringify(images));
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
