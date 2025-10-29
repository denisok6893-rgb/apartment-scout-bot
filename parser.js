const axios = require('axios');
const cheerio = require('cheerio');

class ApartmentParser {
  
  async parseAvito() {
    try {
      // Временная заглушка - возвращаем тестовые данные
      return [
        {
          title: "Студия, 25 м²",
          price: "22 000 руб/мес",
          address: "Симферополь, центр",
          link: "https://avito.ru",
          source: "Avito"
        },
        {
          title: "1-комн. квартира, 38 м²",
          price: "25 000 руб/мес", 
          address: "Симферополь, ул. Киевская",
          link: "https://avito.ru",
          source: "Avito"
        }
      ];
    } catch (error) {
      console.log('Ошибка Avito:', error.message);
      return this.getMockData();
    }
  }

  async parseCian() {
    try {
      // Временная заглушка
      return [
        {
          title: "2-комн. квартира, 45 м²",
          price: "28 000 руб/мес",
          address: "Симферополь, ж/м Москвой",
          link: "https://cian.ru",
          source: "ЦИАН"
        },
        {
          title: "3-комн. квартира, 65 м²",
          price: "35 000 руб/мес",
          address: "Симферополь, ул. Gagarin",
          link: "https://cian.ru", 
          source: "ЦИАН"
        }
      ];
    } catch (error) {
      console.log('Ошибка ЦИАН:', error.message);
      return this.getMockData();
    }
  }

  getMockData() {
    return [
      {
        title: "Квартира в Симферополе",
        price: "от 20 000 руб/мес",
        address: "Симферополь",
        link: "https://avito.ru",
        source: "Avito"
      }
    ];
  }

  async searchApartments(area = 'симферополь') {
    try {
      console.log(`🔍 Ищем квартиры в ${area}...`);
      
      const [avitoResults, cianResults] = await Promise.all([
        this.parseAvito(),
        this.parseCian()
      ]);
      
      const allResults = [...avitoResults, ...cianResults];
      
      console.log(`✅ Найдено ${allResults.length} объявлений`);
      return allResults;
      
    } catch (error) {
      console.log('Ошибка поиска:', error);
      return this.getMockData();
    }
  }
}

module.exports = ApartmentParser;
