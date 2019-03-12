import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
	// modern browser ESM module
	{
		input: 'src/index.js',
		output: {
			name: 'howLongUntilLunch',
			file: pkg.browser,
			format: 'esm'
		},
		plugins: [
			resolve(), // so Rollup can find `ms`
			commonjs() // so Rollup can convert `ms` to an ES module
		]
	},	
	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'howLongUntilLunch',
			file: pkg['browser-legacy'],
			format: 'umd'
		},
		plugins: [
			resolve(), 
			commonjs() 
		]
	},

	{
		input: 'src/index.js',
		external: [],
		output: [
			{ file: pkg.module, format: 'es' }
		]
	}
];
