const fs = require('fs');
const path = require('path');
const uglify = require('rollup-plugin-uglify');
const uglifyjs = require('uglify-js');

fs.writeFileSync(path.resolve(process.cwd(), './dist/xajax.html'),
    fs.readFileSync(path.resolve(process.cwd(), './src/xajax.html'), 'utf8').replace(
        '/* xajax.js */',
        uglifyjs.minify(fs.readFileSync(path.resolve(process.cwd(), './src/xajax.js'), 'utf8'), {
            mangle: {
                reserved: ['HostWhitelist'],
                ie8: true
            }
        }).code
    )
);

module.exports = {
    input: 'src/index.js',
    name: 'iframexajax',
    output: {
        file: 'dist/xajax.js',
        format: 'umd'
    },
    plugins: [
        // uglify({
        //     // mangle: false,
        //     ie8: true
        // })
    ]
};
