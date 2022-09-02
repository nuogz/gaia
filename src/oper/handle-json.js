import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import Chalk from 'chalk';

import { readJSONSync } from '../../lib/fs-extra.js';



const console = globalThis.console;

const seek = (object, textPart = '') => {
	const parts = textPart.split('.').filter(p => p);

	let now = object;
	for(const part of parts) {
		now = now[part];

		if(now == null || now == undefined) { return now; }
	}

	return now;
};

export default function handleJSON(file, fileSource = file, oper, envs, dirCWD, dirPreset, force) {
	const pathFileTarget = resolve(dirCWD, file);
	if(existsSync(pathFileTarget) && !force && !oper.isPackage) { return; }


	const env = oper.env ?? oper.params?.[0] ?? 'share';
	const handles = oper.handles ?? oper.params?.[1] ?? [];


	let base = readJSONSync(resolve(dirPreset, env, fileSource));

	handles.forEach(handle => {
		const [typeHandle, ...params] = handle.split('|');


		if(typeHandle == 'concat-array') {
			const textPart = params[0];

			const target = seek(base, textPart);

			const keyEqual = params[1];

			if(!keyEqual) {
				const setTarget = new Set(target);

				envs.forEach(env => {
					try {
						const sub = readJSONSync(resolve(dirPreset, env, fileSource));

						const targetSub = seek(sub, textPart);

						targetSub.forEach(item => setTarget.add(item));
					}
					catch(error) { void 0; }
				});

				target.splice(0, target.length);
				target.push(...setTarget);
			}
			else {
				envs.forEach(env => {
					try {
						const sub = readJSONSync(resolve(dirPreset, env, fileSource));

						const targetSub = seek(sub, textPart);

						targetSub.forEach(itemSub => {
							if(target.find(item => item[keyEqual] == itemSub[keyEqual])) { return; }

							target.push(itemSub);
						});
					}
					catch(error) { void 0; }
				});
			}
		}
		else if(typeHandle == 'concat-key-value') {
			const textPart = params[0];

			const target = seek(base, textPart);

			envs.forEach(env => {
				try {
					const sub = readJSONSync(resolve(dirPreset, env, fileSource));

					const targetSub = seek(sub, textPart);

					Object.entries(targetSub).forEach(([key, value]) => {
						if(!(key in target)) {
							target[key] = value;
						}
					});
				}
				catch(error) { void 0; }
			});
		}
	});


	if(oper.isPackage) {
		const source = readJSONSync(pathFileTarget, { throws: false }) ?? {};


		source.typesSource = base.typesSource;
		source.files = base.files;
		source.scripts = Object.assign(source.scripts ?? {}, base.scripts);
		source.dependencies = Object.assign(source.dependencies ?? {}, base.dependencies);
		source.devDependencies = Object.assign(source.devDependencies ?? {}, base.devDependencies);


		base = Object.assign(base, source);
	}


	writeFileSync(pathFileTarget, JSON.stringify(base, null, '\t') + '\n');


	console.log(Chalk.yellow('handleJSON'), file, Chalk.green('✔'));
}
