import axios from 'axios';

const defaults = {
    baseURL: '/api',
    timeout: 20000
};

Object.assign(axios.defaults, defaults);

function checkStatus(response) {
    if (response.status >= 200 && response.status < 500) {
        if (response.data) return response.data;
    } else {
        console.error('Response Request to API with ERROR Status');
        throw new Error('Something went wrong!');
    }
}

function apiGet(url) {
    return axios.get(url).then(checkStatus);
}

function apiPost(url, payload) {
    return axios.post(url, payload).then(checkStatus);
}

export default {
    requestProof: payload => apiPost(`/requests/proofs`, payload),
    submitNewCompany: payload => apiPost(`/companies`, payload),
    getCompanyDetails: ccNumber => apiGet(`/companies/${ccNumber}`),
    getAllCompanies: () => apiGet(`/companies`),
    onboard: ccNumber => apiPost(`/connections?ccNumber=${ccNumber}`, {}),
    connectionStatus: myDid => apiGet(`/connections/${myDid}`),
    getOffers: () => apiGet(`/credentials`),
    sendCredentials: payload => apiPost(`/credentials`, payload)
};
