const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/xdr.js',
    name: 'rXdr',
    output: {
        file: 'dist/xdr.js',
        format: 'umd'
    },
    plugins: [
        uglify({
            // mangle: false,
            ie8: true
        })
    ]
};
