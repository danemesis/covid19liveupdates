const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin([
            { from: './locales', to: 'locales' },
        ]),
        new CopyPlugin([
            { from: 'logs', to: 'logs' },
        ]),
    ],
    output: {
        path: __dirname + '/dist',
        filename: 'server.js',
    },
};
