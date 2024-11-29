const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
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
		chunkFormat: false,
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
		new MonacoWebpackPlugin({ languages: ['javascript', 'typescript'] })
	],
};
