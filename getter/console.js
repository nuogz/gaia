const Initer = require('../libs/Initer');

module.exports = function ConsoleGetterIniter(configRaw, parseOption, A) {
	const initers = {};
	const initersPrivate = {};

	const config = JSON.parse(JSON.stringify(configRaw));

	for(const prop in config) {
		const value = config[prop];
		const target = (1 == value ? initers : (2 == value ? initersPrivate : null));

		if(target) {
			target[prop] = new Initer(function() {
				return (console || 14)[prop];
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