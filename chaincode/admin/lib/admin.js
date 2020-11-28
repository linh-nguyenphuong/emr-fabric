/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class EMRAdmin extends Contract {

    // async initLedger(ctx) {
    //     console.info('============= START : Initialize Ledger ===========');
    //     const emrs = [
    //         {
    //             patient: {
    //                 id: "7067da01-43ff-4c54-a228-76b1956666e2",
    //                 first_name: "Ed",
    //                 last_name: "Helen",
    //                 gender: "Nữ",
    //                 role: "patient",
    //                 avatar: null,
    //                 DOB: "1990-01-01"
    //             },
    //             physician: {
    //                 id: "86274125-3bb4-4a2a-9bf2-809204db06b9",
    //                 first_name: "EMR",
    //                 last_name: "Physician",
    //                 gender: "Nam",
    //                 role: "physician",
    //                 avatar: "https://res.cloudinary.com/linhpnguyen/image/upload/v1603557722/emr/user_avatar/ath7tysqsrneqimhvtb0.jpg"
    //             },
    //             room: "Phòng 21",
    //             living_functions: {
    //                 heartbeat: "110",
    //                 temp: "10",
    //                 pressure: "10",
    //                 breathing: "110",
    //                 height: "160",
    //                 weight: "62",
    //                 bmi: 24.218749999999996
    //             },
    //             emr_diseases: [
    //                 {
    //                     diseaseCategory: "3bc180fe-676b-4dd8-87ea-15e2c36d62d3",
    //                     disease: "Bệnh 5"
    //                 }
    //             ],
    //             emr_services: [
    //                 {
    //                     service: "Dịch vụ 1",
    //                     price: "123"
    //                 },
    //                 {
    //                     service: "Dịch vụ 2",
    //                     price: "456"
    //                 }
    //             ],
    //             emr_drugs: [
    //                 {
    //                     total: "4",
    //                     numberOfDays: "1",
    //                     morning: "1",
    //                     afternoon: "1",
    //                     evening: "1",
    //                     night: "1",
    //                     drugInstruction: "Hướng dẫn sử dụng",
    //                     drugCategory: "e74efef3-841f-4538-acf0-573da4d3a071",
    //                     drug: "Thuốc cảm"
    //                   },
    //                   {
    //                     total: "8",
    //                     drugCategory: "e74efef3-841f-4538-acf0-573da4d3a071",
    //                     drug: "Thuốc cảm",
    //                     drugInstruction: "Hướng dẫn sử dụng",
    //                     numberOfDays: "2",
    //                     morning: "1",
    //                     afternoon: "1",
    //                     evening: "1",
    //                     night: "1"
    //                   }
    //             ],
    //             images: [],
    //             created_at: "2020-11-19T09:53:45.381721"
    //         },
    //     ];

    //     for (let i = 0; i < emrs.length; i++) {
    //         emrs[i].docType = 'emr';
    //         await ctx.stub.putState('EMR' + i, Buffer.from(JSON.stringify(emrs[i])));
    //         console.info('Added <--> ', emrs[i]);
    //     }
    //     console.info('============= END : Initialize Ledger ===========');
    // }

    async queryEMR(ctx, emrNumber) {
        console.log('queryEMRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR')
        const emrAsBytes = await ctx.stub.getState(emrNumber); // get the emr from chaincode state
        console.log(ctx)
        if (!emrAsBytes || emrAsBytes.length === 0) {
            throw new Error(`${emrNumber} does not exist`);
        }
        console.log(emrAsBytes.toString());
        return emrAsBytes.toString();
    }

    async createEMR(ctx, emrNumber, patient, physician, room, living_functions, emr_diseases, emr_services, emr_drugs, images) {
        console.info('============= START : Create EMR ===========');

        let created_at = new Date()
        const emr = {
            patient: JSON.parse(patient),
            physician: JSON.parse(physician),
            room: JSON.parse(room),
            living_functions: JSON.parse(living_functions),
            emr_diseases: JSON.parse(emr_diseases),
            emr_services: JSON.parse(emr_services),
            emr_drugs: JSON.parse(emr_drugs),
            images: JSON.parse(images),
            created_at
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
}

module.exports = EMRAdmin;
