import { Sim } from '@dooboostore/simple-boot';
import {ConstructorType} from "@dooboostore/core";

export interface LocalEvent {
  id: string;
  title: string;
  location: string;
  category: string;
  date: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export namespace EventService {
  export const SYMBOL = Symbol.for('EventService');
}

export interface EventService {
  getAllEvents(): LocalEvent[];
  getEventById(id: string): LocalEvent | undefined;
  getEventsByLocation(location: string): LocalEvent[];
}

export default (container: symbol): ConstructorType<EventService> => {
  @Sim({ symbol: EventService.SYMBOL, container: container })
  class EventServiceImp implements EventService {
    private events: LocalEvent[] = [
      {
        id: 'e1',
        title: '제주 유채꽃 축제',
        location: '제주',
        category: '축제',
        date: '2024.04.01 - 04.15',
        description: '끝없이 펼쳐진 노란 유채꽃 물결 속에서 봄의 정취를 만끽하세요.',
        imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        tags: ['봄', '가족여행', '사진명당']
      },
      {
        id: 'e2',
        title: '서울 야간 궁궐 투어',
        location: '서울',
        category: '문화',
        date: '2024.04.10 - 05.31',
        description: '달빛 아래 고즈넉한 고궁의 아름다움을 전문가의 해설과 함께 즐기세요.',
        imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800',
        tags: ['데이트', '문화유산', '야경']
      },
      {
        id: 'e3',
        title: '강원 별 헤는 밤 글램핑 데이',
        location: '강원',
        category: '캠핑/아웃도어',
        date: '2024.05.01 - 05.05',
        description: '청정 강원의 맑은 하늘에서 쏟아지는 별을 보며 즐기는 감성 글램핑 파티.',
        imageUrl: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=800',
        tags: ['힐링', '별구경', '친구와함께']
      },
      {
        id: 'e4',
        title: '알프스 스노우 재즈 페스티벌',
        location: '알프스',
        category: '음악',
        date: '2024.03.15 - 03.22',
        description: '설원 위에서 펼쳐지는 환상적인 재즈 선율. 스키와 음악을 동시에 즐기세요.',
        imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
        tags: ['재즈', '겨울스포츠', '럭셔리']
      },
      {
        id: 'e5',
        title: '발리 선셋 요가 리트릿',
        location: '발리',
        category: '웰니스',
        date: '상시 운영',
        description: '우붓의 정글 위로 지는 노을을 바라보며 몸과 마음을 정화하는 명상의 시간.',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        tags: ['요가', '명상', '정글뷰']
      },
      {
        id: 'e6',
        title: '산토리니 와인 테이스팅 투어',
        location: '산토리니',
        category: '미식',
        date: '매주 주말',
        description: '화산 토양에서 자란 독특한 산토리니 와인을 칼데라 뷰와 함께 맛보세요.',
        imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
        tags: ['와인', '로맨틱', '석양']
      },
      {
        id: 'e7',
        title: '사하라 베두인 전통 체험',
        location: '사하라',
        category: '전통 문화',
        date: '상시 운영',
        description: '모닥불 앞에 둘러앉아 베두인의 전통 음악과 차 문화를 직접 경험해보세요.',
        imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800',
        tags: ['전통', '사막체험', '에스닉']
      }
    ];

    getAllEvents() {
      return this.events;
    }

    getEventById(id: string) {
      return this.events.find(e => e.id === id);
    }

    getEventsByLocation(location: string) {
      return this.events.filter(e => location.includes(e.location) || e.location.includes(location));
    }
  }
  return EventServiceImp;
}

