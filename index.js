const initGetterNode = require('./getter/node');
const initGetterConsole = require('./getter/console');
const initGetterPath = require('./getter/path');
const initGetterTool = require('./getter/tool');

const { assertData: A, assertDatas: AS } = require('./libs/AssertData');

const ensureR = initGetterPath.R;
const R = ensureR();

const Module = require.main.constructor;

/**
 * 012简易配置的属性模块
 * @type {array}
 */
const arrEasyGetter = ['node', 'console', 'path'];

/**
 * `Gaia`默认配置
 * @type {object}
 */
const configDefault = require('./.gaiarc');

/**
 * 合并配置
 * @param {object} configBase - 基础配置，被覆盖
 * @param {object} configAssign - 合并的配置
 */
const assignConfig = function(configBase, configAssign) {
	// 检查configAssign是否Object
	if('o' == A('@~oEB', configAssign, null, 'configAssign')) {
		for(const [type, configSubAssign] of Object.entries(configAssign)) {
			const nameAD = `configAssign.${type}`;

			if(A('@tEB', configSubAssign, {
				// Empty, 未指定; true, 启用但不改变配置, 跳过
				// false, 禁用
				B: () => configBase[type] = false,
			})) {
				continue;
			}

			// key配置为{string}, 直接覆盖
			if(type == 'prop') {
				configBase[type] = A('~:st', configSubAssign, null, nameAD);
			}
			// Target配置为{object|function}, 直接覆盖
			else if(type == 'target') {
				configBase[type] = A('~of', configSubAssign, null, nameAD);
			}
			// Target配置为{object|function}, 直接覆盖
			else if(type == 'module') {
				configBase[type] = A(['~|module', Module], configSubAssign, null, nameAD);
			}
			// Tool配置不检查value, 直接枚举覆盖
			else if(type == 'tool') {
				A('~o', configSubAssign, null, nameAD);

				const configSub = configBase[type] || (configBase[type] = {});

				for(const prop in configSubAssign) {
					configSub[prop] = configSubAssign[prop];
				}
			}
			//Easy类配置检查value
			else if(arrEasyGetter.includes(type)) {
				A('~o', configSubAssign, null, nameAD);

				const configSub = configBase[type] || (configBase[type] = {});

				for(const [prop, value] of Object.entries(configSubAssign)) {
					A('~EBt012:st', value, {
						E: () => configSub[prop] = 0,
						B: () => configSub[prop] = 0,
						0: () => configSub[prop] = 0,
						t: () => configSub[prop] = 1,
						1: () => configSub[prop] = 1,
						2: () => configSub[prop] = 2,
						st: () => configSub[prop] = value,
					}, `${nameAD}.${prop}`);
				}
			}
		}
	}

	return configBase;
};
/**
 * 组织最终配置
 * @param {object} [configCode = {}] - 来自代码的配置
 */
const applyConfig = function(configCode) {
	configCode = A('o', configCode, null, null, () => ({}));

	// 组织配置链
	const configAssignDefault = {
		max: 1,
		continous: true,
		direction: 'down',
		range: [0, Infinity],
		arrPath: require.main.paths.map(path => R(path, '..')),
	};

	const configAssign = A('oBE', configCode.assign, {
		o(configAssign) {
			configAssign.max = A('~nE', configAssign.max, n => ~~n, 'configAssign.max');

			configAssign.continous = A('~bE', configAssign.continous, null, 'configAssign.continous');

			configAssign.direction = A('~E|up|down', configAssign.direction, null, 'configAssign.direction');

			configAssign.range = A('~aE', configAssign.range, {
				a: (range) => {
					range[0] = A('~nE', range[0], n => ~~n, 'configAssign.range[0]');
					range[1] = A('~nE', range[1], n => ~~n, 'configAssign.range[1]');
				},
				E: () => [-Infinity, Infinity],
			}, 'configAssign.range');

			configAssign.arrPath = A('~asE', configAssign.arrPath, {
				a: (arrPath) => [...arrPath],
				s: (path) => {
					const arrPath = [R(path)];

					let pre = arrPath[0];
					let cur;
					while((cur = R(pre, '..')) != pre) { arrPath.push(pre = cur); }

					return arrPath;
				}
			}, 'configAssign.arrPath');

			return configAssign;
		},
		B: () => null,
		E: () => configAssignDefault
	});

	// 配置链
	const arrConfig = [];

	// 推入上级文件夹的配置
	if(configAssign) {
		// 推入最基础的默认配置
		A('~tBE', configAssign.default, {
			r: () => arrConfig.push(configDefault),
			E: () => arrConfig.push(configDefault),
		}, 'configAssign.default');

		const { max, arrPath, direction, range, continous } = configAssign;

		let loaded = 0;
		let arrPathRequire = [...arrPath];

		if('up' == direction) { arrPathRequire.reverse(); }
		arrPathRequire = arrPathRequire.slice(range[0], range[1]);

		for(const path of arrPathRequire) {
			try {
				arrConfig.push(require(R(path, '.gaiarc.js')));

				loaded++;
				if(loaded >= max) {
					break;
				}
			}
			catch(error) {
				if(error.code != 'MODULE_NOT_FOUND') {
					throw new Error(`Runcom File require error: ${error.message}`);
				}
				else if(!continous) {
					break;
				}
			}
		}
	}

	// 推入来自代码的配置
	A('o', configCode.runcom, runcom => arrConfig.push(runcom));

	return arrConfig.reduce((acc, cur) => assignConfig(acc, cur), {});
};

/**
 * 处理属性跳转
 * @param {string} prop - 属性
 * @param {object} [config] - 配置表
 */
const parseConfig = function(prop, config) {
	const value = config[prop];

	return typeof value == 'string' ? parseConfig(value, config) : [value, prop];
};

/**
 * 初始化`Gaia`
 * @param {object} [configCode] - 配置
 * @version 20.05.25.A
 * @module rotonith/gaia
 */
const GaiaIniter = function(configCode) {
	if(configCode instanceof Module) {
		configCode = {
			assign: { arrPath: configCode.paths.map(path => R(path, '..')), },
			runcom: { module: configCode }
		};
	}

	const config = applyConfig(configCode);

	const arrGetter = [];

	if(config.node) {
		arrGetter.push(initGetterNode(config.node, config.module, parseConfig, A));
	}
	if(config.console) {
		arrGetter.push(initGetterConsole(config.console, parseConfig, A));
	}
	if(config.path) {
		arrGetter.push(initGetterPath(config.path, parseConfig, A));
	}
	if(config.tool) {
		arrGetter.push(initGetterTool(config.tool, config.module, parseConfig, A));
	}

	const getter = arrGetter.reduce((acc, cur) => Object.assign(acc, cur), {});

	const get = function GetterGaia(target, prop) {
		return getter[prop] ? getter[prop].get() : target[prop];
	};

	const Gaia = new Proxy(config.target || {}, { get });

	AS(
		[':st', 'ofE'],
		[config.prop, config.target],
		(arrRule, [, ruleMatchTarget], [prop, target]) => {
			if('E' == ruleMatchTarget) {
				target = global;
			}

			target[prop] = Gaia;
		},
		['config.prop', 'config.target'],
		null,
	);

	return Gaia;
};

module.exports = GaiaIniter;