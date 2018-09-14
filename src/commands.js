const {
    addNotifier,
    getLintReport,
    fixLintErrors,
    askForDirectoryInPath,
    prettierCli,
    promisifyEE,
    getGitDiffFiles
} = require('./utils');
const { showReport } = require('./formatter');
const { pipe } = require('ramda');
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

const _getFiles = async (directory, askMessage, branch) => {
    if (directory) {
        return [directory];
    } else if (branch) {
        return getGitDiffFiles(branch);
    }
    return await [askForDirectoryInPath(askMessage)];
};

const analyze = async ({
    configFile,
    ignorePath,
    directory,
    gitDiffBranch
}) => {
    let files = await _getFiles(
        directory,
        'Select a directory to analyze.',
        gitDiffBranch
    );

    _execAnalyze({ configFile, ignorePath }, files);
};

const fix = async ({ configFile, ignorePath, directory, gitDiffBranch }) => {
    let files = await _getFiles(
        directory,
        'Select a directory to fix code style.',
        gitDiffBranch
    );
    _execFix({ configFile, ignorePath, fix : true }, files);
};

const prettify = async ({ directory }) => {
    [directory] = await _getFiles(
        directory,
        'Select a directory to prettify code.'
    );
    _execPrettify(directory);
};

module.exports = {
    analyze,
    fix,
    prettify
};
