const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
module.exports = {
	mode: 'development',
	entry: __dirname + '/src/Main.js',
	devServer: {
		contentBase: './src',
		port: 3000
	},
	devtool: 'inline-source-map',
	plugins: [
		new CopyWebpackPlugin([{
			from: 'src/assets',
			to: 'assets'
		}]),
		new HTMLWebpackPlugin({
			template: 'src/index.html',
			filename: 'index.html'
		})
	]
}