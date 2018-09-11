const {
    concat,
    map,
    filter,
    pipe,
    pipeP,
    prop,
    last,
    complement,
    split
} = require('ramda');
const CWD = process.cwd();
const { readdirSync, lstatSync } = require('fs');
const inquirer = require('inquirer');
const Ora = require('ora');
const CLIEngine = require('eslint').CLIEngine;
const { rulesFormatter } = require('./formatter');

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

// Object -> { stdin: Stream, stdout: Stream }
const fix = async ({ config, ignore }) => {
    const folders = getDirectories(CWD);
    const path = await getSelectedPath(folders);

    const cli = new CLIEngine({
        configFile : config,
        ignorePath : ignore
    });

    var report = cli.executeOnFiles([path]);
    console.log(rulesFormatter(report.results));
};

module.exports = {
    CWD,
    fix,
    spinner
};
