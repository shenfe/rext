const fs = require('fs');
const path = require('path');
const uglify = require('rollup-plugin-uglify');
const uglifyjs = require('uglify-js');

fs.writeFileSync(path.resolve(process.cwd(), './dist/iframe.html'),
    fs.readFileSync(path.resolve(process.cwd(), './src/iframe.html'), 'utf8').replace(
        '/* iframe-inner.js */',
        uglifyjs.minify(fs.readFileSync(path.resolve(process.cwd(), './src/iframe-inner.js'), 'utf8'), {
            mangle: {
                reserved: ['HostWhitelist'],
                ie8: true
            }
        }).code
    )
);

module.exports = {
    input: 'src/index.js',
    name: 'rext',
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
