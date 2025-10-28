const TelegramBot = require('node-telegram-bot-api');
const ApartmentParser = require('./parser.js');

const token = '8460225301:AAGa8wP1sm68NGl2AUDALVkQBYoFGdthrKo';
const bot = new TelegramBot(token, {polling: true});
const parser = new ApartmentParser();

console.log('🏠 Бот для РЕАЛЬНОГО поиска квартир запущен!');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeText = `
🏠 *Добро пожаловать в бот РЕАЛЬНОГО поиска квартир!*

🔍 *Бот ищет актуальные объявления с:*
• Avito
• ЦИАН

📍 *Доступные города:*
• Симферополь
• Крым

💡 *Просто напишите "поиск" или название города!*

⚠️ *Поиск может занять 10-30 секунд*
  `;
  
  bot.sendMessage(chatId, welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
        ['🏠 Симферополь 2к', '🏠 Симферополь 3к'],
        ['🌊 Крым', '📞 Помощь']
      ],
      resize_keyboard: true
    }
  });
});

// Обработка поиска
bot.onText(/🔍 Поиск|поиск|симферополь|крым/i, async (msg) => {
  const chatId = msg.chat.id;
  
  // Отправляем сообщение о начале поиска
  const searchMessage = await bot.sendMessage(chatId, '🔍 *Ищу актуальные объявления...*\n\nЭто может занять 10-30 секунд', {
    parse_mode: 'Markdown'
  });

  try {
    // Выполняем поиск
    const apartments = await parser.searchApartments();
    
    if (apartments.length > 0) {
      let response = `🏠 *Найдено ${apartments.length} объявлений:*\n\n`;
      
      apartments.forEach((apt, index) => {
        response += `*${index + 1}. ${apt.title}*\n`;
        response += `💰 *${apt.price}*\n`;
        response += `📍 ${apt.address}\n`;
        response += `📱 *${apt.source}*\n`;
        if (apt.link) {
          response += `🔗 [Ссылка](${apt.link})\n`;
        }
        response += '\n' + '─'.repeat(20) + '\n\n';
      });
      
      // Редактируем исходное сообщение
      await bot.editMessageText(response, {
        chat_id: chatId,
        message_id: searchMessage.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
      
    } else {
      await bot.editMessageText('❌ *Не удалось найти объявления*\n\nПопробуйте позже или используйте кнопки для поиска', {
        chat_id: chatId,
        message_id: searchMessage.message_id,
        parse_mode: 'Markdown'
      });
    }
    
  } catch (error) {
    console.log('Ошибка поиска:', error);
    await bot.editMessageText('❌ *Произошла ошибка при поиске*\n\nПопробуйте позже', {
      chat_id: chatId,
      message_id: searchMessage.message_id,
      parse_mode: 'Markdown'
    });
  }
});

// Команда /help
bot.onText(/\/help|📞 Помощь/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '💡 *Как пользоваться ботом:*\n\n' +
    '1. Нажмите "🔍 Поиск в Симферополе"\n' +
    '2. Или напишите "поиск", "симферополь"\n' +
    '3. Бот найдет актуальные объявления\n\n' +
    '⚠️ *Поиск занимает 10-30 секунд*\n\n' +
    '📞 *Поддержка:* @ApartamentScoutBot',
    {parse_mode: 'Markdown'}
  );
});

console.log('✅ Бот готов к РЕАЛЬНОМУ поиску!');
