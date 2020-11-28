/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class EMRUser extends Contract {

    async queryOwnEMR(ctx, emrNumber) {
        const emrAsBytes = await ctx.stub.getState(emrNumber); // get the emr from chaincode state
        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        console.log(emrAsBytes.toString());
        return emrAsBytes.toString();
    }

    // async queryAllEMRs(ctx) {
    //     const startKey = '';
    //     const endKey = '';
    //     const allResults = [];
    //     for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
    //         const strValue = Buffer.from(value).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push({ Key: key, Record: record });
    //     }
    //     console.info(allResults);
    //     return JSON.stringify(allResults);
    // }
}

module.exports = EMRUser;
