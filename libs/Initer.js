const getAsync = async function() {
	this.isLoading = true;

	this.result = await this.initer();

	this.isLoading = false;

	if('function' == typeof this.parser) {
		this.result = await this.parser(this.result);
	}

	this.isInit = true;

	if('function' == typeof this.callback) {
		await this.callback(this.result);
	}

	return this.result;
};
/**
 * 动态加载的延迟器
 */
module.exports = function Initer(initer, parser, callback, isAsync = false) {
	if('function' != typeof initer) {
		throw TypeError('The [Initer.initer] argument must be of type {function}');
	}

	this.result = null;

	this.initer = initer;
	this.parser = parser;
	this.callback = callback;

	this.isAsync = isAsync;

	this.isLoading = false;
	this.isInit = false;

	this.get = this.isAsync ?
		function() {
			if(!this.isInit && !this.isLoading) {
				return getAsync.call(this);
			}

			return this.result;
		} :
		function() {
			if(!this.isInit) {
				this.result = this.initer();

				if('function' == typeof this.parser) {
					this.result = this.parser(this.result);
				}

				this.isInit = true;

				if('function' == typeof this.callback) {
					this.callback(this.result);
				}
			}

			return this.result;
		};
};