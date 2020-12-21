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
        const ccpPath = path.resolve(__dirname, '..', '..', 'emr-network', 'organizations', 'peerOrganizations', 'org1.emr.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
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

        // Submit the specified transaction.
        let patient = {
            id: "7067da01-43ff-4c54-a228-76b1956666e3",
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
        let room = {
            id: '86274125-3bb4-4a2a-9bf2-809204db06b1',
            name: 'Phong test',
            number: 999
        }
        let medical_record = {
            administrative: {
                fullname: "TRẦN VĂN C",
                dayOfBirth: "10/02/2000",
                gender: "Nam",
                job: "test",
                ethnicity: "test",
                expatriate: "test",
                address: "test",
                workplace: "test",
                object: "Khác",
                insurance_expirity: "25/12/2020",
                insurance_number: "test",
                family_member_and_address: "test",
                phone: "test",
                checkin_at: "16 giờ 59 phút ngày 20 tháng 11 năm 2020",
                previous_diagnose: "BÌnh thường",
                come_from: "Tự đến"
            },
            present_complaint: "Ho",
            ask: {
                pathological_process: "10 ngày trước bệnh nhân ho có đờm màu trắng đục, không sốt, bệnh nhân có tự mua thuốc uống nhưng không giảm. Cùng ngày đến khám bệnh nhân ho đờm nhiều kèm ớn lạnh, sốt 38.5 độ C",
                self_medical_history: "Khỏe",
                family_medical_history: "Khỏe"
            },
            examination: {
                heartbeat: "94",
                temperature: "39",
                blood_pressure: "120/70",
                breathing: "20",
                weight: "55",
                body: "Bệnh tỉnh, tiếp xúc tốt\nDa niêm hồng\nTổng trạng trung bình\nTuyến giáp không to, hạch ngoại vi không sờ chạm.",
                partials: "Tim đều\nPhổi ran nổ rải rác 2 phế trường\nBụng mềm",
                subclinical_summary: "Công thức máu:\n-Hồng cầu: 4,8.10^12/l\n-Hemoglobin: 116g/l\n-Tiểu cầu: 280.10^9/l\n-Bạch cầu: 13,56.10^9/l\n-Neutrophil: 89%\n-Lympho: 20%\nX quang ngực thẳng: Viêm phổi",
                initial_diagnose: "Viêm phổi cộng đồng mức độ nhẹ nghĩ do vi khuẩn",
                drugs: [
                    {
                        drugCategory: "55472410-6f62-4a39-8d84-e35535caf44e",
                        drug: "Augmentin",
                        drugInstruction: "8h-16h",
                        total: "2"
                    },
                    {
                        drugCategory: "e36131cd-b29a-40c5-b790-e616569b9e4f",
                        drug: "Paracetamol",
                        drugInstruction: "8h-16h",
                        total: "2"
                    },
                    {
                        drugCategory: "33343424-7353-45d4-acbe-ec4ef617f9db",
                        drug: "Bromhexin",
                        drugInstruction: "8h-16h",
                        total: "2"
                    }
                ],
                processed: null,
                diagnose: "Viêm phổi cộng đồng mức độ nhẹ nghĩ do vi khuẩn",
                from_date: "21/12/2020",
                to_date: "28/12/2020"
            },
            summary: {
                pathological_process_and_clinical_course: "Bệnh nhân nam 35 tuổi vào khám vì lý do 10 ngày trước bệnh nhân ho có đờm màu trắng đục, không sốt, bệnh nhân có tự mua thuốc uống nhưng không giảm. Cùng ngày đến khám bệnh nhân ho đờm nhiều kèm ớn lạnh, sốt 38.50C. Hiện tại bệnh nhân hết sốt, hết ớn lạnh, ho đờm giảm, ăn uống được.",
                valuable_subclinical_summary: "-Hồng cầu: 4,8.10^12/l\n-Hemoglobin: 116g/l\n-Tiểu cầu: 280.10^9/l\n-Bạch cầu: 13,56.10^9/l\n-Neutrophil: 89%\n-Lympho: 20%\nX quang ngực thẳng: Viêm phổi",
                primary_disease: "Viêm phổi cộng đồng mức độ nhẹ nghĩ do vi khuẩn",
                sub_disease: null,
                treatment_method: "Kháng sinh\nHạ sốt\nLong đờm\nDinh dưỡng",
                patient_status: "Bệnh tạm ổn",
                direction_of_treatment: null,
                services: [
                    {
                        id: "30c09062-897a-4903-8f9f-4c759716128b"
                    },
                    {
                        id: "c9f84b32-4ac8-4209-a3d5-a6618c71d03b"
                    }
                ],
                attachments: [
                    {
                        uid: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472884/emr/emr_image/r4bayzlo2yd1nydioh6e.jpg",
                        id: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472884/emr/emr_image/r4bayzlo2yd1nydioh6e.jpg",
                        url: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472884/emr/emr_image/r4bayzlo2yd1nydioh6e.jpg"
                    },
                    {
                        uid: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472905/emr/emr_image/rejmiygqomr2iciumiyo.jpg",
                        id: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472905/emr/emr_image/rejmiygqomr2iciumiyo.jpg",
                        url: "https://res.cloudinary.com/linhpnguyen/image/upload/v1608472905/emr/emr_image/rejmiygqomr2iciumiyo.jpg"
                    }
                ]
            }
        }
        await contract.submitTransaction('createEMR', '9858302d-041b-4bec-98d4-a017f2449295', JSON.stringify(patient), JSON.stringify(physician), JSON.stringify(room), JSON.stringify(medical_record), '9858302d-041b-4bec-98d4-a017f2449999');
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
