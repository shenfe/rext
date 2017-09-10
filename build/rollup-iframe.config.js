const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/iframe.js',
    name: 'rIframeAgent',
    output: {
        file: 'dist/iframe-agent.js',
        format: 'umd'
    },
    plugins: [
        // uglify({
        //     // mangle: false,
        //     ie8: true
        // })
    ]
};
