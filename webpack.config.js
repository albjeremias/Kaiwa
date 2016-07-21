var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    resolve: {
        extensions: [
            '',
            '.styl',
            '.ts',
            '.tsx',
            '.js',
            '.jade',
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
        KAIWA_CONFIG: require('./config').client // TODO: Add KAIWA_VERSION. ~ F
    })],

    entry: {
        'js/1-vendor':
        [
            require.resolve('jquery'),
            './js/libraries/resampler.js',
            require.resolve('indexeddbshim'),
            require.resolve('sugar-date'),
            './js/libraries/jquery.oembed.js'
        ],
        'js/app': './js/app'
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
                test: require.resolve('jquery'),
                loader: "expose?$!expose?jQuery"
            },
            {
                test: /react\.js$/,
                loader: "expose?React"
            },
            {
              test: /resampler\.js$/,
              loader: 'expose?Resample!imports?this=>window!exports?Resample'
            },
            {
              test: /jquery\.oembed\.js$/,
              loader: 'imports?jQuery=jquery'
            },
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
                exclude: /(node_modules|bower_components|libraries)/,
                loader: 'babel!ts-loader'
            },
            {
                test: /\.js(x?)$/,
                exclude: /(node_modules|bower_components|libraries)/,
                loader: 'babel'
            },
            {
                test: /\.jade$/,
                loader: 'jade-loader'
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
        fs: "empty"
    },
    externals: {
        jquery: 'jQuery'
    }
};
