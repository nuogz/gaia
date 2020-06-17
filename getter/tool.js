const Initer = require('../libs/Initer');

const mapRequire = {};

const getRequire = function(package, module) {
	const map = mapRequire[module.filename] || (mapRequire[module.filename] = {});

	return map[package] || (map[package] = () => module.require(package));
};

const parseConfigTool = function(configRaw, module, A) {
	const config = {};

	for(const prop in configRaw) {
		const value = configRaw[prop];

		let stat, tool, initer, parser, callback, async = false;

		if(A('@:st', value)) {
			if(value.startsWith(':')) {
				stat = 1;
				initer = value;
			}
			else {
				config[prop] = value;

				continue;
			}
		}

		A('foa:EF', value, {
			f: () => {
				stat = 1;
				tool = value;
			},
			a: () => {
				if(value[0] == 0) { return; }

				[stat, tool, initer, parser, callback, async] = value;
			},
			o: () => {
				if(value.stat == 0) { return; }

				({ stat, tool, initer, parser, callback, async } = value);
			},
			nt: () => {
				stat = value;
			},
		});

		if(A('@:st', initer) && initer.startsWith(':')) {
			initer = getRequire(initer.replace(':', ''), module);
		}

		// 如果没有本体tool, 启用并检查initer
		if(!tool) {
			A('~f|require', initer, {
				require: () => {
					initer = getRequire(prop, module);
				}
			}, `runcom.tool.${prop}.initer`);
		}

		A('~fEB', parser, null, `runcom.tool.${prop}.parser`);
		A('~fEB', callback, null, `runcom.tool.${prop}.callback`);

		config[prop] = { stat, tool, initer, parser, callback, async };
	}

	return config;
};

module.exports = function ToolGetterIniter(configRaw, module = require.main, parseOption, A) {
	const config = parseConfigTool(configRaw, module, A);

	const initers = {};
	const initersPrivate = {};

	for(const prop in config) {
		const conf = config[prop];
		const target = (1 == conf.stat ? initers : (2 == conf.stat ? initersPrivate : null));

		if(target) {
			target[prop] = new Initer(conf.initer, conf.parser, conf.callback, conf.async);
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