'use strict';
module.exports = function(app) {
  let userCtrl = require('./controllers/userController')
  let patientCtrl = require('./controllers/patientController')
  let emrsCtrl = require('./controllers/EMRsController');
  let emrsOwnCtrl = require('./controllers/EMRsOwnController');

  app.route('/api/register-user')
    .post(userCtrl.post)

  app.route('/api/register-patient')
    .post(patientCtrl.post)

  app.route('/api/physician/emrs')
    .get(emrsCtrl.get)
    .post(emrsCtrl.post)

  app.route('/api/physician/emrs/:emr_id')
    .get(emrsCtrl.detail)
    .put(emrsCtrl.update)

  app.route('/api/physician/emrs/:emr_id/complete')
    .get(emrsCtrl.complete)

  app.route('/api/patient/emrs')
    .get(emrsOwnCtrl.get)

  app.route('/api/patient/emrs/:emr_id')
    .get(emrsOwnCtrl.detail)
};