const Initer = require('../libs/Initer');

const inited = {};
const ensure = (key, funcInit) => inited[key] || (inited[key] = funcInit());

const ensurer = {
	Path: () => ensure('path', () => require.main.require('path')),

	P: () => ensure('P', () => ({
		// 当前工作目录
		wd: process.cwd(),
		// 程序入口目录
		ed: ensurer.Path().parse(require.main.filename).dir
	})),
	R: () => ensure('R', () => ensurer.Path().resolve),
	RW: () => ensure('RW', () => function WorkDirResolver(...paths) { return ensurer.Path().resolve(ensurer.P().wd, ...paths); }),
	RE: () => ensure('RE', () => function EntryDirResolver(...paths) { return ensurer.Path().resolve(ensurer.P().ed, ...paths); }),
};

module.exports = function PathGetterIniter(configRaw, parseOption, A) {
	const initers = {};
	const initersPrivate = {};

	const config = JSON.parse(JSON.stringify(configRaw));

	for(const prop in config) {
		const value = config[prop];
		const target = (1 == value ? initers : (2 == value ? initersPrivate : null));

		if(target) {
			target[prop] = new Initer(function() {
				return ensurer[prop]();
			});
		}
	}

	for(const prop in config) {
		A(':st', config[prop], () => {
			const [, propFinal] = parseOption(prop, config);

			initers[prop] = initers[propFinal] || initersPrivate[propFinal];
		});
	}

	return initers;
};

module.exports.P = ensurer.P;
module.exports.R = ensurer.R;
module.exports.RW = ensurer.RW;
module.exports.RE = ensurer.RE;