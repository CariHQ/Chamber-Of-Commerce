'use strict';

const utils = require('../utils/writer.js');
const Companies = require('../service/CompaniesService');

exports.getAllCompanies = function getAllCompanies(req, res) {
    Companies.getAllCompanies()
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.getCompanyDetails = function getCompanyDetails(req, res) {
    const ccNumber = req.swagger.params['ccNumber'].value;
    Companies.getCompanyDetails(ccNumber)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};

exports.registerCompany = function registerCompany(req, res, next) {
    const body = req.swagger.params['body'].value;
    const { name, address, location, postcode, ownerName, ownerBsn } = body;
    Companies.registerCompany(name, address, location, postcode, ownerName, ownerBsn)
        .then(response => utils.writeJson(res, response))
        .catch(error => utils.serverError(res, error));
};
