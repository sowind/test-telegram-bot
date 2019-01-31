'use strict';

const _ = require('underscore');
const debug = require('debug')('bot');
const SocksClient = require('socks5-https-client/lib/Agent');
const Telegraf = require('telegraf');
const Markup = require('telegraf/markup');
const Session = require('telegraf/session');
const emoji = require('node-emoji');

/**
 * Подтверждение работы
 */
debug('something working!!!1');
debug(process.env.BOT_TOKEN);

/**
 * Установка соединения с прокси из-за блокировки Telegram
 */
const SocksAgent = new SocksClient({
    socksHost: process.env.PROXY_IP,
    socksPort: process.env.PROXY_PORT,
    socksUsername: process.env.PROXY_USERNAME,
    socksPassword: process.env.PROXY_PASSWORD
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

bot.use(Session());

bot.use((ctx, next) => {
    if(ctx.message) debug(ctx.message);
    const start = new Date();
    return next(ctx).then((botAnswer) => {
        if(botAnswer) {
            const ms = new Date() - start;
            debug('Время ответа %sms', ms);
            //debug(botAnswer);
            debug('Ответ "%s" отправлен.', botAnswer.text);
        }
    });
});

function declOfNum(number, titles) {  
    let cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
}

bot.start((ctx) => {
    return ctx.reply('Добро пожаловать!\nВыберите действие:',
    Markup.inlineKeyboard([[
        Markup.callbackButton('Молодец', 'good_boy'),
        Markup.callbackButton('Запись', 'to_write')
    ],[
        Markup.callbackButton('Принять письмо', 'to_send'),
    ]]).extra());
});

bot.action('good_boy', (ctx) => { 
    return ctx.reply('Спасибо! ☺️');
});

bot.action('to_write', (ctx) => {
    return ctx.reply('Записываю 🤔');
});

bot.action('to_letter_open', (ctx) => {
    ctx.session.openLetter = ctx.session.openLetter || 0;
    debug(ctx.session.openLetter);
    return ctx.reply(!ctx.session.openLetter ? (ctx.session.openLetter++, emoji.random().emoji) : 'Уже открыто! Получите новое письмо.');
});

bot.action('to_send', (ctx) => {
    ctx.session.openLetter = 0;
    return ctx.reply('Вам письмо ✉️', 
    Markup.inlineKeyboard([
        Markup.callbackButton('Открыть', 'to_letter_open')
    ]).extra());
});

bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.hears(/^запись/i, (ctx) => ctx.reply('Записываю 🤔'));

bot.hears(/^молодец(!|1|один|\))*$/i, (ctx) => {
    let ep;
    if (ctx.message && ctx.message.text.indexOf('!')) {
        ep = ctx.message.text.split('!').length - 1;
    }
    debug(ep);

    let message = `${ep} ${declOfNum(ep, ['восклицательный', 'восклицательных', 'восклицательных'])} ${declOfNum(ep, ['знак', 'знака', 'знаков'])}`;
    let answer = 'Спасибо! ☺️ ';
    if (ep >= 1 && ep <= 4){
        answer += `Вы похвалили на ${message}!`;
    } 
    if (ep >= 5 && ep <= 14){
        answer += `Вы мне льстите — ${message}!`;
    } 
    if (ep > 15) {
        answer += `Вас не остановить — несчетное количество восклицательных знаков.`;
    }

    return ctx.reply(answer);
});

bot.hears(/^🎅🎄(🎁)*$/, ctx => {
    ctx.session.holidayPresents = 0;

    let presents;
    if (ctx.message.text.indexOf('🎁')) {
        presents = ctx.session.holidayPresents = ctx.message.text.split('🎁').length - 1;
    }
    debug(presents);

    let holidayGreeting = [`Хо-хо-хо! Дед Мороз желает тебе весёлого Нового года и Рождества, и кладет под твою ёлку ${presents} ${declOfNum(presents, ['подарок', 'подарка', 'подарков'])}! ❄️⛄️`,
    Markup.inlineKeyboard([
        [Markup.callbackButton('Открыть один', 'open_one_present')],
        [Markup.callbackButton('Открыть все', 'open_all_presents')]
    ]).extra()];

    let tooMuchPresents = ['Под ёлкой не хватает места для всех подарков! Используйте меньшее количество.'];

    return ctx.reply.apply(null, (presents > 9 ? tooMuchPresents : holidayGreeting));
});

function getRandomPresents(number) {
    let presents = ['👼', '🍪', '🌟', '❄️', '☃️', '⛄️', '🎄', '🔔', '🧦'];
    return _.sample(presents, number);
}

bot.action('open_one_present', ctx => {
    let presents = getRandomPresents(1);
    
    return ctx.reply(ctx.session.holidayPresents ? (ctx.session.holidayPresents--, presents.join('')) : 'Подарки закончились.',
    Markup.inlineKeyboard([
        Markup.callbackButton('Открыть еще один', 'open_one_present')
    ]).extra());
});

bot.action('open_all_presents', ctx => {
    let presents = getRandomPresents(ctx.session.holidayPresents);
    debug('Осталось %s', presents.length);
    
    return ctx.reply(ctx.session.holidayPresents ? (ctx.session.holidayPresents = 0, presents.join('')) : 'Подарки закончились.');
});

bot.hears('🐈', ctx => {
    return ctx.reply('На клавиатуру прыгнул ваш кот!');
});

bot.startPolling();
