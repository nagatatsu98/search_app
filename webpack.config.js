const path = require('path');

module.exports = {
	entry: path.join(__dirname, "src", "index.js"),

	output: {
		path: path.join(__dirname, "dist"),
		filename: 'main.js'
	},

	devServer: {
		static: "dist",
		open: true
	},

	module: {
		rules: [
			{
				test: /\.css/, 
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							url: false,
						}
					}
				]
			}
		]
	}
};