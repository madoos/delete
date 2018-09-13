#!/usr/bin/env node

const cli = require('yargs');
const { analyze, fix, prettify } = require('./src/commands');

const builder = cli => {
    cli.option('configFile', {
        alias    : 'c',
        describe : 'eslint config file',
        default  : './.eslintrc.json'
    }).option('ignorePath', {
        alias    : 'i',
        describe : 'eslint ignore file',
        default  : './.eslintignore'
    });
    /*     .option('gitStagedFiles', {
        alias    : 'g',
        describe : 'perform task only on git staged files.',
        boolean  : true
    }); */
    return cli;
};

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
        handler : prettify
    })
    .help().argv;
