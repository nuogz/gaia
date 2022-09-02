import './index.env.js';

import { Commander, PKG } from '@nuogz/pangu';

import init from './src/init.js';



const CMD = new Commander.Command();

CMD.version(PKG.version);


CMD.command('init')
	.option('-f, --force', 'Force overwrite file')
	.argument('<types...>')
	.action((types, options) => init(types, options.force));


CMD.parse(process.argv);
