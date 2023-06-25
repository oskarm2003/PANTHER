const path = require('path');
module.exports = {
    entry: {
        main: './src/game/main.ts'
    },
    output: {
        path: path.resolve(__dirname, './dist/script'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    watch: true
};