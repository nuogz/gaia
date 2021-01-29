/**
 * #### 根据`path`寻找数据
 * @param {any} object 需要的寻找数据
 * @param {string} path 路径，用`.`分割
 * @version 1.0.0-2021.01.28.01
 * @returns {{ value: any, parent: any, key: string } | undefined} 成功时，`{ value: 数据, parent: 数据所在对象, key: 数据的键值 }`；失败时，`undefined`
 */
const getSafe = function(value, path = '') {
	let key;
	let parent;

	try {
		path.split('.').forEach(keyPath => {
			const nowTemp = value[keyPath];

			parent = value;
			value = nowTemp;
			key = keyPath;
		});
	}
	catch(error) {
		return undefined;
	}

	return { value, parent, key };
};

module.exports = getSafe;