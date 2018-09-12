#!/usr/bin/env node

const cli = require('yargs');
const { analyze } = require('./src/commands');

cli
    .command({
        command : 'analize',
        aliases : ['a'],
        desc    : 'Get eslint report.',
        handler : analyze,
        builder : cli => {
            cli.option('config', {
                alias    : 'c',
                describe : 'eslint config',
                required : true
            }).option('ignore', {
                alias    : 'i',
                describe : 'eslint ignore',
                required : true
            });

            return cli;
        }
    })
    .help().argv;
