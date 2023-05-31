import { existsSync } from 'fs';
import { resolve } from 'path';

import Chalk from 'chalk';
import { ensureDirSync } from 'fs-extra/esm';

import { C, dirPackage, PKG } from '@nuogz/pangu';

import copy from './oper/copy.js';
import handleJSON from './oper/handle-json.js';
import concatTextLine from './oper/concat-text-line.js';



const typesPreset = ['node', 'server', 'browser', 'vue'];
const levelsTypePreset = {
	node: 1,
	server: 2,
	browser: 1,
	vue: 2,
	'vue-server': 3,
};

const opers = {
	'copy': copy,
	'handle-json': handleJSON,
	'concat-text-line': concatTextLine,
};

const console = globalThis.console;


const ensureDirs = (envs, dirCWD) => {
	const setDirsEnsure = new Set(C.base.dirsEnsure ?? []);

	envs.forEach(env => (C[env]?.dirsEnsure ?? []).forEach(dir => setDirsEnsure.add(dir)));

	setDirsEnsure.forEach(dir => {
		const pathDir = resolve(dirCWD, dir);


		if(!existsSync(pathDir)) {
			ensureDirSync(pathDir);

			console.log(Chalk.yellow('makedir'), dir, Chalk.green('✔'));
		}
	});
};


export default async function init(envs, force = false) {
	if(force) { console.warn(Chalk.yellow('IT WILL BE OVERWRITE ALL RELATED EXISTED FILES. BE CAREFUL!\n')); }


	if(envs.includes('server')) { envs.unshift('node'); }
	if(envs.includes('vue')) { envs.unshift('browser'); }
	if(envs.includes('vue') && envs.includes('server')) { envs.push('vue-server'); }
	envs = [...new Set(envs)].filter(env => typesPreset.includes(env) || env in levelsTypePreset).sort((a, b) => levelsTypePreset[a] - levelsTypePreset[b]);


	if(!envs.length) { throw 'empty envs'; }


	console.log('version: ', Chalk.green(PKG.version));
	console.log('envs: ', Chalk.green(envs.join(' ')) + '\n');


	const dirCWD = process.cwd();
	const dirPreset = resolve(dirPackage, 'preset');


	ensureDirs(envs, dirCWD);


	const files = Object.assign({}, C.base.files, ...envs.map(env => C[env]?.files ?? {}));


	Object.entries(files).forEach(([fileRaw, oper]) => {
		if(typeof oper == 'string') {
			const [type, base, ...params] = oper.split('|');

			oper = { type, base, params };
		}

		const [file, fileSource] = fileRaw.split('|');


		opers[oper.type]?.(file, fileSource, oper, envs, dirCWD, dirPreset, force);
	});


	console.log('\nRUN following commands:');
	console.log(Chalk.green(`pnpm update`));
}
