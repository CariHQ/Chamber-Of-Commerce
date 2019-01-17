<template>
    <v-toolbar dense fixed color="#01526f">
        <router-link tag="img" src="/logo.png" height="100%"
                     :to="{name: 'home'}"/>
        <v-toolbar-title class="white--text" :to="{name: 'home'}">Chamber Of Commerce</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-btn flat dark :to="{name: 'home'}" exact><v-icon class="mr-2">search</v-icon>Search</v-btn>
            <v-btn flat dark :to="{name: 'registration'}" exact><v-icon class="mr-2">add</v-icon>Register</v-btn>
        </v-toolbar-items>
    </v-toolbar>
</template>

<script>
    export default {
        name: "TopBar"
    };
</script>
