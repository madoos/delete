const {
    addNotifier,
    getLintReport,
    fixLintErrors,
    askForDirectoryInPath
} = require('./utils');
const { showReport } = require('./formatter');
const { pipe } = require('ramda');

// _printReport :: ({ path, config, ignore }) -> undefined
const _printReport = pipe(
    getLintReport,
    showReport
);

const _fixAndPrintReport = pipe(
    fixLintErrors,
    showReport
);

const _execAnalyze = addNotifier(_printReport, {
    start : 'Generating report.',
    end   : 'Done!'
});

const _execFix = addNotifier(_fixAndPrintReport, {
    start : 'Performing fix.',
    end   : 'Done: Reported unfixable problems.'
});

const _execPrettify = addNotifier(x => console.log(x), {
    start : 'Performing prettify.',
    end   : 'Done.'
});

const analyze = async ({ configFile, ignorePath }) => {
    const { directory } = await askForDirectoryInPath(
        'Select a directory to analyze.'
    );
    _execAnalyze({ configFile, ignorePath }, directory);
};

const fix = async ({ configFile, ignorePath }) => {
    const { directory } = await askForDirectoryInPath(
        'Select a directory to fix code style.'
    );
    _execFix({ configFile, ignorePath, fix : true }, directory);
};

const prettify = async () => {
    const { directory } = await askForDirectoryInPath(
        'Select a directory to prettify code.'
    );
    // ¿cli command: prettier-semi --write `"directory/**/*.js"?`
    _execPrettify(directory);
};

module.exports = {
    analyze,
    fix,
    prettify
};
