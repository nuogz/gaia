import { readFileSync } from 'fs';
import { resolve } from 'path';

import { dirPackage } from './dir.js';



export const readPackage = file => {
	let PKG;

	try {
		PKG = readFileSync(file, 'utf8');
		PKG = JSON.parse(PKG);
	}
	catch(error) {
		PKG = {};
	}

	return PKG;
};



const PKG = dirPackage ? readPackage(resolve(dirPackage, 'package.json')) : {};


export default PKG;
