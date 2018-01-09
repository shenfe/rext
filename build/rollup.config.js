const uglify = require('rollup-plugin-uglify');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
    input: 'src/index.js',
    name: 'rexter',
    output: {
        file: 'dist/rext.js',
        format: 'umd'
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};
