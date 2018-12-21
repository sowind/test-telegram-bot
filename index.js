'use strict';

const debug = require('debug')('bot');
const SocksClient = require('socks5-https-client/lib/Agent');
const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');

/**
 * Подтверждение работы
 * ? Нужно ли в будущем
 */
debug('something working!!!1');
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

function botAnswer (ctx, answer, addition = null) {
    debug(ctx.message);
    ctx.reply(answer, addition);
    debug('Ответ "%s" отправлен', answer);
}

function declOfNum(number, titles) {  
    let cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}

function thankYou (ctx) {
    let ep;
    if (ctx.message && ctx.message.text.indexOf('!')) {
        ep = ctx.message.text.split('!').length - 1;
    }
    debug(ep);
    botAnswer(ctx, 'спасибо! ☺️'+ (ep ? ` Вы похвалили на ${ep} ${declOfNum(ep, ['восклицательный', 'восклицательных', 'восклицательных'])} ${declOfNum(ep, ['знак', 'знака', 'знаков'])}!` : '')); // эпичнейший говнокод
}

function botStart(ctx) {
    let answer = ('Добро пожаловать!\nВыберите действие:');
    let addition = Markup.inlineKeyboard([
        Markup.callbackButton('Молодец', 'Молодец'),
        Markup.callbackButton('Запись', 'Запись'),
    ]).extra();
    bot.action('Молодец', ctx => thankYou(ctx));
    bot.action('Запись', ctx => botAnswer(ctx, 'записываю 🤔'));
    botAnswer(ctx, answer, addition);
}

bot.start((ctx) => botStart(ctx));
bot.on('sticker', (ctx) => botAnswer(ctx, '👍'));
bot.hears(/^запись/i, (ctx) => botAnswer(ctx, 'записываю 🤔'));
bot.hears(/^молодец(!|1|один|\))*$/i, (ctx) => thankYou(ctx))

bot.startPolling();
