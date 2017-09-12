const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/jsonp.js',
    name: 'rJsonp',
    output: {
        file: 'dist/jsonp.js',
        format: 'umd'
    },
    plugins: [
        uglify({
            // mangle: false,
            ie8: true
        })
    ]
};
