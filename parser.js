const axios = require('axios');
const cheerio = require('cheerio');

class ApartmentParser {
  
  async parseAvito(city = 'simferopol', rooms = '') {
    try {
      const url = `https://www.avito.ru/${city}/kvartiry/sdam/na_dlitelnyy_srok${rooms}`;
      
      console.log(`🔍 Парсим Avito: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const apartments = [];
      
      // Новый селектор для Avito
      $('[data-marker="item"]').slice(0, 15).each((i, element) => {
        try {
          const titleElem = $(element).find('[itemprop="name"]');
          const priceElem = $(element).find('[itemprop="price"]');
          const addressElem = $(element).find('[data-marker="item-address"]');
          const linkElem = $(element).find('a[data-marker="item-title"]');
          
          const title = titleElem.text().trim() || $(element).find('h3').text().trim();
          const price = priceElem.attr('content') || $(element).find('[data-marker="item-price"]').text().trim();
          const address = addressElem.text().trim() || 'Адрес не указан';
          const link = linkElem.attr('href') ? `https://www.avito.ru${linkElem.attr('href')}` : '';
          
          if (title && price) {
            apartments.push({
              title: title.length > 50 ? title.substring(0, 50) + '...' : title,
              price: price.includes('руб') ? price : `${price} руб/мес`,
              address: address,
              link: link,
              source: 'Avito'
            });
          }
        } catch (e) {
          console.log('Ошибка парсинга элемента:', e.message);
        }
      });
      
      console.log(`✅ Avito: найдено ${apartments.length} объявлений`);
      return apartments;
      
    } catch (error) {
      console.log('❌ Ошибка парсинга Avito:', error.message);
      return this.getMockData('Avito');
    }
  }

  async parseCian() {
    try {
      const url = `https://simferopol.cian.ru/snyat-kvartiru/`;
      
      console.log(`🔍 Парсим ЦИАН: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const apartments = [];
      
      // Упрощенный парсинг ЦИАН
      $('article').slice(0, 10).each((i, element) => {
        try {
          const title = $(element).find('a[data-name="Title"]').text().trim();
          const price = $(element).find('span[data-mark="MainPrice"]').text().trim();
          const address = $(element).find('a[data-name="GeoLabel"]').text().trim();
          const link = $(element).find('a[data-name="Title"]').attr('href');
          
          if (title && price) {
            apartments.push({
              title: title.length > 50 ? title.substring(0, 50) + '...' : title,
              price: price,
              address: address || 'Адрес не указан',
              link: link || '',
              source: 'ЦИАН'
            });
          }
        } catch (e) {
          console.log('Ошибка парсинга элемента ЦИАН:', e.message);
        }
      });
      
      console.log(`✅ ЦИАН: найдено ${apartments.length} объявлений`);
      return apartments;
      
    } catch (error) {
      console.log('❌ Ошибка парсинга ЦИАН:', error.message);
      return this.getMockData('ЦИАН');
    }
  }

  getMockData(source) {
    return [
      {
        title: `Квартира в Симферополе (${source})`,
        price: "от 20 000 руб/мес",
        address: "Симферополь",
        link: source === 'Avito' ? "https://avito.ru" : "https://cian.ru",
        source: source
      }
    ];
  }

  async searchApartments(area = 'симферополь', roomType = '') {
    try {
      console.log(`🔍 Запускаем РЕАЛЬНЫЙ поиск в ${area}...`);
      
      let avitoRooms = '';
      if (roomType.includes('1к')) avitoRooms = '?rooms=1';
      if (roomType.includes('2к')) avitoRooms = '?rooms=2';
      if (roomType.includes('3к')) avitoRooms = '?rooms=3';
      
      const [avitoResults, cianResults] = await Promise.all([
        this.parseAvito('simferopol', avitoRooms),
        this.parseCian()
      ]);
      
      const allResults = [...avitoResults, ...cianResults].slice(0, 10);
      
      console.log(`🎯 Всего найдено: ${allResults.length} объявлений`);
      return allResults;
      
    } catch (error) {
      console.log('❌ Ошибка поиска:', error);
      return [...this.getMockData('Avito'), ...this.getMockData('ЦИАН')];
    }
  }
}

module.exports = ApartmentParser;
