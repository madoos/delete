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
const CWD = process.cwd();
const { readdirSync, lstatSync } = require('fs');
const inquirer = require('inquirer');
const Ora = require('ora');
const Linter = require('eslint').CLIEngine;

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

// askForDirectoryInPath :: String => {directory}
const askForDirectoryInPath = message =>
    inquirer.prompt([
        {
            type    : 'list',
            name    : 'directory',
            message,
            choices : [...getDirectories(CWD), 'exit'],
            filter  : input => CWD.concat('/').concat(input)
        }
    ]);

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

const addNotifier = (f, { start, end }) => (...args) => {
    notifier.start(start);
    const result = f(...args);
    notifier.succeed(end);
    return result;
};

const getLintReport = (lintConfig, directory) => {
    const cli = new Linter(lintConfig);
    return cli.executeOnFiles([directory]);
};

const fixLintErrors = pipe(
    getLintReport,
    report => Linter.outputFixes(report) || report
);

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
    askForDirectoryInPath
};
