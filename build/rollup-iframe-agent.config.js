const uglify = require('rollup-plugin-uglify');

module.exports = {
    input: 'src/iframe-agent.js',
    output: {
        file: 'temp/iframe-agent.js',
        format: 'iife',
        name: 'iframeAgent'
    },
    plugins: [
        uglify({
            mangle: {
                reserved: ['HostWhitelist'],
            },
            ie8: true
        })
    ]
};
