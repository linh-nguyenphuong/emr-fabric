/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const EMRAdmin = require('./lib/admin');

module.exports.EMRAdmin = EMRAdmin;
module.exports.contracts = [ EMRAdmin ];
