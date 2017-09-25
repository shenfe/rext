const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/index.js',
    name: 'rexter',
    output: {
        file: 'dist/rext.js',
        format: 'umd'
    },
    plugins: [
        // uglify({
        //     // mangle: false,
        //     ie8: true
        // })
    ]
};
