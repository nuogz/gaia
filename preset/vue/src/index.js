import './index.env.js';

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


const init = async () => {
	app.mixin({ data() { return { brop }; } });

	await installAlert(app);
	aegis.alert = $alert;

	app.directive('menu', {
		mounted: (el, binding, vnode, prevVNode) =>
			binding.value?.menuList?.length
				? MouseMenuDirective.mounted(el, binding, vnode, prevVNode)
				: void 0,
		unmounted: MouseMenuDirective.unmounted,
	});

	await installTippy(app);

	await installWocker(app);

	await installModuleLoader(app);


	app.mount('#app');
};

if(document.readyState == 'complete') { await init(); }
else { window.addEventListener('load', init); }
