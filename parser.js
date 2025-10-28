const axios = require('axios');
const cheerio = require('cheerio');

class ApartmentParser {
  
  // Парсинг Avito
  async parseAvito(city = 'simferopol', rooms = '') {
    try {
      const url = `https://www.avito.ru/${city}/kvartiry/sdam/na_dlitelnyy_srok${rooms}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const apartments = [];
      
      $('[data-marker="item"]').slice(0, 10).each((i, element) => {
        const title = $(element).find('[itemprop="name"]').text().trim();
        const price = $(element).find('[itemprop="price"]').attr('content');
        const address = $(element).find('[data-marker="item-address"]').text().trim();
        const link = `https://www.avito.ru${$(element).find('a[data-marker="item-title"]').attr('href')}`;
        
        if (title && price) {
          apartments.push({
            title: title,
            price: `${price} руб/мес`,
            address: address || 'Адрес не указан',
            link: link,
            source: 'Avito'
          });
        }
      });
      
      return apartments;
    } catch (error) {
      console.log('Ошибка парсинга Avito:', error.message);
      return [];
    }
  }

  // Парсинг ЦИАН (упрощенный)
  async parseCian(city = 'simferopol') {
    try {
      const url = `https://simferopol.cian.ru/cat.php?deal_type=rent&engine_version=2&offer_type=flat&region=4777&room1=1&room2=1&room3=1&room4=1&room5=1&room6=1&room7=1&room9=1`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const apartments = [];
      
      $('[data-name="CardComponent"]').slice(0, 10).each((i, element) => {
        const title = $(element).find('span[data-mark="OfferTitle"]').first().text().trim();
        const price = $(element).find('span[data-mark="MainPrice"]').first().text().trim();
        const address = $(element).find('a[data-name="GeoLabel"]').text().trim();
        const link = $(element).find('a[data-name="Link"]').attr('href');
        
        if (title && price) {
          apartments.push({
            title: title,
            price: price,
            address: address || 'Адрес не указан',
            link: link ? `https://cian.ru${link}` : '',
            source: 'ЦИАН'
          });
        }
      });
      
      return apartments;
    } catch (error) {
      console.log('Ошибка парсинга ЦИАН:', error.message);
      return [];
    }
  }

  // Основной метод поиска
  async searchApartments(area = 'симферополь') {
    try {
      console.log(`🔍 Ищем квартиры в ${area}...`);
      
      const [avitoResults, cianResults] = await Promise.all([
        this.parseAvito('simferopol'),
        this.parseCian('simferopol')
      ]);
      
      // Объединяем результаты
      const allResults = [...avitoResults, ...cianResults].slice(0, 15);
      
      console.log(`✅ Найдено ${allResults.length} объявлений`);
      return allResults;
      
    } catch (error) {
      console.log('Ошибка поиска:', error);
      return [];
    }
  }
}

module.exports = ApartmentParser;
