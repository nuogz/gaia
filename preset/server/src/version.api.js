import { PKG } from '@nuogz/pangu';



export const method = 'get';
export const handle = () => {
	try {
		return PKG?.version;
	}
	catch {
		throw Error('读取版本失败');
	}
};
