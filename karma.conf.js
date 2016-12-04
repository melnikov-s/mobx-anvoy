module.exports = function (config) {
    config.set({

        basePath: '',

        frameworks: ['jasmine'],

        files: [
            './specs/index.js'
        ],

        exclude: [
        ],

        preprocessors: {
            './specs/index.js' : ['webpack']
        },

        reporters: ['progress', 'coverage'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: ['PhantomJS'],

        webpack: {
            entry: __dirname + '/specs/index.js',
            devtool: 'inline-source-map',
            module: {
                loaders: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: /node_modules/,
                        query: {
                            presets: ['es2015-loose'],
                            plugins: ["transform-for-of-array", "istanbul"]
                        }
                    },
                    {
                        test: /^((?!index).)*\.js$/,
                        loader: "eslint-loader",
                        exclude: /node_modules/
                    }
                ]
            }
        },
        webpackMiddleware: {
            noInfo: true
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/'
        },
        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-webpack',
            'karma-coverage'
        ],
        singleRun: true
    });
}
