import './index.env.js';

import { dirPackage, C, G } from '@nuogz/pangu';

import { resolve } from 'path';

import Desire from '@nuogz/desire';
import readRoute from '@nuogz/desire-route';



const { folds, faces } = await readRoute(resolve(dirPackage, 'src'));


const desire = await new Desire({
	name: '服务',
	host: C.server.host,
	port: C.server.port,

	harbour: {
		mare: {
			before: ['parseRaw'],
			after: ['toSuccess'],
		},

		facePrefix: '/api',

		faces,
		folds,
	},

	logger: { logger: G }
});

desire.start();
