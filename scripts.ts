import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

/* eslint-disable-next-line */
const pkg = require('./package.json');

/**
 *  Updates bundle after build - disables eslint for file
 */
export const updateBundle = (): void => {
  console.log('> Updating bundle ...');

  const path = resolve(__dirname, './lib/index.js');
  const file = readFileSync(path);

  if (file) writeFileSync(path, `/* eslint-disable */${file}`);
};

/**
 *  Creates correct index.d.ts
 */
export const createTypings = (): void => {
  console.log('> Generating single index.d.ts ...');

  execSync('npx dts-bundle-generator -o index.d.ts ./lib/index.ts');
  execSync(`rm -rf ${__dirname}/lib/*.d.ts`);
  execSync(`mv ${__dirname}/index.d.ts ${__dirname}/lib`);
};

updateBundle();
createTypings();
