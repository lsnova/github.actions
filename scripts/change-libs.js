const path = require("path");
const fs = require('fs');

const toLsn = process.argv[2] === 'to-lsn';
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '/package.json')).toString())
const libs = {
    'ocsg': {
        lsnPath: 'github:lsnova/ocean.styleguide',
        ehPath: 'github:lsnova/eh-sources.ocean.styleguide',
        backCompVersionMap: {
            '15.9.11': 'manual_15.9.11',
            '15.9.16': 'manual_15.9.16',
            '15.9.25': 'manual_15.9.25',
            '15.9.26': 'manual_15.9.26',
            '15.10.1': 'manual_15.10.1',
            '15.10.6': 'manual_15.10.6'
        }
    }
    // @todo add occ and ocs data
}

function getLsnPath(currentVer, data) {
    let lsnVersion = currentVer;
    for (const ver of Object.keys(data.backCompVersionMap ?? {})) {
        if (data.backCompVersionMap[ver] === lsnVersion) {
            lsnVersion = ver;
            break;
        }
    }
    return lsnVersion;
}

function getEhPath(currentVer, data) {
    return data.backCompVersionMap?.[currentVer] ?? currentVer;
}

Object.keys(libs).forEach(code => {
    const data = libs[code];
    const depPath = `@lsnova/${code}-lib`
    let currentVersion = pkg.dependencies[depPath].split('#')[1];
    const ver = toLsn
        ? getLsnPath(currentVersion, libs[code])
        : getEhPath(currentVersion, libs[code]);
    pkg.dependencies[depPath] = toLsn
        ? `${data.lsnPath}#${ver}`
        : `${data.ehPath}#${ver}`;
    console.log(`Switched ${depPath} to ${pkg.dependencies[depPath]}`);
})

fs.writeFileSync(path.join(__dirname, '/../../package.json'), JSON.stringify(pkg, null, 2));
