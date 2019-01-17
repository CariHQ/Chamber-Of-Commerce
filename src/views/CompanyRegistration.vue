<template>
    <v-container fluid fill-height class="registration">
        <v-layout justify-center row wrap class="mt-5">
            <v-flex xs12 sm8 md8 lg6>
                <v-card class="mt-2">
                    <v-img
                        src="/store.svg"
                        aspect-ratio="3.75"
                        max-height="180px"
                        gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
                    >
                        <v-container fill-height fluid>
                            <v-layout fill-height>
                                <v-flex xs12 align-end flexbox>
                                    <span class="display-2 font-weight-bold font-italic white--text"
                                        >Register New Company</span
                                    >
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-img>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <h5 class="headline font-weight-bold font-italic mt-0 pt-0">Company Details</h5>
                            <v-divider class="mb-3" />
                            <v-text-field
                                v-model="name"
                                :rules="requiredAndLength(nameLabel, nameMaxLength)"
                                :label="nameLabel"
                                :loading="loading"
                                :disabled="loading"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="address"
                                :rules="requiredAndLength(addressLabel, addressMaxLength)"
                                :label="addressLabel"
                                :loading="loading"
                                :disabled="loading"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="location"
                                :rules="requiredAndLength(locationLabel, locationMaxLength)"
                                :label="locationLabel"
                                :loading="loading"
                                :disabled="loading"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="postcode"
                                :rules="requiredAndLength(postcodeLabel, postcodeMaxLength)"
                                :label="postcodeLabel"
                                :loading="loading"
                                :disabled="loading"
                                required
                            ></v-text-field>
                            <!--
                                TODO: If desired add this fields to check after the proof is received if the given fields match
                            -->
                            <!-- <h5 class="headline font-weight-bold font-italic mt-2">Owner Details</h5> -->
                            <!-- <v-divider class="mb-3" /> -->
                            <!-- <v-text-field -->
                            <!-- v-model="ownerName" -->
                            <!-- :rules="requiredAndLength(ownerNameLabel, ownerNameMaxLength)" -->
                            <!-- :label="ownerNameLabel" -->
                            <!-- :hint="passportHint" -->
                            <!-- :loading="loading" -->
                            <!-- :disabled="loading" -->
                            <!-- required -->
                            <!-- &gt;</v-text-field> -->
                            <!-- <v-text-field -->
                            <!-- v-model="ownerBsn" -->
                            <!-- type="number" -->
                            <!-- :rules="requiredAndLength(ownerBsnLabel, ownerBsnMaxLength)" -->
                            <!-- :label="ownerBsnLabel" -->
                            <!-- :hint="passportHint" -->
                            <!-- :loading="loading" -->
                            <!-- :disabled="loading" -->
                            <!-- required -->
                            <!-- &gt;</v-text-field> -->
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="clear" color="error" small outline :disabled="loading">clear</v-btn>
                        <v-spacer />
                        <v-btn :disabled="!valid" @click="submit" color="primary" small :loading="loading">
                            submit
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import api from '../store/api';
import { apiCallWrapper } from '../store/utils';
import { SHOW_NOTIFICATION } from '../store/mutation-types';

export default {
    name: 'CompanyRegistration',
    data: () => ({
        valid: true,
        name: '',
        nameMaxLength: 20,
        nameLabel: 'Company Name',
        address: '',
        addressLabel: 'Street Address',
        addressMaxLength: 50,
        location: '',
        locationLabel: 'City / Town Location',
        locationMaxLength: 50,
        postcode: '',
        postcodeLabel: 'Postcode',
        postcodeMaxLength: 10,
        ownerName: '',
        ownerNameMaxLength: 20,
        ownerNameLabel: 'Owner First Name',
        ownerBsn: '',
        ownerBsnMaxLength: 10,
        ownerBsnLabel: 'Owner BSN (Social Security Number)',
        passportHint: 'Same as in Passport'
    }),
    computed: {
        ...mapGetters({ loading: 'isLoading' })
    },
    methods: {
        requiredAndLength(label, maxLength) {
            return [
                v => !!v || `${label} is required`,
                v => (v && v.length <= maxLength) || `${label} must be less than ${maxLength} characters`
            ];
        },
        submit() {
            if (this.$refs.form.validate()) {
                apiCallWrapper(this.$store.commit, true, () =>
                    api.submitNewCompany({
                        name: this.name,
                        address: this.address,
                        location: this.location,
                        postcode: this.postcode,
                        ownerName: '', // TODO: Change this values back to the form fields
                        ownerBsn: 0
                    })
                )
                    .then(({ ccNumber }) => {
                        this.$store.commit(SHOW_NOTIFICATION, {
                            type: 'success',
                            msg: `Successfully registered new company!`
                        });
                        this.$router.push({ name: 'companyDetails', params: { ccNumber } });
                    })
                    .catch(e => {
                        console.error(e);
                        this.$store.commit(SHOW_NOTIFICATION, {
                            type: 'error',
                            msg: (e.data || {}).message || `Error while registering new company!`
                        });
                    });
            }
        },
        clear() {
            this.$refs.form.reset();
        }
    }
};
</script>
