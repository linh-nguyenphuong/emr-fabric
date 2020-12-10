/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const util = require('util')

class EMRAdmin extends Contract {

    async queryEMR(ctx, emrNumber) {
        const emrAsBytes = await ctx.stub.getState(emrNumber); // get the emr from chaincode state
        try {
            let data = util.inspect(ctx, {showHidden: false, depth: 2})
            console.log(data)
        }
        catch (e) {
            console.log('Error: ', e)
        }

        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        return emrAsBytes.toString();
    }

    async getHistoryEMR(ctx, emrNumber) {
        const allResults = [];
        const emrAsBytes = await ctx.stub.getHistoryForKey(emrNumber); // get the emr from chaincode state

        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        
        emrAsBytes.response.results.forEach(element => {
            let str = element.resultBytes.toString()
            let emr = str.substring(str.indexOf('{'), str.lastIndexOf('}') + 1)
            allResults.push(JSON.parse(emr))
        });

        return JSON.stringify(allResults);
    }

    async createEMR(ctx, emrNumber, patient, physician, room, living_functions, emr_diseases, emr_services, emr_drugs, images) {
        console.info('============= START : Create EMR ===========');

        // Check emrNumber already existed
        const emr_existed = await ctx.stub.getState(emrNumber)
        if (emr_existed && emr_existed.length > 0) {
            throw new Error(`${emrNumber} already existed`)
        }

        let dt = new Date()
        let created_at = dt.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hourCycle: 'h24' })
        let updated_at = null
        let completed_at = null

        const emr = {
            id: emrNumber,
            patient: JSON.parse(patient),
            physician: JSON.parse(physician),
            room: JSON.parse(room),
            living_functions: JSON.parse(living_functions),
            emr_diseases: JSON.parse(emr_diseases),
            emr_services: JSON.parse(emr_services),
            emr_drugs: JSON.parse(emr_drugs),
            images: JSON.parse(images),
            created_at,
            updated_at,
            completed_at
        };

        await ctx.stub.putState(emrNumber, Buffer.from(JSON.stringify(emr)));
        console.info('============= END : Create EMR ===========');
    }

    async queryAllEMRs(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async updateEMR(ctx, emrNumber, patient, physician, room, living_functions, emr_diseases, emr_services, emr_drugs, images) {
        console.info('============= START : Update EMR ===========');

        const emrAsBytes = await ctx.stub.getState(emrNumber); // get the emr from chaincode state
        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        const emr = JSON.parse(emrAsBytes.toString());

        if (patient != null && patient.length > 0) {
            emr.patient = JSON.parse(patient)
        }
        if (physician != null && physician.length > 0) {
            emr.physician = JSON.parse(physician)
        }
        if (room != null && room.length > 0) {
            emr.room = JSON.parse(room)
        }
        if (living_functions != null && living_functions.length > 0) {
            emr.living_functions = JSON.parse(living_functions)
        }
        if (emr_diseases != null && emr_diseases.length > 0) {
            emr.emr_diseases = JSON.parse(emr_diseases)
        }
        if (emr_services != null && emr_services.length > 0) {
            emr.emr_services = JSON.parse(emr_services)
        }
        if (emr_drugs != null && emr_drugs.length > 0) {
            emr.emr_drugs = JSON.parse(emr_drugs)
        }
        if (images != null && images.length > 0) {
            emr.images = JSON.parse(images)
        }

        let dt = new Date()
        emr.updated_at= dt.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hourCycle: 'h24' })

        await ctx.stub.putState(emrNumber, Buffer.from(JSON.stringify(emr)));
        console.info('============= END : Update EMR ===========');
    }

    async completeEMR(ctx, emrNumber) {
        console.info('============= START : Complete EMR ===========');

        const emrAsBytes = await ctx.stub.getState(emrNumber); // get the emr from chaincode state
        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        const emr = JSON.parse(emrAsBytes.toString());

        let dt = new Date()
        emr.completed_at = dt.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hourCycle: 'h24' })

        await ctx.stub.putState(emrNumber, Buffer.from(JSON.stringify(emr)));
        console.info('============= END : Complete EMR ===========');
    }

    async queryOwnEMR(ctx, patientNumber) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.patient.id === patientNumber) {
                allResults.push({ Key: key, Record: record });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
}

module.exports = EMRAdmin;
