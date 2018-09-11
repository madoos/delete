#!/usr/bin/env node

const cli = require('yargs')
const { fix } = require('./src/commands')

cli
    .command({
        command : 'fix',
        aliases : ['f'],
        desc    : 'fix js files',
        handler : fix,
        builder : cli => {
            cli.option('config', {
                alias    : 'c',
                describe : 'eslint config',
                required : true
            }).option('ignore', {
                alias    : 'i',
                describe : 'eslint ignore',
                required : true
            })

            return cli
        }
    })
    .help().argv
