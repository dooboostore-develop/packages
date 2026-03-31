import { Sim } from '@dooboostore/simple-boot';
import {ConstructorType} from "@dooboostore/core";

export interface Review {
  id: string;
  userName: string;
  userImage?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Accommodation {
  id: string;
  name: string;
  category: 'beach' | 'mountain' | 'city' | 'pool' | 'camping';
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  lat: number;
  lng: number;
  amenities: string[];
  hostName: string;
  reviews: Review[];
  floorPlanImage?: string;
}

export namespace AccommodationService {
  export const SYMBOL = Symbol.for('AccommodationService');
}

export interface AccommodationService {
  getAccommodations(category?: string): Accommodation[];
  getById(id: string | undefined): Accommodation | undefined;
}

export default (container: symbol): ConstructorType<AccommodationService> => {
  @Sim({ symbol: AccommodationService.SYMBOL, container: container })
  class AccommodationServiceImp implements AccommodationService {
    private data: Accommodation[] = [
      {
        id: '1',
        name: '제주 에메랄드 베이 빌라',
        category: 'beach',
        price: 450000,
        rating: 4.92,
        reviewCount: 245,
        description: '함덕 해변이 한눈에 보이는 프라이빗 풀빌라입니다. 파도 소리와 함께 아침을 맞이하세요.',
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80', 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80'],
        lat: 33.543,
        lng: 126.668,
        amenities: ['무선 인터넷', '주방', '수영장', '무료 주차', '바다전망'],
        hostName: '민수',
        reviews: [
          { id: 'r1', userName: '김철수', date: '2024년 3월', rating: 5, comment: '정말 환상적인 뷰였습니다! 다시 꼭 방문하고 싶어요.' },
          { id: 'r2', userName: '이영희', date: '2024년 2월', rating: 4.8, comment: '침구가 아주 청결하고 호스트님이 친절하십니다.' }
        ],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '2',
        name: '어반 스카이 펜트하우스 서울',
        category: 'city',
        price: 380000,
        rating: 4.85,
        reviewCount: 156,
        description: '강남 중심가에 위치한 최고급 펜트하우스입니다. 환상적인 시티뷰와 야경을 제공합니다.',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80'],
        lat: 37.511,
        lng: 127.059,
        amenities: ['피트니스 센터', '워크스테이션', '넷플릭스', '세탁기', '건조기'],
        hostName: '지혜',
        reviews: [{ id: 'r4', userName: 'David', date: '2024년 3월', rating: 5, comment: 'The view is breathtaking. Best place in Gangnam!' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '3',
        name: '포레스트 힐 럭셔리 글램핑',
        category: 'camping',
        price: 220000,
        rating: 4.78,
        reviewCount: 92,
        description: '강원도 숲속에서 즐기는 럭셔리한 캠핑 경험. 바비큐와 별 구경을 동시에 즐기세요.',
        images: ['https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80', 'https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?w=1200&q=80', 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=1200&q=80', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80'],
        lat: 37.751,
        lng: 128.876,
        amenities: ['개별 바비큐', '난방 시스템', '캠핑용품 완비', '샤워실'],
        hostName: '정훈',
        reviews: [{ id: 'r6', userName: '강백호', date: '2024년 3월', rating: 4.9, comment: '밤에 별이 정말 많이 보여요.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '4',
        name: '알프스 마운틴 하이드어웨이',
        category: 'mountain',
        price: 520000,
        rating: 4.98,
        reviewCount: 310,
        description: '산 정상 부근에 위치한 아늑한 통나무집입니다.',
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200&q=80', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=1200&q=80', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
        lat: 46.8182,
        lng: 8.2275,
        amenities: ['벽난로', '야외 사우나', '조식 제공'],
        hostName: 'Sarah',
        reviews: [{ id: 'r7', userName: '김설산', date: '2024년 2월', rating: 5, comment: '동화 속 한 장면 같아요.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '5',
        name: '트로피컬 인피니티 풀 빌라',
        category: 'pool',
        price: 680000,
        rating: 4.95,
        reviewCount: 420,
        description: '몰디브의 투명한 바다 위에서 잊지 못할 추억을 만드세요.',
        images: ['https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?w=1200&q=80', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80'],
        lat: 3.2028,
        lng: 73.2207,
        amenities: ['인피니티 풀', '스파 센터', '개별 집사 서비스'],
        hostName: 'Ahmed',
        reviews: [{ id: 'r8', userName: '바다사랑', date: '2024년 3월', rating: 5, comment: '인생 최고의 휴양지입니다.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '6',
        name: '산토리니 블루 돔 스튜디오',
        category: 'beach',
        price: 550000,
        rating: 4.89,
        reviewCount: 185,
        description: '산토리니 이아 마을에 위치한 정통 돔 형태의 숙소입니다.',
        images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80', 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=1200&q=80'],
        lat: 36.4618,
        lng: 25.3753,
        amenities: ['전용 테라스', '자쿠지', '에어컨'],
        hostName: 'Elena',
        reviews: [{ id: 'r9', userName: '산토리', date: '2024년 1월', rating: 4.7, comment: '뷰가 정말 예술입니다.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '7',
        name: '교토 전통 젠 하우스',
        category: 'city',
        price: 290000,
        rating: 4.96,
        reviewCount: 78,
        description: '100년 전통의 가옥을 현대적으로 리모델링한 교토의 마치야입니다.',
        images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=1200&q=80', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=80', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80', 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1200&q=80'],
        lat: 35.0116,
        lng: 135.7681,
        amenities: ['다실', '전통 정원', '히노끼 욕조'],
        hostName: 'Kenji',
        reviews: [{ id: 'r10', userName: '교토덕후', date: '2024년 2월', rating: 5, comment: '정말 조용하고 분위기 좋아요.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '8',
        name: '사하라 데저트 럭셔리 캠프',
        category: 'camping',
        price: 260000,
        rating: 4.82,
        reviewCount: 54,
        description: '광활한 사막 한가운데서 즐기는 5성급 캠핑입니다.',
        images: ['https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1200&q=80', 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=80', 'https://images.unsplash.com/photo-1505051508008-923feaf90180?w=1200&q=80', 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=1200&q=80', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'],
        lat: 31.1311,
        lng: -3.9897,
        amenities: ['사막 투어', '전통 조식', '낙타 타기'],
        hostName: 'Youssef',
        reviews: [{ id: 'r11', userName: '사막맨', date: '2024년 3월', rating: 4.8, comment: '별이 쏟아지는 밤을 경험했습니다.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },

      {
        id: '9',
        name: '노르딕 포레스트 캐빈',
        category: 'mountain',
        price: 340000,
        rating: 4.94,
        reviewCount: 112,
        description: '노르웨이의 깊은 숲속 오로라 캐빈입니다.',
        images: ['https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', 'https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?w=1200&q=80', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80'],
        lat: 60.472,
        lng: 8.4689,
        amenities: ['벽난로', '전망용 데크', '무선 인터넷'],
        hostName: 'Lars',
        reviews: [{ id: 'r12', userName: '오로라헌터', date: '2024년 1월', rating: 5, comment: '창밖으로 오로라를 봤어요!' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      },
      {
        id: '10',
        name: '발리 우드 앤 워터 풀빌라',
        category: 'pool',
        price: 480000,
        rating: 4.97,
        reviewCount: 305,
        description: '우붓의 정글 속에 자리 잡은 예술적인 풀빌라입니다.',
        images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80', 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80'],
        lat: -8.5069,
        lng: 115.2625,
        amenities: ['플로팅 조식', '정글 전망', '수영장'],
        hostName: 'Putu',
        reviews: [{ id: 'r13', userName: '발리홀릭', date: '2024년 2월', rating: 5, comment: '진정한 힐링이었습니다.' }],
        floorPlanImage: 'https://magnicad.com/data/file/cad/thumb-2094581023_69pfYzkt_242940afa2e23bb07e7facd551c07406f2b70bc4_600x600.jpg'
      }
    ];

    getAccommodations(category?: string) {
      return category ? this.data.filter(a => a.category === category) : this.data;
    }

    getById(id: string | undefined) {
      return this.data.find(a => a.id === id);
    }
  }
  return AccommodationServiceImp;
}

