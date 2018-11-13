const path = require('path')

module.exports = {
    mode: 'development',
    entry: path.join(__dirname, './src/index.jsx'),
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'build.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    devtool: 'inline',
}
