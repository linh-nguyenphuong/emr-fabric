'use strict'
const {decodeToken} = require('./decodeToken')
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


module.exports = {
    get: async (req, res) => {
        try {
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.emr.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const user_id = data.token_object.user_id
            const identity = await wallet.get(user_id);
            if (!identity) {
                console.log('An identity for the user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.js application before retrying');
                const message = `An identity for the user "${user_id}" doesn't exist in the wallet`
                return res.status(400).send({message: message})
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: user_id, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('emr-channel');
    
            // Get the contract from the network.
            const contract = network.getContract('emr-chaincode');
    
            const result = await contract.evaluateTransaction('queryOwnEMR', user_id);
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({data: JSON.parse(result.toString())})
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to list all EMRs`})
        }     
    },
    detail: async (req, res) => {
        try {
            const emr_id = req.params.emr_id
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            // if (data.token_object.role !== 'user' && data.token_object.uesr_id !== patient_id) {
            //     return res.status(401).send({message: 'EMR is not owned by the current user.'})
            // }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.emr.com', 'connection-org1.json');
            let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    
            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);
    
            // Check to see if we've already enrolled the user.
            const user_id = data.token_object.user_id
            const identity = await wallet.get(user_id);
            if (!identity) {
                console.log('An identity for the user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.js application before retrying');
                const message = `An identity for the user "${user_id}" doesn't exist in the wallet`
                return res.status(400).send({message: message})
            }
    
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: user_id, discovery: { enabled: true, asLocalhost: true } });
    
            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('emr-channel');
    
            // Get the contract from the network.
            const contract = network.getContract('emr-chaincode');
            const result = await contract.evaluateTransaction('getHistoryEMR', emr_id);
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({data: JSON.parse(result.toString())})
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to get EMR history "${emr_id}"`})
        }
    },
}