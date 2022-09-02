import { resolve } from 'path';

import Poseidon from '@nuogz/poseidon';

import { dirPackage } from './dir.js';



const dirConfig = resolve(dirPackage, 'config');


const C = new Poseidon(dirConfig);



export default C;
