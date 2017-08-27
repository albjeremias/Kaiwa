var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var WebpackFailPlugin = require('webpack-fail-plugin');

module.exports = {
    resolve: {
        extensions: [
            '',
            '.styl',
            '.ts',
            '.tsx',
            '.js',
            '.html',
            '.less',
            '.css',
            '.json'
        ]
    },

    context: path.join(__dirname, 'src'),

    plugins: [new HtmlWebpackPlugin({
        template: './html/layout.html',
        inject: false
    }), new webpack.DefinePlugin({
        KAIWA_CONFIG: JSON.stringify(require('./config').client) // TODO: Add KAIWA_VERSION. ~ F
    }),
    WebpackFailPlugin],

    entry: {
        'js/app': './ts/app'
    },

    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js',
        chunkFilename: '[name].js'
    },

    stats: {
        colors: true,
        reasons: true
    },

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html-loader?attrs=img:src link:href'
            },
            {
                test: /\.png$/,
                loader: "file?name=images/[hash].[ext]"
            },
            {
                test: /\.styl$/,
                loader: 'file?name=/css/[hash].css!stylus'
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'ts-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },

    node: {
        Buffer: true,
        console: true,
        global: true,
        fs: 'empty'
    }
};
