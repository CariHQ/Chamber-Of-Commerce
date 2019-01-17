'use strict';

const DB = require('./DatabaseService');
const IndyService = require('./IndyService');
const log = require('../log').logger;

/**
 * Get all CC Numbers
 *
 * @return {promise<object>} List Of All Chamber Of Commerce Numbers
 **/
exports.getAllCompanies = DB.getAllccNumbers;

/**
 * Get Company details
 *
 * @param {number} ccNumber Chamber Of Commerce Unique company/registry number
 * @return {Promise} Resolves in CompanyDetails or throws SQLException or Error
 **/
exports.getCompanyDetails = function getCompanyDetails(ccNumber) {
    return DB.getCompanyByccNumber(ccNumber).then(async res => {
        log.info(res);
        const { proofId } = res;
        if (proofId) {
            log.info('Found Proof Id, checking');
            // If there is a Proof Id linked, check if it was received
            await IndyService.getProofStatus(ccNumber, proofId);
            return await DB.getCompanyByccNumber(ccNumber);
        }
        return res;
    });
};

/**
 * Register New Company
 *
 * @param {object} body - New Company Fields
 * @return {promise<object>} CompanyDetails
 **/
exports.registerCompany = DB.createNewCompany;
