const {
    chain,
    prop,
    pipe,
    groupBy,
    map,
    sortWith,
    descend,
    identity
} = require('ramda');
const { mapObject, pickToArray, applyZip, percent, print } = require('./utils');
const { table: tableToString } = require('table');
const chalk = require('chalk');

const headerColors = [
    {
        color : chalk.cyan,
        name  : 'autofixables',
        width : 12
    },
    {
        color : chalk.magenta,
        name  : 'rule',
        width : 30
    },
    {
        color : chalk.cyan,
        name  : 'problems',
        width : 8
    },
    {
        color : value => {
            const colors = { 1 : chalk.red, 2 : chalk.yellow };
            const colorize = colors[value] || identity;
            return colorize(value);
        },
        name  : 'severity',
        width : 8
    },
    {
        color : chalk.green,
        name  : 'percentage',
        width : 10
    },
    {
        color : chalk.gray,
        name  : 'message',
        width : 65
    }
];

const doRowConfig = (conf, { width }, i) => {
    conf[i] = { width };
    return conf;
};

const tableOptions = {
    columns : headerColors.reduce(doRowConfig, {})
};

const doResume = (report, item, i, arr) => {
    const autofixables = (report.autofixables += item.fix ? 1 : 0);
    return {
        autofixables,
        problems : arr.length,
        message  : item.message
    };
};

const setPercentage = item => ({
    ...item,
    percentage : percent(item.autofixables, item.problems)
});

const addRuleAndSeverity = (value, key) => {
    const [rule, severity] = key.split('$');
    return { ...value, rule, severity };
};

// resume :: [{ message: []}] -> [{ 'rule', 'severity', 'problems', 'autofixables', 'message' }]
const resume = pipe(
    chain(prop('messages')),
    groupBy(item => item.ruleId + '$' + item.severity),
    map(items => items.reduce(doResume, { autofixables : 0 })),
    map(setPercentage),
    mapObject(addRuleAndSeverity),
    sortWith([descend(prop('autofixables'))])
);

const toTable = data => {
    const head = map(prop('name'), headerColors);
    const columns = map(pickToArray(head), data);
    return [head, ...columns];
};

const colorizeColumn = column => {
    const colors = map(prop('color'), headerColors);
    return applyZip(colors, column);
};

const colorizeTable = ([header, ...columns]) => {
    const headersColored = map(chalk.gray, header);
    return [headersColored, ...columns.map(colorizeColumn)];
};

const createTable = pipe(
    toTable,
    colorizeTable,
    table => tableToString(table, tableOptions)
);

const showReport = pipe(
    prop('results'),
    resume,
    createTable,
    print
);

module.exports = {
    resume,
    colorizeTable,
    toTable,
    createTable,
    showReport
};
