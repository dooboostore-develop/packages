import { Runnable } from '@dooboostore/core/runs/Runnable';
import { IOS3166_1_Code, IOS3166_1_CodeDescription } from '@dooboostore/core/code/IOS3166_1';

export class CodeExample implements Runnable {
  run(): void {
    console.log('\n=== Code Example (ISO 3166-1 Country Codes) ===\n');
    
    // Basic country code usage
    console.log('1. Basic Country Code Usage:');
    const koreaCode = IOS3166_1_Code.KOR;
    const koreaInfo = IOS3166_1_CodeDescription[koreaCode];
    console.log('  Korea Code:', koreaCode);
    console.log('  Korea Info:', koreaInfo);
    console.log(`  Display: ${koreaInfo.data.emoji} ${koreaInfo.data.ko} (${koreaInfo.data.en})`);
    
    // Multiple country examples
    console.log('\n2. Multiple Country Examples:');
    const countries = [
      IOS3166_1_Code.USA,
      IOS3166_1_Code.JPN,
      IOS3166_1_Code.CHN,
      IOS3166_1_Code.DEU,
      IOS3166_1_Code.GBR
    ];
    
    countries.forEach(code => {
      const info = IOS3166_1_CodeDescription[code];
      console.log(`  ${info.data.emoji} ${info.data.alpha2}/${info.data.alpha3} - ${info.data.ko} (${info.data.en})`);
    });
    
    // Search by alpha2 code
    console.log('\n3. Search by Alpha2 Code:');
    const searchAlpha2 = (alpha2: string) => {
      return Object.entries(IOS3166_1_CodeDescription)
        .find(([_, info]) => info.data.alpha2 === alpha2);
    };
    
    const krInfo = searchAlpha2('KR');
    if (krInfo) {
      console.log('  Found by alpha2 "KR":', krInfo[1].data.ko);
    }
    
    const usInfo = searchAlpha2('US');
    if (usInfo) {
      console.log('  Found by alpha2 "US":', usInfo[1].data.ko);
    }
    
    // Search by alpha3 code
    console.log('\n4. Search by Alpha3 Code:');
    const searchAlpha3 = (alpha3: string) => {
      return Object.entries(IOS3166_1_CodeDescription)
        .find(([_, info]) => info.data.alpha3 === alpha3);
    };
    
    const jpnInfo = searchAlpha3('JPN');
    if (jpnInfo) {
      console.log('  Found by alpha3 "JPN":', jpnInfo[1].data.ko);
    }
    
    // Search by country name (Korean)
    console.log('\n5. Search by Country Name (Korean):');
    const searchByKoreanName = (koreanName: string) => {
      return Object.entries(IOS3166_1_CodeDescription)
        .find(([_, info]) => info.data.ko === koreanName);
    };
    
    const chinaInfo = searchByKoreanName('중국');
    if (chinaInfo) {
      console.log('  Found by Korean name "중국":', chinaInfo[1].data.en);
    }
    
    // Search by country name (English)
    console.log('\n6. Search by Country Name (English):');
    const searchByEnglishName = (englishName: string) => {
      return Object.entries(IOS3166_1_CodeDescription)
        .find(([_, info]) => info.data.en === englishName);
    };
    
    const germanyInfo = searchByEnglishName('Germany');
    if (germanyInfo) {
      console.log('  Found by English name "Germany":', germanyInfo[1].data.ko);
    }
    
    // Get all countries in a region (example: European countries)
    console.log('\n7. European Countries Example:');
    const europeanCountries = [
      IOS3166_1_Code.DEU, // Germany
      IOS3166_1_Code.FRA, // France
      IOS3166_1_Code.GBR, // United Kingdom
      IOS3166_1_Code.ITA, // Italy
      IOS3166_1_Code.ESP, // Spain
      IOS3166_1_Code.NLD, // Netherlands
      IOS3166_1_Code.SWE, // Sweden
      IOS3166_1_Code.NOR, // Norway
      IOS3166_1_Code.DNK, // Denmark
      IOS3166_1_Code.FIN  // Finland
    ];
    
    console.log('  European Countries:');
    europeanCountries.forEach(code => {
      const info = IOS3166_1_CodeDescription[code];
      console.log(`    ${info.data.emoji} ${info.data.alpha2} - ${info.data.ko}`);
    });
    
    // Get all countries with specific numeric code range
    console.log('\n8. Countries with Numeric Code 200-300:');
    const countriesInRange = Object.entries(IOS3166_1_CodeDescription)
      .filter(([_, info]) => info.data.num >= 200 && info.data.num < 300)
      .sort((a, b) => a[1].data.num - b[1].data.num);
    
    console.log('  Countries with numeric code 200-299:');
    countriesInRange.forEach(([code, info]) => {
      console.log(`    ${info.data.num}: ${info.data.emoji} ${info.data.alpha2} - ${info.data.ko}`);
    });
    
    // Create a country selector function
    console.log('\n9. Country Selector Function:');
    const getCountryInfo = (identifier: string) => {
      // Try to find by alpha2, alpha3, or name
      const byAlpha2 = searchAlpha2(identifier.toUpperCase());
      if (byAlpha2) return byAlpha2[1];
      
      const byAlpha3 = searchAlpha3(identifier.toUpperCase());
      if (byAlpha3) return byAlpha3[1];
      
      const byKoreanName = searchByKoreanName(identifier);
      if (byKoreanName) return byKoreanName[1];
      
      const byEnglishName = searchByEnglishName(identifier);
      if (byEnglishName) return byEnglishName[1];
      
      return null;
    };
    
    const testIdentifiers = ['KR', 'USA', '일본', 'France', 'DE'];
    testIdentifiers.forEach(identifier => {
      const info = getCountryInfo(identifier);
      if (info) {
        console.log(`  "${identifier}" -> ${info.data.emoji} ${info.data.ko} (${info.data.en})`);
      } else {
        console.log(`  "${identifier}" -> Not found`);
      }
    });
    
    // Get country flag image URL
    console.log('\n10. Country Flag Images:');
    const flagCountries = [IOS3166_1_Code.KOR, IOS3166_1_Code.USA, IOS3166_1_Code.JPN];
    flagCountries.forEach(code => {
      const info = IOS3166_1_CodeDescription[code];
      console.log(`  ${info.data.ko}: ${info.data.img}`);
    });
    
    console.log('\n=========================\n');
  }
}