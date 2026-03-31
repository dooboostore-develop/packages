import { Sim } from '@dooboostore/simple-boot';
import {ConstructorType} from "@dooboostore/core";

export interface Stock {
  id: string;
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
  description: string;
  marketCap: string;
  volume: string;
  history: number[]; // Simple data for mini chart
}

export namespace StockService {
  export const SYMBOL = Symbol.for('StockService');
}

export interface StockService {
  getStocks(): Stock[];
  getRisingStocks(): Stock[];
  getFallingStocks(): Stock[];
  getStocksByCategory(category: string): Stock[];
  getStockById(id: string): Stock | undefined;
  getCategories(): string[];
}

export default (container: symbol): ConstructorType<StockService> => {
  @Sim({ symbol: StockService.SYMBOL, container: container })
  class StockServiceImp implements StockService {
    private stocks: Stock[] = [
      {
        id: '1',
        name: '삼성전자',
        code: '005930',
        price: 72500,
        change: 1200,
        changePercent: 1.68,
        category: '반도체',
        description: '글로벌 IT 및 반도체 선도 기업입니다.',
        marketCap: '432조',
        volume: '1,200만',
        history: [71000, 71500, 72000, 71800, 72500]
      },
      {
        id: '2',
        name: 'SK하이닉스',
        code: '000660',
        price: 128400,
        change: 3500,
        changePercent: 2.8,
        category: '반도체',
        description: '메모리 반도체 전문 글로벌 기업입니다.',
        marketCap: '93조',
        volume: '500만',
        history: [120000, 122000, 125000, 124000, 128400]
      },
      {
        id: '3',
        name: '네이버',
        code: '035420',
        price: 204500,
        change: -2500,
        changePercent: -1.21,
        category: 'IT서비스',
        description: '국내 최대 검색 플랫폼 및 IT 서비스 기업입니다.',
        marketCap: '33조',
        volume: '80만',
        history: [210000, 208000, 206000, 207000, 204500]
      },
      {
        id: '4',
        name: '카카오',
        code: '035720',
        price: 48900,
        change: -800,
        changePercent: -1.61,
        category: 'IT서비스',
        description: '메신저 기반의 종합 생활 플랫폼 기업입니다.',
        marketCap: '21조',
        volume: '150만',
        history: [50000, 49500, 49000, 49200, 48900]
      },
      {
        id: '5',
        name: '에코프로비엠',
        code: '247540',
        price: 285000,
        change: 15500,
        changePercent: 5.75,
        category: '2차전지',
        description: '하이니켈 양극재 전문 제조 기업입니다.',
        marketCap: '27조',
        volume: '200만',
        history: [260000, 265000, 275000, 270000, 285000]
      },
      {
        id: '6',
        name: '현대차',
        code: '005380',
        price: 198000,
        change: 4200,
        changePercent: 2.17,
        category: '자동차',
        description: '글로벌 완성차 제조 및 모빌리티 기업입니다.',
        marketCap: '41조',
        volume: '60만',
        history: [190000, 192000, 195000, 194000, 198000]
      }
    ];

    getStocks() {
      return this.stocks;
    }

    getRisingStocks() {
      return this.stocks.filter(s => s.change > 0).sort((a, b) => b.changePercent - a.changePercent);
    }

    getFallingStocks() {
      return this.stocks.filter(s => s.change < 0).sort((a, b) => a.changePercent - b.changePercent);
    }

    getStocksByCategory(category: string) {
      return this.stocks.filter(s => s.category === category);
    }

    getStockById(id: string) {
      return this.stocks.find(s => s.id === id);
    }

    getCategories() {
      return Array.from(new Set(this.stocks.map(s => s.category)));
    }
  }
  return StockServiceImp;
}

