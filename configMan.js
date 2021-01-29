const FS = require('fs');
const PA = require('path');

/**
 * #### 配置系统
 * @version 2.1.0-2021.01.29.01
 * @class
 */
class ConfigMan {
	/**
	 * - 构造`ConfigMan`
	 * @param {string} pathFold 配置所在文件夹的路径
	 * @param {string|Array<string>} [types=''] 配置类型，`config.test.json`中的`test`，留空为`config.json`
	 */
	constructor(pathFold, types = '') {
		this.pathFold = pathFold;

		this.configsRaw = {};
		this.configs = {};

		this.datas = new Proxy({ __man__: this }, {
			get: (self, key) => {
				if(key in this.configs._) {
					return this.configs._[key];
				}
				else if(key in this.configs) {
					return this.configs[key];
				}

				return self[key];
			},
			set: (self, key, value) => {
				this.configs._[key] = value;
			}
		});

		if(typeof types == 'string') {
			const types_ = types.trim();

			if(types_ === '') {
				this.init();
			}
			else if(types_) {
				types_.split(',').forEach(type => this.init(type));
				types_.split(',').forEach(type => this.init(type));
			}
		}
		else if(types instanceof Array) {
			types.forEach(type => this.init(type));
		}
	}

	recurParsePath(object) {
		const pathFold = this.pathFold;

		Object.entries(object).forEach(([key, value]) => {
			if(key.startsWith('_')) {
				const keyParsed = key.replace(/^_/, '');

				if(typeof value == 'string') {
					object[keyParsed] = PA.resolve(pathFold, value);
				}
				// key带有下划线前缀的对象，默认所有子值（包括递归的）都是路径，且子值的key不需要下划线前缀
				else if(value && typeof value == 'object') {
					object[keyParsed] = this.recurParsePathObject(value, {});
				}
			}
			else if(value && typeof value == 'object') {
				this.recurParsePath(value);
			}
		});
	}
	recurParsePathObject(object) {
		const objectParsed = {};

		Object.entries(object).forEach(([key, value]) => {
			if(typeof value == 'string') {
				objectParsed[key] = PA.resolve(this.pathFold, value);
			}
			else if(value && typeof value == 'object') {
				objectParsed[key] = this.recurParsePathObject(value);
			}
			else {
				objectParsed[key] = value;
			}
		});

		return objectParsed;
	}

	/** 从`配置文件`中读取配置
	 * @param {string} type 配置类型，`config.test.json`中的`test`
	 * @param {boolean} [isParse = true] 是否解析配置文本为JSON。默认为`true`，返回数据；为`false`则直接返回Buffer
	 * @returns {any|Buffer} 配置的数据或Buffer
	 */
	read(type, isParse = true) {
		const typeParsed = typeof type == 'string' ? type.trim() : (type === undefined || type === null ? '' : String(type));
		const typeFile = typeParsed ? `.${typeParsed}` : '';

		const textConfig = FS.readFileSync(PA.resolve(this.pathFold, `config${typeFile}.json`));

		return isParse ? JSON.parse(textConfig) : textConfig;
	}
	/** 保存配置到`配置文件`
	 * @param {string} type 配置类型，`config.test.json`中的`test`
	 * @param {any} config 需要保存的配置
	 * @param {boolean} [isBackup=false] 是否备份配置
	 * @param {string} [pathBackup=this.pathFold] 备份配置存放的位置
	 */
	save(type, config, isBackup = false, pathBackup = this.pathFold) {
		const typeParsed = typeof type == 'string' ? type.trim() : (type === undefined || type === null ? '' : String(type));
		const typeFile = typeParsed ? `.${typeParsed}` : '';

		if(isBackup) {
			const textConfigBackup = this.read(type, false);

			const regexNameBackup = new RegExp(`^config${typeFile.replace('.', '\\.')}\\.(\\d)\\.backup\\.json$`);
			const idsFile = FS.readdirSync(pathBackup)
				.map(name => (name.match(regexNameBackup) || [])[1]).filter(n => n);

			FS.writeFileSync(PA.resolve(pathBackup, `config${typeFile}.${Math.max(0, ...idsFile) + 1}.backup.json`), textConfigBackup);
		}

		FS.writeFileSync(PA.resolve(this.pathFold, `config${typeFile}.json`), JSON.stringify(config, null, '\t'));
	}

	/** 从`配置文件`中加载配置到`ConfigMan`
	 * @param {string} type 配置类型，`config.test.json`中的`test`
	 * @returns {any} 配置数据
	 */
	init(type) {
		const typeParsed = typeof type == 'string' ? type.trim() : (type === undefined || type === null ? '' : String(type));

		const textConfig = this.read(typeParsed, false);

		this.configsRaw[typeParsed && typeParsed != '_' ? typeParsed : '_'] = JSON.parse(textConfig);
		const C = this.configs[typeParsed && typeParsed != '_' ? typeParsed : '_'] = JSON.parse(textConfig);

		this.recurParsePath(C);

		return C;
	}
}

module.exports = ConfigMan;