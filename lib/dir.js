import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';



export const dirFromFileURL = url => dirname(fileURLToPath(url));


export const dirPackage = resolve(dirFromFileURL(import.meta.url), '..');
