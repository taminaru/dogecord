/* eslint-disable no-console */

const { Argument: { compose, range, union }, Command } = require('../..');

class TestCommand extends Command {
    constructor() {
        super('test', {
            aliases: ['test', 'test-a'],
        });
    }

    exec(message, args) {
        message.channel.send('Use a slash command!');
    }
    async execSlash(message) {
        return message.reply('Slash command works!')
    }
}

module.exports = TestCommand;
