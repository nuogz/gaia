import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import Chalk from 'chalk';




export default function concatTextLine(file, fileSource = file, oper, envs, dirCWD, dirPreset, force) {
	const pathFileTarget = resolve(dirCWD, file);
	if(existsSync(pathFileTarget) && !force) { return; }



	const linesBase = [];

	envs.forEach((env, index) => {
		try {
			const linesSub = readFileSync(resolve(dirPreset, env, fileSource), 'utf8').trim().split('\n')
				.map(line => line.trim()).filter(line => line);


			linesSub.forEach(line => {
				if(linesBase.find(lineBase => lineBase == line)) { return; }

				linesBase.push(line);
			});

			linesBase.push('');
		}
		catch(error) { void 0; }
	});


	writeFileSync(pathFileTarget, linesBase.join('\n'));

	globalThis.console.log(Chalk.yellow('concat-text-line'), file, Chalk.green('✔'));
}
