import { createApp } from 'vue';
import { MouseMenuDirective } from '@howdyjs/mouse-menu';

import './lib/day.pure.js';


import { brop } from '@nuogz/utility';
import { aegis } from '@nuogz/aegis';
import { install as installAlert, $alert } from '@nuogz/vue-alert';
import { install as installTippy } from '@nuogz/vue-tip';
import { install as installWocker } from '@nuogz/wock-client';

import { install as installModuleLoader } from './lib/load-module.js';

import App from './index.vue';



const app = createApp(App);
app.provide('app', app);


window.addEventListener('load', async () => {
	app.mixin({ data() { return { brop }; } });

	await installAlert(app);
	aegis.alert = $alert;

	app.directive('menu', MouseMenuDirective);

	await installTippy(app);

	await installWocker(app);

	await installModuleLoader(app);


	app.mount('#app');
});
