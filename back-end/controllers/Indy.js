'use strict';

const utils = require('../utils/writer');
const Indy = require('../service/IndyService');

exports.getCredentialsList = function getCredentialsList(req, res) {
    Indy.getCredentialsList()
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.newConnectionOffer = function newConnectionOffer(req, res) {
    const ccNumber = req.swagger.params['ccNumber'].value;
    Indy.newConnectionOffer(ccNumber)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.sendCredentials = function sendCredentials(req, res) {
    let { did } = req.swagger.params['body'].value;
    Indy.sendCredentials(did)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.getCredentialsBySchema = function getCredentialsBySchema(req, res) {
    let myDid = req.swagger.params['myDid'].value;
    let schemaName = req.swagger.params['schemaName'].value;
    let schemaVersion = req.swagger.params['schemaVersion'].value;
    Indy.getCredentialsBySchema(myDid, schemaName, schemaVersion)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.getConnectionDetailsByMyDid = function getConnectionDetailsByMyDid(req, res) {
    let myDid = req.swagger.params['myDid'].value;
    Indy.getConnectionDetailsByMyDid(myDid)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.sendProofRequest = function sendProofRequest(req, res) {
    let { recipientDid, ccNumber } = req.swagger.params['body'].value;
    Indy.sendProofRequest(recipientDid, ccNumber)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};
