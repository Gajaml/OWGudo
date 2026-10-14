// 맵 좌표계(논리 크기).
// 영웅 위치·그림 좌표는 원본 미니맵의 픽셀 단위로 저장되어 있다.
// 미니맵 파일은 용량/메모리 절감을 위해 축소본(webp)을 쓰지만,
// 화면에는 이 논리 크기로 늘려 그려서 기존 방 데이터의 좌표가 그대로 맞도록 한다.
// 원본 이미지는 assets-original/minimaps 에 보관되어 있다.
const WIDE = { width: 10000, height: 5000 };   // 축소본 4096x2048
const SQUARE = { width: 5000, height: 5000 };  // 축소본 3500x3500
const LOGICAL_SIZES = {
  'busan': WIDE, 'ilios': WIDE, 'lijiang-tower': WIDE, 'nepal': WIDE, 'oasis': WIDE,
  'blizzard-world': SQUARE, 'eichenwalde': SQUARE, 'hollywood': SQUARE, 'kings-row': SQUARE,
  'numbani': SQUARE, 'dorado': SQUARE, 'havana': SQUARE, 'junkertown': SQUARE, 'rialto': SQUARE,
  'route-66': SQUARE, 'watchpoint-gibraltar': SQUARE, 'hanamura': SQUARE,
  'horizon-lunar-colony': SQUARE, 'paris': SQUARE, 'temple-of-anubis': SQUARE,
  'volskaya-industries': SQUARE,
  // samoa(1000x1686)와 다층 맵은 원본 크기 그대로 사용하므로 지정하지 않음
};

export const OW_MAPS_DATA = [
  // --- 플래시포인트 (Flashpoint) ---
  { id: 'aatlis', name: '아틀리스', prefix: 'Aatlis', layers: 5, mode: '플래시포인트' },
  { id: 'new-junk-city', name: '뉴 정크 시티', prefix: 'NewJunkCity', layers: 6, mode: '플래시포인트' },
  { id: 'suravasa', name: '수라바사', prefix: 'Suravasa', layers: 5, mode: '플래시포인트' },

  // --- 혼합 (Hybrid) ---
  { id: 'blizzard-world', name: '블리자드 월드', mode: '혼합' },
  { id: 'eichenwalde', name: '아이헨발데', mode: '혼합' },
  { id: 'hollywood', name: '할리우드', mode: '혼합' },
  { id: 'kings-row', name: '왕의 길', mode: '혼합' },
  { id: 'midtown', name: '미드타운', prefix: 'midtown', layers: 4, mode: '혼합' },
  { id: 'numbani', name: '눔바니', mode: '혼합' },

  // --- 쟁탈 (Control) ---
  { id: 'busan', name: '부산', mode: '쟁탈' },
  { id: 'ilios', name: '일리오스', mode: '쟁탈' },
  { id: 'lijiang-tower', name: '리장 타워', mode: '쟁탈' },
  { id: 'nepal', name: '네팔', mode: '쟁탈' },
  { id: 'oasis', name: '오아시스', mode: '쟁탈' },
  { id: 'samoa', name: '사모아', mode: '쟁탈' },

  // --- 호위 (Escort) ---
  { id: 'circuitroyal', name: '서킷 로얄', prefix: 'circuitroyal', layers: 5, mode: '호위' },
  { id: 'dorado', name: '도라도', mode: '호위' },
  { id: 'havana', name: '하바나', mode: '호위' },
  { id: 'junkertown', name: '쓰레기촌', mode: '호위' },
  { id: 'rialto', name: '리알토', mode: '호위' },
  { id: 'route-66', name: '66번 국도', mode: '호위' },
  { id: 'watchpoint-gibraltar', name: '감시 기지: 지브롤터', mode: '호위' },

  // --- 밀기 (Push) ---
  { id: 'colosseo', name: '콜로세오', prefix: 'Colosseo', layers: 4, mode: '밀기' },
  { id: 'esperanca', name: '이스페란사', prefix: 'Esperanca', layers: 5, mode: '밀기' },
  { id: 'newqueenstreet', name: '뉴 퀸 스트리트', prefix: 'newqueenstreet', layers: 4, mode: '밀기' },
  { id: 'runasapi', name: '루나사피', prefix: 'Runasapi', layers: 5, mode: '밀기' },

  // --- 점령 (Assault / Legacy) ---
  { id: 'hanamura', name: '하나무라', mode: '점령 (구 맵)' },
  { id: 'horizon-lunar-colony', name: '호라이즌 달 기지', mode: '점령 (구 맵)' },
  { id: 'paris', name: '파리', mode: '점령 (구 맵)' },
  { id: 'temple-of-anubis', name: '아누비스 신전', mode: '점령 (구 맵)' },
  { id: 'volskaya-industries', name: '볼스카야 인더스트리', mode: '점령 (구 맵)' }
].map(m => ({ 
  ...m, 
  file: m.layers ? `${m.prefix}-1.webp` : `${m.id}.webp`,
  files: m.layers ? Array.from({ length: m.layers }, (_, i) => `${m.prefix}-${i + 1}.webp`) : undefined,
  logicalSize: LOGICAL_SIZES[m.id]
}));