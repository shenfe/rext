const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/xhr.js',
    name: 'rXhr',
    output: {
        file: 'dist/xhr.js',
        format: 'umd'
    },
    plugins: [
        uglify({
            // mangle: false,
            ie8: true
        })
    ]
};
