const { fix, spinner } = require('./utils')
const notifier = spinner()

const _fix = async argv => {
    const { fixer } = await fix(argv)
    fixer.on('close', () => notifier.succeed('Fixed eslint style'))
    notifier.start('Fixing eslint style')
}

module.exports = {
    fix : _fix
}
