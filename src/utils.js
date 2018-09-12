const {
    concat,
    map,
    filter,
    pipe,
    pipeP,
    prop,
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
const { EOL } = require('os');
//const Linter = require('eslint').CLIEngine
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

// [Strings] => [Object]
const ask = folders => {
    return inquirer.prompt([
        {
            type    : 'list',
            name    : 'path',
            message : 'Select your line to fix code style',
            choices : [...folders, 'exit'],
            filter  : input => CWD.concat('/').concat(input)
        }
    ]);
};

//  [Strings] => String
const getSelectedPath = pipeP(
    ask,
    prop('path')
);

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
    notifier.start(start.concat(EOL));
    const result = f(...args);
    notifier.succeed(end.concat(EOL));
    return result;
};

const analyzeFiles = ({ config, ignore, path }) => {
    const Linter = require(join(CWD, 'node_modules/eslint')).CLIEngine;

    const cli = new Linter({
        configFile : config,
        ignorePath : ignore
    });
    const report = cli.executeOnFiles([path]);
    return report;
};

module.exports = {
    CWD,
    spinner,
    mapObject,
    getDirectories,
    getSelectedPath,
    pickToArray,
    applyZip,
    percent,
    print,
    addNotifier,
    notifier,
    analyzeFiles
};
