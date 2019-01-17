<template>
    <v-container fluid fill-height class="home">
        <v-layout justify-center row wrap class="mt-5">
            <v-flex xs12 sm8 md6 lg4 class="mt-5">
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-select
                        :items="getCompanyList"
                        v-model="ccNumber"
                        :key="ccNumber"
                        label="CC Number"
                        required
                        autocomplete
                    ></v-select>
                    <v-btn small color="primary" class="ml-0" :disabled="!valid" @click="submit"> submit </v-btn>
                    <v-btn small outline color="error" @click="clear">clear</v-btn>
                </v-form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
    name: 'home',
    data: () => ({
        valid: true,
        ccNumber: '',
        ccRules: [v => !!v || 'CC Number is required', v => v.length === 10 || 'CC Number should be 10 digits long']
    }),
    computed: {
        ...mapGetters({
            getCompanyList: 'getCompanyList'
        })
    },
    methods: {
        ...mapActions({
            getAllCompanies: 'getAllCompanies'
        }),
        submit() {
            if (this.$refs.form.validate()) {
                // Native form submission is not yet supported
                this.$router.push({ name: 'companyDetails', params: { ccNumber: this.ccNumber } });
            }
        },
        clear() {
            this.$refs.form.reset();
        }
    },
    created() {
        this.getAllCompanies({ showSpinner: true });
    }
};
</script>
