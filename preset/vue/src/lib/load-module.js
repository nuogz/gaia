import { $alert } from '@nuogz/vue-alert';



/** @param {import('vue').App} app */
export async function install(app) {
	/**
	 * @param {import('vue').Ref<string>} moduleNow
	 */
	const loaderModule = moduleNow =>
		/**
		 * @param {string} slot
		 * @returns {void}
		 */
		async slot => {
			if(app.component(slot)) { return moduleNow.value = slot; }

			try {
				const parts = String(slot).split('-');

				try {
					if(parts.length == 2) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}.vue`)).default); }
					else if(parts.length == 3) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}.vue`)).default); }
					else if(parts.length == 4) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}.vue`)).default); }
					else if(parts.length == 5) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}.vue`)).default); }
					else { throw TypeError(`模块深度不为[2,3,4,5]: ${slot}`); }
				}
				catch(error) {
					if(!error.message.startsWith('Unknown variable dynamic import')) {
						$alert(`加载模块失败: ${slot}, ${error.message || error}`, '加载模块失败');

						throw error;
					}

					if(parts.length == 2) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/index.vue`)).default); }
					else if(parts.length == 3) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}/index.vue`)).default); }
					else if(parts.length == 4) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/index.vue`)).default); }
					else if(parts.length == 5) { app.component(slot, (await import(`../${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}/index.vue`)).default); }
					else { throw TypeError(`模块深度不为[2,3,4,5]: ${slot}`); }
				}

				moduleNow.value = slot;
			}
			catch(error) {
				$alert(`加载模块失败: ${slot}, ${error.message || error}`, '加载模块失败');

				throw error;
			}
		};


	app.provide('load-module', loaderModule);
}
