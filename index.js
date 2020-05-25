const initGetterNode = require('./getter/node');
const initGetterConsole = require('./getter/console');
const initGetterPath = require('./getter/path');
const initGetterTool = require('./getter/tool');

const T = initGetterTool.T;

/**
 * 简易配置的属性模块
 * @type {array}
 */
const arrEasyGetter = ['node', 'console', 'path'];

/**
 * `Gaia`默认选项
 * @type {object}
 */
const configDefault = require('./.gaiarc');

/**
 * 合并配置
 * @param {object} configBase - 基础配置，被覆盖
 * @param {object} configAssign - 合并的配置
 */
const assignConfig = function(configBase, configAssign) {
	if(T.isNegate(configAssign)) {
		return configBase;
	}
	else if(!T.isObject(configAssign)) {
		throw TypeError('[Gaia] 类型错误: 参数[configCall]的类型应为{object|undefined|false}');
	}

	for(const [type, configSubAssign] of Object.entries(configAssign)) {
		// undefined|null等于未指定, true等于启用但不改变配置, 跳过
		if(T.isEmpty(configSubAssign) || true === configSubAssign) {
			continue;
		}
		// false等于禁用
		else if(false === configSubAssign) {
			configBase[type] = false;
		}
		// Target配置为{object|function}, 直接覆盖
		else if(type == 'target') {
			if(!T.isObject(configSubAssign) && typeof configSubAssign != 'function') {
				throw TypeError(`[Gaia] 类型错误: 参数[configBase.${type}]的类型应为{object|function|null|undefined}`);
			}

			configBase[type] = configSubAssign;
		}
		// Global配置为{string}, 直接覆盖
		else if(type == 'global') {
			if(!T.isStringT(configSubAssign)) {
				throw TypeError(`[Gaia] 类型错误: 参数[configBase.${type}]的类型应为{stringT|boolean|null|undefined}`);
			}

			configBase[type] = configSubAssign;
		}
		// Tool配置不检查value, 直接枚举覆盖
		else if(type == 'tool') {
			if(!T.isObject(configSubAssign)) {
				throw TypeError(`[Gaia] 类型错误: 参数[configBase.${type}]的类型应为{object|boolean|null|undefined}`);
			}

			const configSub = configBase[type] || (configBase[type] = {});

			for(const prop in configSubAssign) {
				configSub[prop] = configSubAssign[prop];
			}
		}
		//Easy类配置检查value
		else if(arrEasyGetter.includes(type)) {
			if(!T.isObject(configSubAssign)) {
				throw TypeError(`[Gaia] 类型错误: 参数[configBase.${type}]的类型应为{object|boolean|null|undefined}`);
			}

			const configSub = configBase[type] || (configBase[type] = {});

			for(const [prop, value] of Object.entries(configSubAssign)) {
				if(T.isNegate(value) || value === 0) {
					configSub[prop] = 0;
				}
				else if(value === true || value === 1) {
					configSub[prop] = 1;
				}
				else if(value === 2) {
					configSub[prop] = 2;
				}
				else if(T.isStringT(value)) {
					configSub[prop] = value;
				}
				else {
					throw TypeError(`[Gaia] 类型错误: 参数[configBase.${type}.${prop}]的类型应为{0|1|2|boolean|stringT|null|undefined}`);
				}
			}
		}
	}

	return configBase;
};
/**
 * 组织最终配置
 * @param {object} configCall - 来自调用的配置
 * @param {boolean} [isAssignDefault = true] - 是否基于默认配置合并配置
 * @param {boolean} [isAssignRuncom = true] - 是否基于Runcom文件配置合并配置
 * @param {boolean|number} [isAssignRuncom = false] - 是否基于上级Runcom文件配置合并配置
 */
const applyConfig = function(configCall = {}, isAssignDefault = true, isAssignRuncom = true, assignRuncomUpper = false) {
	const arrConfig = [];

	if(isAssignDefault) {
		arrConfig.push(configDefault);
	}

	if(isAssignRuncom) {
		const R = require.main.require('path').resolve;

		const arrPathRequire = assignRuncomUpper ? require.main.paths.slice(0, 1 + ~~assignRuncomUpper).reverse() : require.main.paths;

		for(const path of arrPathRequire) {
			try {
				arrConfig.push(require(R(path, '..', '.gaiarc.js')));

				if(!assignRuncomUpper) {
					break;
				}
			}
			catch(error) {
				if(error.code != 'MODULE_NOT_FOUND') {
					throw new Error(`[Gaia] Runcom文件请求错误: ${error.message}`);
				}
			}
		}
	}

	if(configCall) {
		arrConfig.push(configCall);
	}

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
 * 判断状态是否可用
 * 0, 禁用; 1, 启用; 2, 仅对引用属性启用
 * @param {string} prop - 属性
 * @param {object} [config] - 配置表
 */
const isStatEnabled = function(value, prop, propRaw) {
	return value == 1 || (value == 2 && prop != propRaw);
};

/**
 * 初始化`Gaia`
 * @param {object} configCall - 来自调用的配置
 * @param {boolean} [isAssignDefault = true] - 是否基于默认配置合并配置
 * @param {boolean} [isAssignRuncom = true] - 是否基于Runcom文件配置合并配置
 * @param {boolean|number} [assignRuncomUpper = false] - 是否基于上级Runcom文件配置合并配置
 * @param {boolean} [isForce = false] - 是否强制重新初始化
 * @version 20.05.25.A
 * @module rotonith/gaia
 */
const GaiaIniter = function GaiaIniter(configCall, isAssignDefault = true, isAssignRuncom = true, assignRuncomUpper = false) {
	const config = applyConfig(configCall, isAssignDefault, isAssignRuncom, assignRuncomUpper);

	/* eslint-disable-next-line no-unused-vars */
	const getter = {
		node: config.node ? initGetterNode(config.node, parseConfig, isStatEnabled) : false,
		console: config.console ? initGetterConsole(config.console, parseConfig, isStatEnabled) : false,
		path: config.path ? initGetterPath(config.path, parseConfig, isStatEnabled) : false,
		tool: config.tool ? initGetterTool(config.tool, parseConfig, isStatEnabled) : false,
	};

	const evalGetter = `
		${config.node ? 'getter.node(prop, config) || ' : ''}
		${config.console ? 'getter.console(prop, config) || ' : ''}
		${config.path ? 'getter.path(prop, config) || ' : ''}
		${config.tool ? 'getter.tool(prop, config) || ' : ''}
	`.replace(/[\t\r\n]/g, '');

	const get = eval(`(function GetterGaia(target, prop) { return ${evalGetter}target[prop]; })`);

	const Gaia = new Proxy(config.target || {}, { get });

	if(T.isStringT(config.global)) {
		global[config.global] = Gaia;
	}

	return Gaia;
};

global.__gaia = GaiaIniter;

module.exports = GaiaIniter;