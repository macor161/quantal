import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import pkg from './package.json'


const jsonPlugin = json({
	preferConst: true, 
	compact: true
})


export default [
	// browser-friendly UMD build	
	{
		input: 'src/index.js',
		output: {
			name: 'eblocks',
			file: pkg.browser,
			format: 'umd'
		},
		external: ['web3'],
		plugins: [
			resolve(), 
			commonjs(),
			jsonPlugin
		]
	},
	{
		input: 'src/index.js',
		external: [],
		output: [
			{ file: pkg.module, format: 'es' },
		],
		plugins: [
			jsonPlugin
		]
	}

];
