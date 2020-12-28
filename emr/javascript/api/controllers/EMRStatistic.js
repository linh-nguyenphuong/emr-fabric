'use strict'
const {decodeToken} = require('./decodeToken')
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


module.exports = {
    get: async (req, res) => {
        try {
            const physician_id = req.query.physician_id
            // const month_from = req.query.month_from
            // const month_to = req.query.month_to
            // const year_from = req.query.year_from
            // const year_to = req.query.year_to

            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role !== 'admin' && data.token_object.role !== 'physician') {
                return res.status(401).send({message: 'Please log in with an administrator/physician account.'})
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
            
            const result_buffer = await contract.evaluateTransaction('queryAllEMRs');
            const result = JSON.parse(result_buffer.toString())

            let emr_monthyear_count = []
            let physician_monthyear_count = []
            let completed_emr_monthyear_count = []
            let uncompleted_emr_monthyear_count = []
            result.forEach(emr => {
                let dateObj = new Date(emr.Record.created_at);
                let monthyear = dateObj.toLocaleString("en-us", { month: "numeric", year: 'numeric' });
                emr_monthyear_count.push(monthyear)

                if (physician_id === emr.Record.physician.id) {
                    physician_monthyear_count.push(monthyear)
                }

                if (emr.Record.complete_at) {
                    completed_emr_monthyear_count.push(monthyear)
                }

                if (!emr.Record.complete_at) {
                    uncompleted_emr_monthyear_count.push(monthyear)
                }
            })

            var emr_num = {};
            emr_monthyear_count.forEach(function(x) { emr_num[x] = (emr_num[x] || 0)+1; });

            var emr_num_by_physician = {};
            physician_monthyear_count.forEach(function(x) { emr_num_by_physician[x] = (emr_num_by_physician[x] || 0)+1; });

            var completed_emr_num = {};
            completed_emr_monthyear_count.forEach(function(x) { completed_emr_num[x] = (completed_emr_num[x] || 0)+1; });

            var uncompleted_emr_num = {};
            uncompleted_emr_monthyear_count.forEach(function(x) { uncompleted_emr_num[x] = (uncompleted_emr_num[x] || 0)+1; });
            
            // Disconnect from the gateway.
            await gateway.disconnect();
            res.json({
                emr: emr_num,
                emr_created_by_physician: emr_num_by_physician,
                completed_emr_num: completed_emr_num,
                uncompleted_emr_num: uncompleted_emr_num,
            })
        } catch (error) {
            console.error(`Failed to submit transaction: ${error}`);
            res.status(400).send({message: `Failed to list all EMRs`})
        }     
    },
}
