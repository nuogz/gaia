const T = {
	isEmpty: function(data) { return data === undefined || data === null; },
	isNegate: function(data) { return data === undefined || data === null || data === false; },
	isObject: function(data) { return typeof data == 'object' && data !== null; },
	isString: function(data) { return typeof data == 'string' || data instanceof String; },
	isStringT: function(data) { return (typeof data == 'string' || data instanceof String) && data.trim() != ''; },
};

module.exports = function PathGetterIniter(configToolRaw, parseOption, isStatEnabled) {
	const config = {};

	for(const prop in configToolRaw) {
		const value = configToolRaw[prop];

		if(T.isStringT(value)) {
			config[prop] = value;
		}
		else {
			let stat, tool, initer, callback;

			if(T.isNegate(value)) {
				continue;
			}
			else if(typeof value == 'function') {
				stat = 1;
				tool = value;
			}
			else if(typeof value == 'number') {
				if(value == 0) { continue; }

				stat = value;
			}
			else if(value instanceof Array) {
				if(value[0] == 0) { continue; }

				[stat, tool, initer, callback] = value;
			}
			else if(T.isObject(value)) {
				if(value.stat == 0) { continue; }

				({ stat, tool, initer, callback } = value);
			}

			if(!tool) {
				if(typeof initer != 'function') {
					if(prop in T) {
						tool = T[prop];
					}
					else if(initer == 'require') {
						initer = () => require.main.require(prop);
					}
					else {
						throw TypeError(`[Gaia] 类型错误: 在[option.tool.${prop}]下, 当[stat]有效且无指定[tool]时, [initer]的类型应为{function|'require'}`);
					}
				}
			}

			if(callback && typeof callback != 'function') {
				throw TypeError(`[Gaia] 类型错误: [option.tool.${prop}.callback]的类型应为{function|false|undefined|null}`);
			}

			config[prop] = { stat, tool, initer, callback };
		}
	}

	return function PathGetter(propRaw) {
		const [conf, prop] = parseOption(propRaw, config);

		if(T.isObject(conf) && isStatEnabled(conf.stat, prop, propRaw)) {
			if(!conf.tool) {
				conf.tool = conf.initer(conf, prop);

				conf.callback(conf.tool);
			}

			return conf.tool;
		}
	};
};

module.exports.T = T;