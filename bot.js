const TelegramBot = require('node-telegram-bot-api');
const ApartmentParser = require('./parser.js');

const token = '8460225301:AAGa8wP1sm68NGl2AUDALVkQBYoFGdthrKo';
const bot = new TelegramBot(token, {polling: true});
const parser = new ApartmentParser();

// Хранилище активных поисков
const activeSearches = new Map();

console.log('🏠 Бот для РЕАЛЬНОГО поиска квартир запущен!');

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  showMainMenu(chatId);
});

function showMainMenu(chatId) {
  const welcomeText = `
🏠 *Добро пожаловать в бот РЕАЛЬНОГО поиска квартир!*

🔍 *Бот ищет актуальные объявления с:*
• Avito
• ЦИАН

📍 *Доступные города:*
• Симферополь
• Крым

💡 *Выберите вариант поиска ниже!*

⚠️ *РЕАЛЬНЫЙ поиск может занять 10-20 секунд*
  `;
  
  bot.sendMessage(chatId, welcomeText, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
        ['🏠 Симферополь 2к', '🏠 Симферополь 3к'],
        ['🌊 Крым', '🛑 Остановить поиск'],
        ['📞 Помощь']
      ],
      resize_keyboard: true
    }
  });
}

// Обработка поиска
bot.onText(/🔍 Поиск|поиск|симферополь|крым|1к|2к|3к/i, async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Определяем тип поиска
  let searchType = 'Симферополе';
  let roomType = '';
  
  if (text.includes('1к')) {
    searchType = '1-комнатные в Симферополе';
    roomType = '1к';
  } else if (text.includes('2к')) {
    searchType = '2-комнатные в Симферополе'; 
    roomType = '2к';
  } else if (text.includes('3к')) {
    searchType = '3-комнатные в Симферополе';
    roomType = '3к';
  } else if (text.includes('Крым')) {
    searchType = 'Крым';
  }
  
  // Отправляем сообщение о начале поиска
  const searchMessage = await bot.sendMessage(chatId, 
    `🔍 *Запускаем РЕАЛЬНЫЙ поиск в ${searchType}...*\n\n` +
    `⏱ *Это может занять 10-20 секунд*\n\n` +
    `_Для остановки нажмите «🛑 Остановить поиск»_`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          ['🛑 Остановить поиск']
        ],
        resize_keyboard: true
      }
    }
  );

  // Сохраняем ID активного поиска
  activeSearches.set(chatId, {
    messageId: searchMessage.message_id,
    startTime: Date.now()
  });

  try {
    // Выполняем РЕАЛЬНЫЙ поиск
    const apartments = await parser.searchApartments(searchType, roomType);
    
    // Удаляем из активных поисков
    activeSearches.delete(chatId);
    
    if (apartments.length > 0) {
      let response = `🏠 *Найдено ${apartments.length} объявлений в ${searchType}:*\n\n`;
      
      apartments.forEach((apt, index) => {
        response += `*${index + 1}. ${apt.title}*\n`;
        response += `💰 *${apt.price}*\n`;
        response += `📍 ${apt.address}\n`;
        response += `📱 *${apt.source}*\n`;
        if (apt.link) {
          response += `🔗 [Смотреть объявление](${apt.link})\n`;
        }
        response += '\n' + '─'.repeat(30) + '\n\n';
      });
      
      response += `✅ *Поиск завершен!*\n_Для нового поиска используйте кнопки ниже_`;
      
      // Редактируем исходное сообщение
      await bot.editMessageText(response, {
        chat_id: chatId,
        message_id: searchMessage.message_id,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          keyboard: [
            ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
            ['🏠 Симферополь 2к', '🏠 Симферополь 3к'],
            ['🌊 Крым', '📞 Помощь']
          ],
          resize_keyboard: true
        }
      });
      
    } else {
      await bot.editMessageText(
        `❌ *Не удалось найти объявления в ${searchType}*\n\n` +
        `⚠️ *Возможные причины:*\n` +
        `• Проблемы с сайтами объявлений\n` +
        `• Нет актуальных предложений\n` +
        `• Попробуйте позже\n\n` +
        `_Используйте кнопки для нового поиска_`,
        {
          chat_id: chatId,
          message_id: searchMessage.message_id,
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
              ['🏠 Симферополь 2к', '🏠 Симферополь 3к'],
              ['📞 Помощь']
            ],
            resize_keyboard: true
          }
        }
      );
    }
    
  } catch (error) {
    console.log('Ошибка поиска:', error);
    
    // Удаляем из активных поисков
    activeSearches.delete(chatId);
    
    await bot.editMessageText(
      `❌ *Произошла ошибка при поиске*\n\n` +
      `⚠️ *Попробуйте:*\n` +
      `• Проверить интернет-соединение\n` +
      `• Попробовать позже\n` +
      `• Использовать другой вариант поиска\n\n` +
      `_Техническая информация: ${error.message}_`,
      {
        chat_id: chatId,
        message_id: searchMessage.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
            ['📞 Помощь']
          ],
          resize_keyboard: true
        }
      }
    );
  }
});

// Обработка остановки поиска
bot.onText(/🛑 Остановить поиск/, (msg) => {
  const chatId = msg.chat.id;
  
  if (activeSearches.has(chatId)) {
    activeSearches.delete(chatId);
    bot.sendMessage(chatId, 
      `⏹ *Поиск остановлен!*\n\n` +
      `_Используйте кнопки ниже для нового поиска_`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            ['🔍 Поиск в Симферополе', '🏠 Симферополь 1к'],
            ['🏠 Симферополь 2к', '🏠 Симферополь 3к'],
            ['📞 Помощь']
          ],
          resize_keyboard: true
        }
      }
    );
  } else {
    bot.sendMessage(chatId, '✅ Сейчас нет активного поиска для остановки.');
  }
});

// Команда /help
bot.onText(/\/help|📞 Помощь/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    '💡 *Как пользоваться ботом:*\n\n' +
    '1. Выберите вариант поиска из кнопок\n' +
    '2. Бот запустит РЕАЛЬНЫЙ поиск на Avito и ЦИАН\n' +
    '3. Дождитесь результатов (10-20 секунд)\n' +
    '4. Для остановки нажмите «🛑 Остановить поиск»\n\n' +
    '⚠️ *РЕАЛЬНЫЙ поиск работает с настоящими сайтами*\n\n' +
    '🏠 *Доступные фильтры:*\n' +
    '• Поиск в Симферополе\n' +
    '• 1, 2, 3-комнатные квартиры\n' +
    '• Поиск по Крыму\n\n' +
    '📞 *Поддержка:* @denisok6893',
    {parse_mode: 'Markdown'}
  );
});

console.log('✅ Бот готов к РЕАЛЬНОМУ поиску!');
