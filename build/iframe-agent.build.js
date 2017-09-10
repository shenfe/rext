const fs = require('fs');
const path = require('path');

const child_process = require('child_process');
child_process.execSync(path.resolve(process.cwd(), './node_modules/.bin/rollup')
    + ' -c ./build/rollup-iframe-agent.config.js');

fs.writeFileSync(path.resolve(process.cwd(), './dist/iframe-agent.html'),
    fs.readFileSync(path.resolve(process.cwd(), './src/iframe-agent.html'), 'utf8').replace(
        '/* iframe-agent.js */',
        fs.readFileSync(path.resolve(process.cwd(), './temp/iframe-agent.js'), 'utf8')
    )
);
