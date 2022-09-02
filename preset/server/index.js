import './index.env.js';
import { dirPackage, C, G } from '@nuogz/pangu';

import { resolve } from 'path';

import Desire from '@nuogz/desire';
import readRoute from '@nuogz/desire-route';



const { folds, faces } = await readRoute(resolve(dirPackage, 'src'));

new Desire({
	name: '服务',
	host: C.server.host,
	port: C.server.port,

	mare: {
		before: ['parseRaw'],
		after: ['toSuccess'],
	},

	facePrefix: '/api',

	faces,
	folds,

	logger: G,
}).start();
