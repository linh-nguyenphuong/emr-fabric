'use strict'
const {decodeToken} = require('./decodeToken')
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


module.exports = {
    get: async (req, res) => {
        try {
            const patient_id = req.body.patient_id
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
    
            const result = await contract.evaluateTransaction('queryOwnEMR', patient_id);
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

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
    update: async (req, res) => {
        try {
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
    
            // Submit the specified transaction.
            const emr_id = req.params.emr_id
            const patient = req.body.patient
            const physician = req.body.physician
            const room = req.body.room
            const living_functions = req.body.living_functions
            const emr_diseases = req.body.emr_diseases
            const emr_services = req.body.emr_services
            const emr_drugs = req.body.emr_drugs
            const images = req.body.images
            await contract.submitTransaction('updateEMR', emr_id, JSON.stringify(patient), JSON.stringify(physician), JSON.stringify(room), JSON.stringify(living_functions), JSON.stringify(emr_diseases), JSON.stringify(emr_services), JSON.stringify(emr_drugs), JSON.stringify(images));
            const result = await contract.evaluateTransaction('queryEMR', emr_id);
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({
                message: `Successfully updated EMR "${emr_id}"`,
                data: JSON.parse(result.toString())
            })
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to update EMR "${emr_id}"`})
        }
    },
    post: async (req, res) => {
        try {
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
    
            // Submit the specified transaction.
            const visit_id = req.body.visit_id
            const patient = req.body.patient
            const physician = req.body.patient
            const room = req.body.room
            const living_functions = req.body.living_functions
            const emr_diseases = req.body.emr_diseases
            const emr_services = req.body.emr_services
            const emr_drugs = req.body.emr_drugs
            const images = req.body.images
            await contract.submitTransaction('createEMR', visit_id, JSON.stringify(patient), JSON.stringify(physician), JSON.stringify(room), JSON.stringify(living_functions), JSON.stringify(emr_diseases), JSON.stringify(emr_services), JSON.stringify(emr_drugs), JSON.stringify(images));
            const result = await contract.evaluateTransaction('queryEMR', visit_id);
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({
                message: `Successfully created EMR "${visit_id}"`,
                data: JSON.parse(result.toString())
            })
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to create EMR "${visit_id}"`})
        }
    },
    complete: async (req, res) => {
        try {
            const emr_id = req.params.emr_id
            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
            }

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
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
            await contract.evaluateTransaction('completeEMR', emr_id);
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({
                message: `Successfully completed EMR "${emr_id}"`
            })
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to get EMR history "${emr_id}"`})
        }
    },
}
