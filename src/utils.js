const {
    concat,
    flip,
    map,
    filter,
    pipe,
    pipeP,
    prop,
    path,
    last,
    complement,
    split
} = require('ramda')
const CWD = process.cwd()
const { join } = require('path')
const { readdirSync, lstatSync } = require('fs')
const inquirer = require('inquirer')
const { spawn } = require('child_process')
const Ora = require('ora')

// String -> String
const concatBaseDir = concat(`${CWD}/`)

// String -> Boolean
const isDirectory = source => lstatSync(source).isDirectory()

// String -> String
const lastFolder = pipe(
    split('/'),
    last
)

// String -> Boolean
const isHiddenPath = path => lastFolder(path).includes('.')

// :: String -> [String]
const getDirectories = pipe(
    readdirSync,
    map(concatBaseDir),
    filter(isDirectory),
    filter(complement(isHiddenPath)),
    map(lastFolder)
)

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
    ])
}

//  [Strings] => String
const getSelectedPath = pipeP(
    ask,
    prop('path')
)

// Object -> { stdin: Stream, stdout: Stream }
const eslintCli = ({ config, path, ignore }) => {
    const cli = join(__dirname, '../', './node_modules/eslint/bin/eslint.js')
    const options = ['.', '-c', config, '--ignore-path', ignore, '--fix']
    return spawn(cli, options, { cwd : path })
}

// spinner :: String -> Object
const spinner = text => {
    return new Ora({
        text,
        spinner : process.argv[2]
    })
}

// Object -> { stdin: Stream, stdout: Stream }
const fix = async ({ config, ignore }) => {
    const folders = getDirectories(CWD)
    const path = await getSelectedPath(folders)
    const data = { path, config : join(CWD, config), ignore : join(CWD, ignore) }
    const prettier = eslintCli(data)

    return {
        fixer  : prettier,
        stdout : prettier.stdout.pipe(process.stdout),
        stderr : prettier.stderr.pipe(process.stderr)
    }
}

module.exports = {
    CWD,
    fix,
    spinner
}
