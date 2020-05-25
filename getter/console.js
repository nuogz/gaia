module.exports = function ConsoleGetterIniter(configRaw, parseOption, isStatEnabled) {
	const config = JSON.parse(JSON.stringify(configRaw));

	return function ConsoleGetter(propRaw) {
		const [value, prop] = parseOption(propRaw, config);

		if(isStatEnabled(value, prop, propRaw)) {
			return (console || 14)[prop];
		}
	};
};