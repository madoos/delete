const {
    addNotifier,
    getLintReport,
    fixLintErrors,
    askForDirectoryInPath,
    prettierCli,
    promisifyEE,
    asPromise
} = require('./utils');
const { showReport } = require('./formatter');
const { pipe, pipeP, prop } = require('ramda');
const _ = require('highland');

// _printReport :: ({ path, config, ignore }) -> undefined
const _printReport = pipe(
    getLintReport,
    showReport
);

const _fixAndPrintReport = pipe(
    fixLintErrors,
    showReport
);

const _prettify = directory => {
    const prettier = prettierCli(directory);
    _(prettier.stdout)
        .last()
        .pipe(process.stdout);
    _(prettier.stderr)
        .last()
        .pipe(process.stderr);

    return promisifyEE({ resolve : 'close', reject : 'error' }, prettier);
};

const _execAnalyze = addNotifier(_printReport, {
    start : 'Generating report.',
    end   : 'Done!'
});

const _execFix = addNotifier(_fixAndPrintReport, {
    start : 'Performing fix.',
    end   : 'Done: Reported unfixable problems.'
});

const _execPrettify = addNotifier(_prettify, {
    start : 'Performing prettify. ',
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

const prettify = pipeP(
    () => askForDirectoryInPath('Select a directory to prettify code.'),
    asPromise(prop('directory')),
    _execPrettify
);

module.exports = {
    analyze,
    fix,
    prettify
};
