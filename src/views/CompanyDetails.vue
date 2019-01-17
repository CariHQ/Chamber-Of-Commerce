<template>
    <v-container fluid fill-height class="details">
        <v-layout justify-center row wrap class="mt-2">
            <profile-card
                :info="companyDetails"
                @requestProof="requestProof"
                @sendCredentials="sendCredentials"
                @refresh="getCompanyInfo"
            />
        </v-layout>
    </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import api from '../store/api';
import { apiCallWrapper } from '../store/utils';
import { SHOW_NOTIFICATION } from '../store/mutation-types';
import ProfileCard from '../components/ProfileCard';

export default {
    name: 'CompanyDetails',
    components: { ProfileCard },
    props: ['ccNumber'],
    data: () => ({
        interval: 0
    }),
    computed: {
        ...mapGetters({ companyDetails: 'getCompanyDetails', isLoading: 'isLoading' })
    },
    methods: {
        ...mapActions({
            getCompanyDetails: 'getCompanyDetails'
        }),
        getCompanyInfo(spinner) {
            this.getCompanyDetails({ showSpinner: spinner, ccNumber: this.ccNumber }).catch(() => {
                this.$router.push({ name: 'home' });
            });
        },
        requestProof() {
            apiCallWrapper(this.$store.commit, true, () =>
                api.requestProof({
                    recipientDid: this.companyDetails.ownerDid,
                    ccNumber: this.ccNumber
                })
            )
                .then(() => {
                    this.$store.commit(SHOW_NOTIFICATION, {
                        type: 'success',
                        msg: `Successfully requested proof!`
                    });
                    this.$router.push({ name: 'companyDetails', params: { ccNumber: this.ccNumber } });
                })
                .catch(e => {
                    console.error(e);
                    this.$store.commit(SHOW_NOTIFICATION, {
                        type: 'error',
                        msg: (e.data || {}).message || `Error while requesting proof!`
                    });
                });
        },
        sendCredentials() {
            apiCallWrapper(this.$store.commit, true, () =>
                api.sendCredentials({
                    did: this.companyDetails.ccDid
                })
            )
                .then(() => {
                    this.$store.commit(SHOW_NOTIFICATION, {
                        type: 'success',
                        msg: `Credentials sent successfully!`
                    });
                    this.$router.push({ name: 'companyDetails', params: { ccNumber: this.ccNumber } });
                })
                .catch(e => {
                    console.error(e);
                    this.$store.commit(SHOW_NOTIFICATION, {
                        type: 'error',
                        msg: (e.data || {}).message || `Error while sending credentials!`
                    });
                });
        }
    },
    created() {
        if (!this.ccNumber) {
            this.$store.commit(SHOW_NOTIFICATION, {
                type: 'error',
                msg: `Error while searching for CC Number!`
            });
            this.$router.push({ name: 'home' });
        }
        this.getCompanyInfo(true);
        this.interval = setInterval(() => this.getCompanyInfo(false), 10000);
    },
    beforeDestroy() {
        clearInterval(this.interval);
    }
};
</script>
