const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		ui: './ui.ts',
		background: './background.ts'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
		clean: true,
	},
	devtool: false,
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			},
			{
				test: /\.ts$/,
				use: ['ts-loader']
			}
		]
	},
	plugins: [
		new MonacoWebpackPlugin({
			languages: ['javascript'],

			// ts.worker.js is bigger than 4MB :(
			features: ['!typescript']
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'icon/*.png' },
				{ from: 'ui.html' },
				{ from: 'manifest.json' }
			]
		})
	],
};
