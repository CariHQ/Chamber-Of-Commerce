<template>
    <v-container row wrap>
        <h5 class="headline mb-0 ">Registration Details</h5>
        <v-divider class="mb-3" />
        <text-with-label label="CC Number" :value="ccNumber" />
        <text-with-label label="Registered Name" :value="name" />
        <text-with-label label="Registration Date" :value="registrationDate" />
        <p class="headline mb-0 ">Address</p>
        <v-divider class="mb-3" />
        <text-with-label full-size label="Vestigingsnummer" :value="establishmentNumber" />
        <text-with-label full-size label="Street Address" :value="address" />
        <text-with-label full-size label="City / Town Location" :value="location" />
        <text-with-label full-size label="Postcode" :value="postcode" />
        <p class="headline mb-0 ">Ownership</p>
        <v-divider class="mb-3" />
        <text-with-label full-size label="Owner Name" :value="ownerName" />
        <text-with-label full-size label="Onboarded on" :value="dateOfDidOnboarding" />
        <text-with-label full-size label="CC DID" :value="ccDid" />
        <text-with-label full-size label="Owner DID" :value="ownerDid" />
        <text-with-label full-size label="Valid Ownership Proof?" :value="verified" />
        <text-with-label full-size label="Last Verified on" :value="lastVerified" />
    </v-container>
</template>

<script>
import TextWithLabel from './TextWithLabel';

export default {
    name: 'ProfileInfoContainer',
    components: { TextWithLabel },
    props: {
        info: {
            type: Object,
            required: true
        }
    },
    computed: {
        ccNumber: vm => textOrUnknown(vm.info.ccNumber),
        registrationDate: vm => dateOrUnknown(vm.info.registrationDate),
        establishmentNumber: vm => textOrUnknown(vm.info.establishmentNumber),
        address: vm => textOrUnknown(vm.info.address),
        name: vm => textOrUnknown(vm.info.name),
        ownerName: vm => textOrUnknown(vm.info.ownerName),
        ownerBsn: vm => textOrUnknown(vm.info.ownerBsn),
        location: vm => textOrUnknown(vm.info.location),
        postcode: vm => textOrUnknown(vm.info.postcode),
        ccDid: vm => textOrUnknown(vm.info.ccDid),
        ownerDid: vm => textOrUnknown(vm.info.ownerDid),
        dateOfDidOnboarding: vm => dateOrUnknown(vm.info.dateOfDidOnboarding),
        lastVerified: vm => dateOrUnknown(vm.info.lastVerification),
        verified: vm => (vm.info.verified ? 'Yes' : 'No')
    }
};
function textOrUnknown(value) {
    return value ? value : 'Unknown';
}

function dateOrUnknown(date) {
    if (!date) return '-';
    return new Date(date * 1000).toDateString();
}
</script>
