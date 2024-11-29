const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

module.exports = {
	mode: 'production',
	entry: './ui.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'ui.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [
		new MonacoWebpackPlugin({ languages: ['javascript', 'typescript'] })
	],
};
