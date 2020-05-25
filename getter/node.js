const arrNameModuleNode = [
	'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'zlib',
];

module.exports = function NodeGetterIniter(configRaw, parseOption, isStatEnabled) {
	const config = JSON.parse(JSON.stringify(configRaw));
	const moduleInited = {};

	return function NodeGetter(propRaw) {
		const [value, prop] = parseOption(propRaw, config);

		if(isStatEnabled(value, prop, propRaw) && arrNameModuleNode.includes(prop)) {
			return prop in moduleInited ? moduleInited[prop] : (moduleInited[prop] = require(prop));
		}
	};
};