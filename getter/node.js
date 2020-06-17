const Initer = require('../libs/Initer');

const arrNameModuleNode = [
	'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'zlib',
];

module.exports = function NodeGetterIniter(configRaw, module = require.main, parseOption, A) {
	const initers = {};
	const initersPrivate = {};

	const config = JSON.parse(JSON.stringify(configRaw));

	for(const prop in config) {
		const value = config[prop];
		const target = (1 == value ? initers : (2 == value ? initersPrivate : null));

		if(target && arrNameModuleNode.includes(prop)) {
			target[prop] = new Initer(function() {
				return module.require(prop);
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