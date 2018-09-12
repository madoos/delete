const {
    getDirectories,
    getSelectedPath,
    CWD,
    addNotifier,
    analyzeFiles
} = require('./utils');
const { showReport } = require('./formatter');
const { pipe } = require('ramda');
const { join } = require('path');

// _printReport :: ({ path, config, ignore }) -> undefined
const _printReport = pipe(
    analyzeFiles,
    showReport
);
const _showAnalysis = addNotifier(_printReport, {
    start : 'Generating report.',
    end   : 'Done!'
});

const analyze = async ({ config, ignore }) => {
    const folders = getDirectories(CWD);
    const path = await getSelectedPath(folders);

    _showAnalysis({
        config : join(CWD, config),
        ignore : join(CWD, ignore),
        path
    });
};

module.exports = {
    analyze
};
