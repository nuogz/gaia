// {undefined} 未指定, 继承前置配置
// {null}
// {true|1} 启用, 继承
// {false|0} 禁用
// {2} 内置启用, 无法直接访问, 仅可通过同义词访问

// {stringT} 非空的字符串
// {objectT} 非null的对象

module.exports = {
	// 配置链
	assign: {
		// {true} 合并默认配置链
		default: true,

		// 链最大长度
		max: 1,
		// 是否连续上级文件夹
		continous: true,
		// 配置链顺序
		direction: 'up',
		// 上级文件夹范围
		range: [0, Infinity],
		// 上级文件夹列表
		arrPath: require.main.paths.map(path => R(path, '..')),
	},

	runcom: {
		// {Module} 运行代码的当前模块对象, 常用于库正确地require
		module: {},
		// {stringT} 赋值到目标变量时的属性值
		prop: 'G',
		// {object|function} 被赋值的目标
		// {null|undefined} global
		target: true,

		// node|console|path属于简单模块
		// {0} 禁用
		// {1} 启用
		// {2} 私有启用
		// {stringT} 同义词跳转
		node: {
			fs: 1,
			pa: 'path',
			path: 2,
		},
		console: {
			log: 1,
			error: 1,
			warn: 1,
		},
		path: {
			P: 0,
			R: 0,
			RW: 0,
			RM: 0,
		},

		// tool属于复杂模块, 以Moment为例
		tool: {
			// 函数作为Tool
			funcDirect: function() { return 'funcDirect'; },
			// 数字作为Tool
			numberDirect: 14,

			// 跳转到moment, 如何启用根据moment的设定
			momentRedirect: 'moment',
			// 直接以默认设置启用moment
			momentDirect: ':moment',

			// Array和Object近似, 只是Array带有固定的顺序
			// stat: {0|1|2} 同简单模块
			// tool: Tool本体, 无需延迟加载或已加载的Tool可直接赋值
			// initer: {function|'require'|':`package`'} 未设置tool时执行的函数, 返回值作为Tool; 'require', 会使initer变为require(键值名prop)的函数; ':`package`', 会使initer变为require(package)的函数
			// parser: 常用于`initer: 'require'或':package'`的情况下, 二次处理Tool. 在initer后调用, 参数是initer的返回值, 返回值作为Tool
			// callback: 用于回调或配置Tool. 在initer或parser后调用, 参数是tool, 无返回值,
			// isAsync: {string:'i|p|c|initer|parser|callback'} 定义三个主要函数是否Async函数. 如果指定了,则第一次调用时会使用async/await语法异步调用
			momentObject: {
				stat: 1,
				tool: null,
				initer: 'require',
				parser: null,
				callback: Moment => Moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss'
			},
			momentArray: [1, null, 'require', null, Moment => Moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss'],
		}
	},
};