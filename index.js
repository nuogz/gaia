import { Command } from 'commander/esm.mjs';

import PKG from './lib/package.js';

import init from './src/init.js';


const CMD = new Command();

CMD.version(PKG.version);


CMD.command('init')
	.option('-f, --force', 'Force overwrite file')
	.argument('<types...>')
	.action((types, options) => init(types, options.force));


CMD.parse(process.argv);
