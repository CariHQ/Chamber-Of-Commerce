<template>
    <v-layout>
        <v-flex xs12 sm12 md8 offset-md2 class="mt-4">
            <v-card class="elevation-10">
                <v-card-title>
                    <v-container grid-list-xs>
                        <profile-loading v-if="loading" />
                        <v-layout row wrap v-else>
                            <v-flex xs12 sm12 md4 lg4 text-xs-center align-center justify-center>
                                <v-avatar tile id="avatarContainer" class="my-4" size="200">
                                    <img id="avatarImage" src="/store.svg" />
                                </v-avatar>
                                <h3 class="headline">{{ info.name }}</h3>
                            </v-flex>
                            <v-flex xs12 sm12 md8 lg8> <profile-info-container :info="info" /> </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-title>
                <v-card-actions>
                    <v-spacer v-if="!onboarded" />
                    <v-btn flat color="accent darken-4" :loading="loading" @click="onboardingDialog = true;"
                        >{{ onboardBtnText }}
                    </v-btn>
                    <v-spacer v-if="onboarded" />
                    <v-btn flat color="accent darken-4" v-if="onboarded" :loading="loading" @click="requestProof"
                        >send proof request
                    </v-btn>
                    <v-btn flat color="accent darken-4" v-if="info.verified" :loading="loading" @click="sendCredentials"
                        >send credentials
                    </v-btn>
                </v-card-actions>
            </v-card>
            <onboarding-dialog :dialog="onboardingDialog" :ccNumber="info.ccNumber" @close="closeOnboardingDialog" />
        </v-flex>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';
import TextWithLabel from './TextWithLabel';
import ProfileInfoContainer from './ProfileInfoContainer';
import ProfileLoading from './ProfileLoading';
import OnboardingDialog from './OnboardingDialog';
import OfferCredentialsDialog from './OfferCredentialsDialog';

export default {
    name: 'ProfileCard',
    components: {
        OfferCredentialsDialog,
        OnboardingDialog,
        ProfileLoading,
        ProfileInfoContainer,
        TextWithLabel
    },
    props: {
        info: {
            type: Object,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ...mapGetters({
            onboarded: 'isOnboarded'
        }),
        onboardBtnText() {
            return this.onboarded ? 're-claim' : 'claim';
        }
    },
    data() {
        return {
            onboardingDialog: false,
            offerCredentialDialog: false
        };
    },
    methods: {
        requestProof() {
            this.$emit('requestProof');
        },
        sendCredentials() {
            this.$emit('sendCredentials');
        },
        closeOnboardingDialog() {
            this.onboardingDialog = false;
            this.$emit('refresh');
        },
        closeOfferCredentialDialog() {
            this.offerCredentialDialog = false;
            this.$emit('refresh');
        }
    }
};
</script>
