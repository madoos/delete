#!/usr/bin/env node

const cli = require('yargs');
const { analyze, fix, prettify } = require('./src/commands');
const { pipe } = require('ramda');

const baseBuilder = builder => {
    builder
        .option('configFile', {
            alias    : 'c',
            describe : 'eslint config file',
            default  : './.eslintrc.json'
        })
        .option('ignorePath', {
            alias    : 'i',
            describe : 'eslint ignore file',
            default  : './.eslintignore'
        })
        .option('gitDiffBranch', {
            alias    : 'g',
            describe :
                'perform task only on git files that are different of given branch.',
            conflicts : 'files'
        });
    return builder;
};

const stagedFilesBuilder = builder => {
    builder.option('directory', {
        alias     : 'd',
        describe  : 'perform task in a directory.',
        conflicts : 'gitDiffBranch'
    });
    return builder;
};

const builder = pipe(
    baseBuilder,
    stagedFilesBuilder
);

cli
    .command({
        command : 'analyze',
        aliases : ['a'],
        desc    : 'Get eslint report.',
        handler : analyze,
        builder
    })
    .command({
        command : 'fix',
        aliases : ['f'],
        desc    : 'Fix eslint problems.',
        handler : fix,
        builder
    })
    .command({
        command : 'prettify',
        aliases : ['p'],
        desc    : 'Prettify with prettier-eslint.',
        handler : prettify,
        builder : stagedFilesBuilder
    })
    .help().argv;
