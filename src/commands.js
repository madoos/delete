const Linter = require('eslint').CLIEngine;
const {
    getDirectories,
    getSelectedPath,
    CWD,
    addNotifier
} = require('./utils');
const { showReport } = require('./formatter');

// show report in conosle
const analize = async ({ config, ignore }) => {
    const folders = getDirectories(CWD);
    const path = await getSelectedPath(folders);
    const cli = new Linter({ configFile : config, ignorePath : ignore });
    const report = cli.executeOnFiles([path]);
    showReport(report);
};

module.exports = {
    analize : addNotifier(analize, { start : 'start', end : 'end' })
};
