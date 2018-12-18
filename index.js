'use strict';

const debug = require('debug')('bot');
const SocksClient = require('socks5-https-client/lib/Agent');
const Telegraf = require('telegraf');

/**
 * Подтверждение работы
 * ? Нужно ли в будущем
 */
debug('something working!');
debug(process.env.BOT_TOKEN);

/**
 * Установка соединения с прокси из-за блокировки Telegram
 * TODO Удалить, при нахождении решения
 */
const SocksAgent = new SocksClient({
    socksHost: process.env.PROXY_IP, // 188.213.166.152
    socksPort: process.env.PROXY_PORT, // 1080
    // socksUsername: '',
    // socksPassword: ''
});

/**
 * Инициализация Telegraf
 * @param telegram соединение через прокси
 */
const bot = new Telegraf(process.env.BOT_TOKEN,
{
    telegram: {
        agent: SocksAgent
    }
});

bot.start((ctx) => {
    debug(ctx.message);
    ctx.reply('Добро пожаловать!');
    debug('Ответ отправлен');
});
bot.on('sticker', (ctx) => {
    debug(ctx.message);
    ctx.reply('👍');
    debug('Ответ отправлен');
});
bot.hears(/запись/i, (ctx) => {
    debug(ctx.message);
    ctx.reply('записываю 🤔');
    debug('Ответ отправлен');
});
bot.startPolling();
