'use strict';

const sqlite3 = require('sqlite3').verbose();
const hash = require('hash-sum');

let db = new sqlite3.Database('./back-end/companies.db');

const COL_CC_NUMBER = 'CC_NUMBER';
const COL_CC_DID = 'CC_DID';
const SQLITE_CONSTRAINT = 'SQLITE_CONSTRAINT';

// SQL Commands
const SELECT_ALL_CC_NUMBERS = 'SELECT CC_NUMBER FROM COMPANIES';
const UPDATE_DIDS = `UPDATE COMPANIES SET CC_DID = ?, 
                                          OWNER_DID = ?, 
                                          DATE_OF_DID_ONBOARDING=? WHERE CC_NUMBER=?`;
const INSERT_NEW_COMPANY = `INSERT INTO COMPANIES(
                                            CC_NUMBER,
                                            REGISTRATION_DATE,
                                            NAME,
                                            ADDRESS,
                                            LOCATION,
                                            POSTCODE,
                                            ESTABLISHMENT_NUMBER,
                                            OWNER_NAME,
                                            OWNER_BSN) VALUES (?,?,?,?,?,?,?,?,?)`;
const UPDATE_COMPANY_PROOF = `UPDATE COMPANIES SET
                                            PROOF_ID=?,
                                            VERIFIED=?,
                                            LAST_VERIFICATION=? WHERE CC_NUMBER = ?`;
const UPDATE_COMPANY_OWNER_DETAILS = `UPDATE COMPANIES SET
                                            OWNER_NAME=?,
                                            OWNER_BSN=? WHERE CC_NUMBER = ?`;
module.exports = {
    getAllccNumbers,
    updateDids,
    getCompanyByccNumber,
    getCompanyByMyDid,
    createNewCompany,
    updateProofInfo,
    updateOwnerInfo
};

/**
 * Add new Company record in DB
 *
 * @param {string} name
 * @param {string} address
 * @param {string} location
 * @param {string} postcode
 * @param {string} ownerName
 * @param {string} ownerBsn
 * @return {Promise<void>} If successful it will resolve and the record will be in DB, else something went wrong, SQLiteException?
 **/
function createNewCompany(name, address, location, postcode, ownerName, ownerBsn) {
    const registrationDate = Math.floor(Date.now() / 1000);
    const establishmentNumber = String(Math.floor(Math.random() * 9999999 + 1000000));
    const ccNumber = hash([
        registrationDate,
        name,
        address,
        location,
        postcode,
        establishmentNumber,
        ownerName,
        ownerBsn
    ]);
    return new Promise((resolve, reject) => {
        db.run(
            INSERT_NEW_COMPANY,
            [ccNumber, registrationDate, name, address, location, postcode, establishmentNumber, ownerName, ownerBsn],
            err => {
                if (err) {
                    if (err.message.indexOf(SQLITE_CONSTRAINT) > -1) {
                        reject({ message: 'Company Name already registered, try another one!' });
                    }
                    reject(err);
                }
                resolve({
                    ccNumber,
                    registrationDate,
                    name,
                    address,
                    location,
                    postcode,
                    establishmentNumber,
                    ownerName,
                    ownerBsn
                });
            }
        );
    });
}

/**
 * Get Company Details by ccNumber
 *
 * @param {string} ccNumber
 * @return {object} company details
 **/
function getCompanyByccNumber(ccNumber) {
    return getCompanyByColumnValue(COL_CC_NUMBER, ccNumber);
}

/**
 * Get Company Details by myDid (CC DID)
 *
 * @param {string} myDid
 * @return {object} company details
 **/
function getCompanyByMyDid(myDid) {
    return getCompanyByColumnValue(COL_CC_DID, myDid);
}

/**
 * Get All CC Numbers (used in the autocomplete text field of the UI home page)
 *
 * @return {object} All CC numbers in an Array
 **/
function getAllccNumbers() {
    return new Promise((resolve, reject) => {
        db.all(SELECT_ALL_CC_NUMBERS, (err, res) => {
            if (err) reject({ code: 500, message: err });
            resolve(res.map(({ CC_NUMBER }) => CC_NUMBER));
        });
    });
}

/**
 * Update DIDs
 *
 * @param {string} ccNumber
 * @param {string} myDid
 * @param {string} theirDid
 * @return {Promise<void>} query result
 **/
function updateDids(ccNumber, myDid, theirDid) {
    if (!ccNumber) throw Error('Invalid arguments');
    myDid = typeof myDid !== 'undefined' ? myDid : null;
    theirDid = typeof theirDid !== 'undefined' ? theirDid : null;
    return new Promise((resolve, reject) => {
        db.run(UPDATE_DIDS, [String(myDid), theirDid, Math.floor(Date.now() / 1000), ccNumber], (err, res) => {
            if (err) reject({ code: 500, message: err });
            resolve(res);
        });
    });
}

/**
 * Update Proof Info
 *
 * @param {string} ccNumber
 * @param {string} proofId
 * @param {string} verified
 * @return {Promise<void>} query result
 **/
function updateProofInfo(ccNumber, proofId, verified) {
    if (!ccNumber) throw Error('Invalid arguments');
    proofId = typeof proofId !== 'undefined' ? proofId : null;
    verified = typeof verified !== 'undefined' ? verified : null;
    return new Promise((resolve, reject) => {
        db.run(UPDATE_COMPANY_PROOF, [proofId, verified, Math.floor(Date.now() / 1000), ccNumber], (err, res) => {
            if (err) reject({ code: 500, message: err });
            resolve(res);
        });
    });
}

/**
 * Update Company Owner's Details
 *
 * @param {string} ccNumber
 * @param {string} name
 * @param {string} bsn
 * @return {Promise<void>} query result
 **/
function updateOwnerInfo(ccNumber, name, bsn) {
    if (!ccNumber) throw Error('Invalid arguments');
    name = typeof name !== 'undefined' ? name : null;
    bsn = typeof bsn !== 'undefined' ? bsn : null;
    return new Promise((resolve, reject) => {
        db.run(UPDATE_COMPANY_OWNER_DETAILS, [name, bsn, ccNumber], (err, res) => {
            if (err) reject({ code: 500, message: err });
            resolve(res);
        });
    });
}

/**
 * Get Company Info By a Given Column & Value Condition
 *
 * @param {string} column
 * @param {string} value
 * @return {Promise<void>} Company Details if found
 **/
function getCompanyByColumnValue(column, value) {
    if (!value) throw Error('Invalid arguments');
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM COMPANIES WHERE ${column} = ?`, [value], (err, [res]) => {
            if (err) reject({ code: 500, message: err });
            if (!res)
                reject({
                    code: 404,
                    message: `Not found company with ${column}: ${value}`
                });
            resolve(camelCaseKeys(res));
        });
    });
}

/**
 * Transform DB columns formats to camelCase: COL_NAME to colName
 *
 * @param {string} str - Column Name in DB format
 * @return {string} camelCased column name
 **/
function toCamelCase(str) {
    if (typeof str === 'undefined') return '';
    return str
        .split('_')
        .map((t, i) => {
            const camel = t.toLowerCase();
            if (i) return camel[0].toUpperCase() + camel.slice(1);
            return camel;
        })
        .join('');
}

/**
 * Transform object result from DB to camelCased keys
 *
 * @param {object} o - result object
 * @return {object} camelCased object keys
 **/
function camelCaseKeys(o) {
    if (typeof o !== 'object') return {};
    let result = {};
    Object.entries(o).forEach(([k, v]) => (result[toCamelCase(k)] = v));
    return result;
}
