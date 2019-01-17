import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home.vue';
import CompanyDetails from '../views/CompanyDetails.vue';
import CompanyRegistration from '../views/CompanyRegistration.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/companies/:ccNumber',
            name: 'companyDetails',
            component: CompanyDetails,
            props: true
        },
        {
            path: '/registration',
            name: 'registration',
            component: CompanyRegistration
        },
        {
            path: '*',
            redirect: '/',
            name: 'default',
            component: Home
        }
    ]
});
