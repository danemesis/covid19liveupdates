const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './server/src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: 'production',
    target: 'node',
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    },
    externals: [nodeExternals()],
    output: {
        path: __dirname + '/dist',
        filename: 'server.js',
    }
};
