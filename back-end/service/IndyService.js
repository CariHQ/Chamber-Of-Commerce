'use strict';

const log = require('../log').logger;
const DB = require('./DatabaseService');
const utils = require('../utils/utils');
const {
    COMPANY_SCHEMA_NAME,
    COMPANY_SCHEMA_FIELDS,
    COMPANY_SCHEMA_FIELDS_SUBMIT,
    PROOF_TEMPLATE_NAME,
    proofTemplate,
    getProofTemplateValues
} = require('../config');

const schemaVersion = '1.0';

const ccBaseUrl = `http://${process.env.CC_HOST}:${process.env.CC_PORT}`;
const ccApiUrl = `${ccBaseUrl}/api`;

const axios = require('axios').create({
    baseURL: `http://${process.env.API_HOST || 'api'}:${process.env.API_PORT || '8000'}/api`,
    timeout: process.env.REQUESTS_TIMEOUT || 60000
});

let token = '';
let credDefId = '';
let proofTemplateId = '';

/**
 * Get all credentials offers available in Indy API for companies
 *
 * @return {Promise<object>} If resolved successfully will contain all the Credentials schemas available to offer
 **/
exports.getCredentialsList = async function() {
    try {
        await getToken();
        let response = await axios.get('/schema?onlyActive=true');
        return response.data;
    } catch (e) {
        log.error(e);
        throw new Error(e);
    }
};

/**
 * Get all proof status by CC Number & Proof ID
 *
 * @param {string} ccNumber - Chamber of Commerce Unique number of registry
 * @param {string} proofId - Proof Identifier, as returned by the API when proof was requested
 * @return {Promise<object>} If resolved successfully will contain proof details
 **/
exports.getProofStatus = async function getProofStatus(ccNumber, proofId) {
    try {
        await getToken();
        let response = await axios.get(`/proof/${proofId}`);
        if (response && response.data && response.data.proof) {
            log.info('Proof received');
            const proofMessage = response.data.proof;
            log.info(proofMessage);
            await DB.updateProofInfo(ccNumber, proofId, response.data.isValid);
            // TODO: This parsing logic of the proof revealed attributes should be moved to the Agent API
            if (
                response.data.isValid &&
                proofMessage['requested_proof'] &&
                proofMessage['requested_proof']['revealed_attrs']
            ) {
                try {
                    const ownerName = proofMessage['requested_proof']['revealed_attrs']['attr1_referent'].raw;
                    const ownerBsn = proofMessage['requested_proof']['revealed_attrs']['attr2_referent'].raw;
                    await DB.updateOwnerInfo(ccNumber, ownerName, ownerBsn);
                } catch (e) {
                    log.error(`Something failed when parsing revealed attributes in proof with id ${proofId}`);
                    log.error(e);
                }
            }
        }
        log.info(response.data);
        return response.data;
    } catch (e) {
        log.error(e);
        return e.response;
    }
};

/**
 * Expose endpoint to allow Node API to retrieve citizen credentials
 *
 * @param {string} myDid - DID to communicate with the citizen
 * @return {Promise<object>} credentials - Credentials mapped to the schema keys
 **/
exports.getConnectionDetailsByMyDid = async function getConnectionDetailsByMyDid(myDid) {
    try {
        const { ccNumber } = await DB.getCompanyByMyDid(myDid);
        await getToken();
        let response = await axios.get(`/connection/${myDid}`);
        log.info(response);
        if (response && response.data && response.data.acknowledged) {
            await DB.updateDids(ccNumber, myDid, response.data.theirDid);
        }
        return response.data;
    } catch (e) {
        if (e && e.response && e.response.status === 404) {
            return Object.assign({}, e.response.data, { myDid, acknowledged: false });
        } else {
            log.error(e);
            return e.response;
        }
    }
};

/**
 * Generate Connection Offer for the given user/company
 *
 * @param {string} ccNumber - Chamber of Commerce Unique number of registry
 * @return {Promise<object>} QRCodePayload
 **/
exports.newConnectionOffer = async function(ccNumber) {
    try {
        await getToken();
        let response = await axios.post('/connectionoffer', {
            data: {
                name: `${process.env.CC_NAME || 'Chamber Of Commerce'}`,
                description: `${process.env.CC_DESCRIPTION || 'Chamber Of Commerce'}`,
                logoUrl: `${process.env.CC_LOGO_URL}`
            }
        });
        if (response && response.data && response.data.meta) {
            await DB.updateDids(ccNumber, response.data.meta.myDid, null);
        }
        return response.data;
    } catch (e) {
        log.error(e);
        throw new Error(e);
    }
};

/**
 * Send credential to specific user by my DID reference
 *
 * @param {string} myDid - DID to communicate with the user
 * @return {Promise<object>} credential offer- Credential offer response payload as returned by the Node API
 **/
exports.sendCredentials = async function(myDid) {
    try {
        await getToken();
        const { ownerDid } = await DB.getCompanyByMyDid(myDid);
        const requestPayload = {
            recipientDid: ownerDid,
            credDefId,
            credentialLocation:
                ccApiUrl +
                `/credentials/${encodeURIComponent(COMPANY_SCHEMA_NAME)}/${encodeURIComponent(
                    schemaVersion
                )}/${encodeURIComponent(myDid)}`
        };
        log.info(requestPayload);
        let response = await axios.post('/credentialoffer', requestPayload);
        return response.data;
    } catch (e) {
        log.error(e);
        throw e;
    }
};

