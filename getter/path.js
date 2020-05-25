module.exports = function PathGetterIniter(configRaw, parseOption, isStatEnabled) {
	const config = JSON.parse(JSON.stringify(configRaw));
	const inited = {};

	const ensure = (key, funcInit) => inited[key] || (inited[key] = funcInit());

	const ensurer = {
		Path: () => ensure('path', () => require('path')),

		P: () => ensure('P', () => ({
			// 当前工作目录
			wd: process.cwd(),
			// 程序入口目录
			md: ensurer.Path().parse(require.main.filename).dir
		})),
		R: () => ensurer.Path().resolve,
		RW: () => ensure('RW', () => function WorkDirResolver(...paths) { return ensurer.Path().resolve(ensurer.P().wd, ...paths); }),
		RM: () => ensure('RM', () => function MainDirResolver(...paths) { return ensurer.Path().resolve(ensurer.P().md, ...paths); }),
	};

	return function PathGetter(propRaw) {
		const [value, prop] = parseOption(propRaw, config);

		if(isStatEnabled(value, prop, propRaw)) {
			return ensurer[prop]();
		}
	};
};