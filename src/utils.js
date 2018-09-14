const {
    concat,
    map,
    filter,
    pipe,
    last,
    complement,
    split,
    curry,
    zipWith,
    call
} = require('ramda');
const { EOL } = require('os');
const CWD = process.cwd();
const { readdirSync, lstatSync } = require('fs');
const inquirer = require('inquirer');
const Ora = require('ora');
const Linter = require('eslint').CLIEngine;
const { spawn, execSync } = require('child_process');
const { join } = require('path');

// String -> String
const concatBaseDir = concat(`${CWD}/`);

// String -> Boolean
const isDirectory = source => lstatSync(source).isDirectory();

// String -> String
const lastFolder = pipe(
    split('/'),
    last
);

// String -> Boolean
const isHiddenPath = path => lastFolder(path).includes('.');

// :: String -> [String]
const getDirectories = pipe(
    readdirSync,
    map(concatBaseDir),
    filter(isDirectory),
    filter(complement(isHiddenPath)),
    map(lastFolder)
);

// askForDirectoryInPath :: String => directory
const askForDirectoryInPath = async message => {
    let response = await inquirer.prompt([
        {
            type    : 'list',
            name    : 'directory',
            message,
            choices : [...getDirectories(CWD), 'exit'],
            filter  : input => CWD.concat('/').concat(input)
        }
    ]);
    return response.directory;
};

// spinner :: String -> Object
const spinner = text => {
    return new Ora({
        text,
        spinner : process.argv[2]
    });
};

// mapObject :: (a -> b) -> (Oa -> Ob
const mapObject = curry((f, o) => {
    return Object.entries(o).map(([key, value]) => f(value, key));
});

const pickToArray = curry((props, o) => {
    return props.map(key => o[key]);
});

const applyZip = curry((fns, data) => {
    return zipWith(call, fns, data);
});

const percent = (a, b) => Math.floor((a / b) * 100);

const print = s => process.stdout.write(s);

const notifier = spinner();

const addNotifier = (f, { start, end }) => async (...args) => {
    notifier.start(start);
    const result = await f(...args);
    notifier.succeed(end);
    return result;
};

const getLintReport = (lintConfig, files) => {
    const cli = new Linter(lintConfig);
    return cli.executeOnFiles(files);
};

const fixLintErrors = pipe(
    getLintReport,
    report => Linter.outputFixes(report) || report
);

const prettierCli = directory => {
    const prettier = join(CWD, 'node_modules/prettier-semi-cli/src/index.js');
    const files = directory.concat('/**/*.js');
    return spawn(prettier, ['--write', files], { cwd : CWD });
};

const isValidFile = filename => {
    return filename.split('.').pop() === 'js';
};

const gitDiffExec = branchTarget => {
    return execSync(`git diff --name-only ${branchTarget}`, {
        encoding : 'utf8'
    });
};

const streamToArray = stream => stream.split(EOL);

const getGitDiffFiles = pipe(
    gitDiffExec,
    streamToArray,
    filter(isValidFile)
);

const promisifyEE = ({ resolve, reject }, ee) =>
    new Promise((res, rej) => {
        ee.on(resolve, () => res(ee)).on(reject, rej);
    });

const asPromise = f => (...args) => Promise.resolve(f(...args));

module.exports = {
    CWD,
    spinner,
    mapObject,
    pickToArray,
    applyZip,
    percent,
    print,
    addNotifier,
    notifier,
    getLintReport,
    fixLintErrors,
    askForDirectoryInPath,
    prettierCli,
    promisifyEE,
    getGitDiffFiles,
    asPromise
};