/**
 * Expose endpoint to allow Node API to retrieve citizen credentials
 *
 * @param {string} myDid - DID used to have a shared reference between Government & Node API
 * @param {string} schemaName - Schema Name
 * @param {string} schemaVersion - Schema Name
 * @return {Promise<object>} credentials - Credentials mapped to the schema keys
 **/
exports.getCredentialsBySchema = async function getCredentialsBySchema(myDid, schemaName, schemaVersion) {
    const companyDetails = await DB.getCompanyByMyDid(myDid);
    switch (schemaName) {
        case 'company':
            return utils.getCompanyValues(companyDetails, schemaVersion);
        default:
            throw new Error('Unknown schema');
    }
};

/**
 * Send Proof Request to User who wants to claim ownership of the company
 *
 * @param {string} recipientDid - DID used to have a shared reference between Government & Node API
 * @param {string} ccNumber - CC Number of the company to be claimed
 * @return {Promise<object>} Proof Request - Proof Request Details
 **/
exports.sendProofRequest = async function sendProofRequest(recipientDid, ccNumber) {
    try {
        await getToken();
        const requestPayload = {
            recipientDid,
            proofRequest: proofTemplateId,
            templateValues: getProofTemplateValues()
        };
        log.info(requestPayload);
        let response = await axios.post('/proofrequest', requestPayload);
        log.info(response.data);
        await DB.updateProofInfo(ccNumber, response.data.meta.proofId, false);
        return response.data;
    } catch (e) {
        log.error(e);
        throw e;
    }
};

/**
 * Initialize Agent
 *
 */
exports.init = async function init() {
    await createUser();
    try {
        await createSchemaAndCredentialDefinition();
    } catch (e) {
        log.info("Error while creating schema, probably related to a Shutdown of the API without reboot of the ledger.");
        log.info("Please use the Admin UI portal to create schemas for the Chamber Of Commerce");
        log.error(e);
    }

    await createProofTemplate();
};

/**
 * Login to Node API and get Bearer Token
 *
 */
async function getToken() {
    try {
        // TODO: Verify if stored token is still valid, instead of login each time
        let response = await axios.post('/login', {
            username: process.env.CC_USER,
            password: process.env.CC_PASSWORD
        });
        token = response.data.token;
        axios.defaults.headers.common['Authorization'] = token;
    } catch (e) {
        log.error('Could not log in with user credentials');
        throw new Error('Could not log in with user credentials');
    }
}

/**
 * Create User & Wallet
 */
async function createUser() {
    try {
        await axios.post('/user', {
            username: process.env.CC_USER,
            password: process.env.CC_PASSWORD,
            wallet: {
                name: process.env.CC_WALLET,
                seed: process.env.CC_SEED,
                credentials: {
                    key: process.env.CC_WALLET_KEY
                }
            }
        });
        log.info('Successfully created User with seed ' + process.env.CC_SEED);
    } catch (e) {
        if (
            e &&
            e.response &&
            e.response.data &&
            e.response.data.message &&
            e.response.data.message.indexOf('username already taken') > -1
        ) {
            log.info('Username already created');
        } else {
            throw e;
        }
    }
}

/**
 * Create Schema And CredentialDefinition
 */
async function createSchemaAndCredentialDefinition() {
    await getToken();
    const userCompanySchemas = (await axios.get('/schema?onlyActive=true')).data.filter(s => {
        s.attributes.forEach(a => {
            if (COMPANY_SCHEMA_FIELDS.indexOf(a) === -1) return false;
        });
        return true;
    });
    if (userCompanySchemas.length === 0) {
        // Create 2 schemas: with and without revocations
        credDefId = (await axios.post('/schema', {
            name: COMPANY_SCHEMA_NAME,
            version: schemaVersion,
            createCredentialDefinition: true,
            isRevocable: false,
            attributes: COMPANY_SCHEMA_FIELDS_SUBMIT
        })).data.credentialDefinitionId;
    } else {
        credDefId = userCompanySchemas[0].credentialDefinitionId;
    }
    if (!credDefId) throw new Error('Something went wrong while creating Credential Definition');
    log.info(`Using credential definition with ID: ${credDefId}`);
}

/**
 * Create a Proof Template used to request Identity proofs to users
 * @return {Promise<void>} if resolves a Proof Request is created through the API
 */
async function createProofTemplate() {
    await getToken();
    const userIdentityProofTemplate = (await axios.get('/proofrequesttemplate')).data.filter(
        t => t.template.indexOf(PROOF_TEMPLATE_NAME) > -1
    );
    if (userIdentityProofTemplate.length > 0) {
        proofTemplateId = userIdentityProofTemplate[0].id;
    } else {
        const res = await axios.post('/proofrequesttemplate', {
            template: proofTemplate
        });
        if (res && res.data && res.data.id) {
            proofTemplateId = res.data.id;
        }
    }
    if (!proofTemplateId) throw new Error('Something went wrong while creating Proof Request Template');
    log.info(`Using proof template with ID: ${proofTemplateId}`);
    return proofTemplateId;
}
