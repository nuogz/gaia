const mapEqualStrict = {
	U: undefined,
	N: null,

	S: '',

	t: true,
	B: false,

	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
};

const mapTypeof = {
	s: 'string',
	b: 'boolean',
	n: 'number',

	f: 'function',
};

const mapInstanceof = {
	a: Array
};

const mapThrowType = {
	U: ['undefined'],
	N: ['null'],

	S: ['\'\''],

	t: ['true'],
	B: ['false'],

	s: ['string'],
	b: ['boolean'],
	n: ['number'],

	f: ['function'],

	a: ['array'],

	o: ['non-null object'],
	st: ['non-empty string'],
	nt: ['non-zero number'],

	NN: ['nan'],

	E: ['undefined', 'null'],
	EF: ['undefined', 'null', 'false'],
	F: ['undefined', 'null', 'nan', 'false', '0', '\'\''],

	0: ['0'],
	1: ['1'],
	2: ['2'],
	3: ['3'],
	4: ['4'],
	5: ['5'],
	6: ['6'],
	7: ['7'],
	8: ['8'],
	9: ['9'],
};

/**
 * 断言类型并处理数据
 * - 规则格式: `[~@]单字母规则集:双字母规则集:N字母规则集|字面值1|字面值2|字面值N`
 * - 不同长度规则集之间使用`:`分隔
 * - 规则集、字面值与字面值之间使用`|`分隔
 * - 规则集必须在最前
 * - 包含`~`则断言失败时抛出异常
 * - 包含`@`则返回匹配的规则
 *
 * @param {string} [rule] - 数据类型规则
 * @param {*} [data] - 数据
 * @param {function} [handlePassed] - 断言成功时执行的选项
 * @param {string} [name] - 数据名称
 * @param {function} [funcFailed] - 断言失败时执行的函数
 */
const assertData = function(rule, data, handlePassed, name, funcFailed) {
	if('string' != typeof rule && !(rule instanceof String) && !(rule instanceof Array)) {
		throw TypeError('The [rule] argument must be of type {string}');
	}

	let arrInstance = [];

	if(rule instanceof Array) {
		[rule, ...arrInstance] = rule;
	}

	const [arrRuleRaw, ...arrLiteral] = rule.split('|');

	let isThrowError = false;
	let isReturnRuleMatch = false;

	const arrRule = [];
	arrRuleRaw.split(':').forEach((ruleShort, index) => {
		const max = index + 1;

		let r = '';

		for(const char of [...ruleShort, '']) {
			if(char == '~') { isThrowError = true; continue; }
			if(char == '@') { isReturnRuleMatch = true; continue; }

			r += char;

			if(r.length == max) {
				if(r in mapThrowType) {
					arrRule.push(r);
				}

				r = '';
			}
		}
	});

	arrRule.sort();

	let isMatch = false;
	let ruleMatch = null;

	// 字面值或instance
	for(let i = 0; i < arrLiteral.length; i++) {
		const ruleLiteral = arrLiteral[i];
		const instance = arrInstance[i];

		if(
			(instance && data instanceof instance) ||
			data == ruleLiteral
		) {
			isMatch = true;
			ruleMatch = ruleLiteral;

			break;
		}
	}

	// 数据类型
	if(!isMatch) {
		for(const ruleType of arrRule) {
			if(
				(ruleType in mapEqualStrict && data === mapEqualStrict[ruleType]) ||
				(ruleType in mapTypeof && typeof data == mapTypeof[ruleType]) ||
				(ruleType in mapInstanceof && data instanceof mapInstanceof[ruleType]) ||
				('o' == ruleType && 'object' == typeof data && data !== null) ||
				('st' == ruleType && 'string' == typeof data && '' != data.trim()) ||
				('nt' == ruleType && 'number' == typeof data && 0 !== data) ||
				('NN' == ruleType && isNaN(data)) ||
				('E' == ruleType && (data === undefined || data === null)) ||
				('EF' == ruleType && (data === undefined || data === null || data === false)) ||
				('F' == ruleType && !data) ||
				false
			) {
				isMatch = true;
				ruleMatch = ruleType;

				break;
			}
		}
	}

	let handleResult = data;

	if(isMatch) {
		if('function' == typeof handlePassed) {
			handleResult = handlePassed(data, ruleMatch, name);
		}
		else if('object' == typeof handlePassed && handlePassed !== null && 'function' == typeof handlePassed[ruleMatch]) {
			handleResult = handlePassed[ruleMatch](data, ruleMatch, name);
		}
	}
	else {
		if(isThrowError) {
			throw TypeError(`The [${name || ''}] argument must be of type {${arrRule.map(r => mapThrowType[r].join('|')).concat(arrLiteral.map(l => `'${l}'`)).join('|')}}`);
		}
		else if('function' == typeof funcFailed) {
			handleResult = funcFailed(data, ruleMatch, name);
		}
	}

	return isReturnRuleMatch ? ruleMatch : handleResult;
};

/**
 * 断言类型并处理数据(多个)
 * - 规则格式: `(~)单字母规则集:双字母规则集:N字母规则集|字面值1|字面值2|字面值N`
 * - 不同长度规则集之间使用`:`分隔
 * - 规则集、字面值与字面值之间使用`|`分隔
 * - 规则集必须在最前
 * - 包含`~`表示断言失败时不抛出异常
 *
 * @param {string} [rule] - 数据类型规则
 * @param {any[]} [value] - 数据
 * @param {function} [funcPassed] - 断言成功时执行的函数
 * @param {string[]} [name] - 数据名称
 * @param {function} [funcFailed] - 断言失败时执行的函数
 */
const assertDatas = function(arrRule, arrData, handlePassed, arrName, handleFailed) {
	const arrRuleMatch = [];

	for(let i = 0; i < arrRule.length; i++) {
		const ruleMatch = assertData('@' + arrRule[i], arrData[i], arrName[i]);

		if(ruleMatch) {
			arrRuleMatch.push(ruleMatch);
		}

		if(handleFailed instanceof Array && 'function' == typeof handleFailed[i]) {
			handleFailed[i](arrData[i], ruleMatch, arrName[i]);
		}
	}

	const ruleMatchAll = arrRuleMatch.join('-');

	if(arrRuleMatch.length == arrRule.length) {
		if('function' == typeof handlePassed) {
			handlePassed(arrRule, arrRuleMatch, arrData);
		}
		else if('object' == typeof handlePassed && handlePassed !== null && 'function' == typeof handlePassed[ruleMatchAll]) {
			handlePassed[ruleMatchAll](arrRule, arrRuleMatch, arrData);
		}
	}
	else if('function' == typeof handleFailed) {
		handleFailed(arrRule, arrRuleMatch, arrData);
	}

	return arrRuleMatch;
};

module.exports = { assertData, assertDatas };