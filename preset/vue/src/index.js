import { createApp } from 'vue';
import './lib/moment.js';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { MouseMenuDirective } from '@howdyjs/mouse-menu';


import { brop } from '@nuogz/utility';
import { aegis } from '@nuogz/aegis';
import { install as installAlert, $alert } from '@nuogz/vue-alert';
import { install as installTippy } from '@nuogz/vue-tip';
import { install as installWocker } from '@nuogz/wock/web';

import { install as installModuleLoader } from './lib/load-module.js';

import App from './index.vue';




const app = createApp(App);
app.provide('app', app);


window.addEventListener('load', async () => {
	app.mixin({ data() { return { brop }; } });

	await installAlert(app);

	app => aegis.alert = $alert;

	app.component('Fas', FontAwesomeIcon);

	app.directive('menu', MouseMenuDirective);

	await installTippy(app);

	await installWocker(app);


	await installModuleLoader(app);


	app.mount('#app');
});
