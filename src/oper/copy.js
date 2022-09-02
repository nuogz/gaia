import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

import Chalk from 'chalk';



const console = globalThis.console;

export default function copyShare(file, fileSource = file, oper, envs, dirCWD, dirPreset, force) {
	const pathFileTarget = resolve(dirCWD, file);
	if(existsSync(pathFileTarget) && !force) { return; }


	const env = oper.base ?? oper.params?.[0] ?? 'share';


	copyFileSync(
		resolve(dirPreset, env, fileSource),
		pathFileTarget,
	);


	console.log(Chalk.yellow('copy'), file, Chalk.green('✔'));
}
