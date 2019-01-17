import api from '../api';
import * as types from '../mutation-types';
import storeUtils from '../utils';

const state = {
    companyList: [],
    selectedCompany: {},
    onboardingInfo: {},
    connectionInfo: {},
    credentialOffersInfo: {},
    credentialOfferResponse: {}
};

const getters = {
    getCompanyList: state => state.companyList,
    getCompanyDetails: state => state.selectedCompany,
    getccDid: state => (state.onboardingInfo.meta || {}).myDid || state.selectedCompany.ccDid || '',
    getOwnerDid: state => state.selectedCompany.ownerDid || '',
    isOnboarded: state => state.selectedCompany.ccDid && state.selectedCompany.ownerDid,
    onboardingInfo: state => state.onboardingInfo,
    connectionInfo: state => state.connectionInfo,
    isConnectionAcknowledged: state => state.connectionInfo.acknowledged || false,
    credentialOffersInfo: state => state.credentialOffersInfo
};

const mutations = {
    [types.SET_COMPANY_LIST](state, data) {
        state.companyList = data;
    },
    [types.SET_COMPANY_DETAILS](state, company) {
        state.selectedCompany = company;
    },
    [types.SET_ONBOARDING_INFO](state, info) {
        state.onboardingInfo = info;
    },
    [types.SET_CONNECTION_INFO](state, info) {
        state.connectionInfo = info;
    },
    [types.SET_CREDENTIAL_OFFERS_INFO](state, info) {
        state.credentialOffersInfo = info;
    },
    [types.SET_CREDENTIAL_OFFER_RESPONSE](state, info) {
        state.credentialOfferResponse = info;
    }
};
const actions = {
    getAllCompanies({ commit }, { showSpinner }) {
        return storeUtils.loadIntoSlot(commit, types.SET_COMPANY_LIST, showSpinner, () => api.getAllCompanies());
    },
    getCompanyDetails({ commit }, { showSpinner, ccNumber }) {
        return storeUtils.loadIntoSlot(commit, types.SET_COMPANY_DETAILS, showSpinner, () =>
            api.getCompanyDetails(ccNumber)
        );
    },
    getOnboarding({ commit }, { showSpinner, ccNumber }) {
        return storeUtils.loadIntoSlot(commit, types.SET_ONBOARDING_INFO, showSpinner, () => api.onboard(ccNumber));
    },
    getConnectionStatus({ commit }, myDid) {
        return storeUtils.loadIntoSlot(commit, types.SET_CONNECTION_INFO, false, () => api.connectionStatus(myDid));
    },
    getCredentialOffers({ commit }, { showSpinner }) {
        return storeUtils.loadIntoSlot(commit, types.SET_CREDENTIAL_OFFERS_INFO, showSpinner, () => api.getOffers());
    },
    sendCredentials({ commit }, { myDid }) {
        console.log(myDid);
        return storeUtils.apiCallWrapper(commit, true, () => api.sendCredentials(myDid));
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};
