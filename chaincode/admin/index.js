/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const EMRAdmin = require('./lib/admin');
const EMRUser = require('./lib/user');

module.exports.EMRAdmin = EMRAdmin;
module.exports.EMRUser = EMRUser;
module.exports.contracts = [ EMRAdmin, EMRUser ];
