'use strict'
const {decodeToken} = require('./decodeToken')
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

module.exports = {
    post: async (req, res) => {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new CA client for interacting with the CA.
            const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            const ca = new FabricCAServices(caURL);

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            let data = decodeToken(req)
            if (data.message) {
                return res.status(401).send({message: data.message})
            }

            if (data.token_object.role === 'patient') {
                return res.status(401).send({message: 'Please log in with an administrator/physician/receptionist account.'})
            }
            
            const patient_id_registration = req.body.patient_id

            // Check to see if we've already enrolled the user.
            const userIdentity = await wallet.get(patient_id_registration);
            if (userIdentity) {
                console.log(`An identity for the user "${patient_id_registration}" already exists in the wallet`);
                const message = `An identity for the user "${patient_id_registration}" already exists in the wallet`
                return res.status(400).send({message: message})
            }

            // build a user object for authenticating with the CA
            const adminIdentity = await wallet.get('admin')
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'admin');

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: patient_id_registration,
                role: 'client'
            }, adminUser);
            const enrollment = await ca.enroll({
                enrollmentID: patient_id_registration,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };
            await wallet.put(patient_id_registration, x509Identity);
            console.log(`Successfully registered and enrolled user "${patient_id_registration}" and imported it into the wallet`);

            res.json({message: `Successfully registered and enrolled user "${patient_id_registration}" and imported it into the wallet`})
        } catch (error) {
            console.error(`Failed to register user "patient_id": ${error}`);
            res.status(400).send({message: `Failed to registered and enrolled patient "${patient_id_registration}"`})
        }
    },
}