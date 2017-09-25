const fs = require('fs');
const path = require('path');

let debugMode = false;

const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
    console.log(`${index}: ${val}`);
    switch (val) {
    case '--debug':
        debugMode = true;
        break;
    default:
    }
});

const suffix = debugMode ? '-debug' : '';

const child_process = require('child_process');
child_process.execSync(path.resolve(process.cwd(), './node_modules/.bin/rollup')
    + ` -c ./build/rollup-iframe-agent${suffix}.config.js`);

fs.writeFileSync(path.resolve(process.cwd(), `./dist/iframe-agent${suffix}.html`),
    fs.readFileSync(path.resolve(process.cwd(), './src/iframe-agent.html'), 'utf8').replace(
        '/* iframe-agent.js */',
        fs.readFileSync(path.resolve(process.cwd(), './temp/iframe-agent.js'), 'utf8')
    )
);
