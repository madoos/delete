const { fix } = require('./utils');

const _fix = async argv => {
    fix(argv);
};

module.exports = {
    fix : _fix
};
