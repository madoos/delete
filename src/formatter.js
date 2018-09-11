const chalk = require('chalk');

function getProblemCount(results) {
    return results.reduce((accumulator, fileResults) => {
        fileResults.messages.forEach(message => {
            const rule = accumulator.find(
                r =>
                    r.ruleId === message.ruleId &&
                    r.severity === message.severity
            );
            if (rule) {
                rule.amount++;
                rule.autoFixable += message.fix ? 1 : 0;
            } else {
                accumulator.push({
                    ruleId      : message.ruleId,
                    severity    : message.severity,
                    message     : message.message,
                    amount      : 1,
                    autoFixable : message.fix ? 1 : 0
                });
            }
        });
        return accumulator;
    }, []);
}

const rulesFormatter = results => {
    console.log(results[0]);
    let problemCount = getProblemCount(results);
    if (problemCount.length) {
        console.log(
            'problems',
            'auto-fixable',
            'rule'.padEnd(35),
            'description'
        );
        problemCount
            // Ordering by amount, errors first
            .sort(
                (rule1, rule2) =>
                    rule1.amount === rule2.amount
                        ? rule2.severity - rule1.severity
                        : rule2.amount - rule1.amount
            )
            // Printing
            .forEach(rule => {
                const colorKey = rule.severity === 2 ? 'red' : 'yellow';
                const percentageFixable = Math.round(
                    (rule.autoFixable / rule.amount) * 100
                );
                console.log(
                    chalk.keyword(colorKey)(rule.amount.toString().padStart(8)),
                    chalk.cyan(
                        rule.autoFixable
                            ? rule.autoFixable.toString().padStart(7) +
                              (percentageFixable + '%').padStart(5)
                            : ''.padEnd(7 + 5)
                    ),
                    chalk.keyword(colorKey)((rule.ruleId || '-').padEnd(35)),
                    chalk.dim(rule.message)
                );
            });
    }
};

module.exports = {
    rulesFormatter
};
