/* eslint camelcase: 0 */

const COMPANY_SCHEMA_NAME = 'company';
const COMPANY_SCHEMA_FIELDS = [
    'issuance_time@unix_time',
    'cc_number@integer',
    'legal_name@string',
    'street_address@string',
    'address_locality@string',
    'postal_code@string',
    'establishment_number@integer',
    'registration_date@unix_time',
    'last_ownership_verification@unix_time',
    'owner_name@string',
    'owner_bsn@integer'
];

const COMPANY_SCHEMA_FIELDS_SUBMIT = [
    {
        name: 'cc_number',
        type: 'integer'
    },
    {
        name: 'legal_name',
        type: 'string'
    },
    {
        name: 'street_address',
        type: 'string'
    },
    {
        name: 'address_locality',
        type: 'string'
    },
    {
        name: 'postal_code',
        type: 'string'
    },
    {
        name: 'establishment_number',
        type: 'integer'
    },
    {
        name: 'registration_date',
        type: 'unix_time'
    },
    {
        name: 'last_ownership_verification',
        type: 'unix_time'
    },
    {
        name: 'owner_name',
        type: 'string'
    },
    {
        name: 'owner_bsn',
        type: 'integer'
    }
];

const PROOF_TEMPLATE_NAME = process.env.PROOF_TEMPLATE_NAME || 'ChamberOfCommerce-IdentityProof';

const proofTemplate = `{
    "name": "${PROOF_TEMPLATE_NAME}",
    "version":"1.0",
    "requested_attributes":{
        "attr1_referent":{
            "name":"given_name@string",
            "restrictions":[
                {"cred_def_id":"{{credDefId}}"}
            ],
            "revealed":true
        },
        "attr2_referent":{
            "name":"bsn@integer",
            "restrictions":[{"cred_def_id":"{{credDefId}}"}],
            "revealed":true
            }
        },
        "requested_predicates":{
            "predicate1_referent":{
                "name":"birth_date@inverted_unix_time",
                "p_type":">=",
                "p_value":{{eightTeenYearsAgoInSeconds}},
                "restrictions":[{"cred_def_id":"{{credDefId}}"}]
            }
        },
        "non_revoked": {"from": 0, "to": {{now}}}
    }`;

/**
 * Get All Proof Template parameters
 * @return {{eightTeenYearsAgoInSeconds: number, now: number, credDefId: string}} Proof Template parameters
 */
function getProofTemplateValues() {
    return {
        eightTeenYearsAgoInSeconds: -1 * Math.floor((Date.now() - 18 * 365 * 24 * 60 * 60 * 1000) / 1000),
        now: Math.floor(Date.now() / 1000),
        credDefId: `${process.env.CC_TRUSTED_CRED_DEF_ID}`
    };
}

module.exports = {
    COMPANY_SCHEMA_NAME,
    COMPANY_SCHEMA_FIELDS,
    COMPANY_SCHEMA_FIELDS_SUBMIT,
    PROOF_TEMPLATE_NAME,
    proofTemplate,
    getProofTemplateValues
};
