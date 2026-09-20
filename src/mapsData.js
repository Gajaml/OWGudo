export const OW_MAPS_DATA = [
  // --- 현재 빠른대전/경쟁전 활성 맵 ---
  { id: 'aatlis', name: '아틀리스', prefix: 'Aatlis', layers: 5 },
  { id: 'blizzard-world', name: '블리자드 월드' },
  { id: 'busan', name: '부산' },
  { id: 'circuitroyal', name: '서킷 로얄', prefix: 'circuitroyal', layers: 5 },
  { id: 'colosseo', name: '콜로세오', prefix: 'Colosseo', layers: 4 },
  { id: 'dorado', name: '도라도' },
  { id: 'eichenwalde', name: '아이헨발데' },
  { id: 'esperanca', name: '이스페란사', prefix: 'Esperanca', layers: 5 },
  { id: 'havana', name: '하바나' },
  { id: 'hollywood', name: '할리우드' },
  { id: 'ilios', name: '일리오스' },
  { id: 'junkertown', name: '쓰레기촌' },
  { id: 'kings-row', name: '왕의 길' },
  { id: 'lijiang-tower', name: '리장 타워' },
  { id: 'midtown', name: '미드타운', prefix: 'midtown', layers: 4 },
  { id: 'nepal', name: '네팔' },
  { id: 'new-junk-city', name: '뉴 정크 시티', prefix: 'NewJunkCity', layers: 6 },
  { id: 'newqueenstreet', name: '뉴 퀸 스트리트', prefix: 'newqueenstreet', layers: 4 },
  { id: 'numbani', name: '눔바니' },
  { id: 'oasis', name: '오아시스' },
  { id: 'rialto', name: '리알토' },
  { id: 'route-66', name: '66번 국도' },
  { id: 'runasapi', name: '루나사피', prefix: 'Runasapi', layers: 5 },
  { id: 'samoa', name: '사모아' },
  { id: 'suravasa', name: '수라바사', prefix: 'Suravasa', layers: 5 },
  { id: 'watchpoint-gibraltar', name: '감시 기지: 지브롤터' },

  // --- 구분선 ---
  { id: 'divider', name: '--- 구 맵 (점령전 등) ---', isDivider: true },

  // --- 구 맵 ---
  { id: 'hanamura', name: '하나무라' },
  { id: 'horizon-lunar-colony', name: '호라이즌 달 기지' },
  { id: 'paris', name: '파리' },
  { id: 'temple-of-anubis', name: '아누비스 신전' },
  { id: 'volskaya-industries', name: '볼스카야 인더스트리' }
].map(m => m.isDivider ? m : { 
  ...m, 
  file: m.layers ? `${m.prefix}-1.webp` : `${m.id}.jpg`,
  files: m.layers ? Array.from({ length: m.layers }, (_, i) => `${m.prefix}-${i + 1}.webp`) : undefined
});