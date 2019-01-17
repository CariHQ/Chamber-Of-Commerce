'use strict';

const log = require('../log').logger;
const FIELDS = require('../config').COMPANY_SCHEMA_FIELDS;

module.exports = {
    getCompanyValues
};

/**
 * Get Company Values
 * @param {object} companyDetails
 * @return {object} company credentials
 */
function getCompanyValues(companyDetails) {
    const {
        ccNumber,
        registrationDate,
        name,
        address,
        location,
        postcode,
        establishmentNumber,
        ownerName,
        ownerBsn,
        lastVerification
    } = companyDetails;
    const credentialOffered = Math.floor(Date.now() / 1000);
    let company = {};
    company[FIELDS[0].toLowerCase()] = credentialOffered;
    company[FIELDS[1].toLowerCase()] = ccNumber;
    company[FIELDS[2].toLowerCase()] = name;
    company[FIELDS[3].toLowerCase()] = address;
    company[FIELDS[4].toLowerCase()] = location;
    company[FIELDS[5].toLowerCase()] = postcode;
    company[FIELDS[6].toLowerCase()] = establishmentNumber;
    company[FIELDS[7].toLowerCase()] = registrationDate;
    company[FIELDS[8].toLowerCase()] = lastVerification;
    company[FIELDS[9].toLowerCase()] = ownerName;
    company[FIELDS[10].toLowerCase()] = ownerBsn;
    log.debug(`Company stringified for ccNumber: ${ccNumber} \n ${JSON.stringify(company)}`);
    return company;
}
