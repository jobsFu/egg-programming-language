var path = require('path');

function resolve (filename = '') {
    return path.resolve(__dirname, filename);
}

module.exports = {
    entry: {
        egg: resolve('./egg.js'),
    },
    output: {
        path: resolve(),
        filename: '[name].min.js',
        library: 'egg',
        libraryTarget: 'umd',
    }
}