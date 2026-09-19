import React, { useState } from 'react';

const OW_HEROES = ['겐지', '트레이서', '라인하르트', '아나', '루시우', '디바', '윈스턴', '메르시', '캐서디', '솔저: 76', '위도우메이커', '한조', '정크랫', '바티스트', '키리코', '정커퀸', '키리코', '라이프위버', '일리아리', '마우가', '벤처', '주노'];

export default function RoomModal({ onJoin }) {
  const [nickname, setNickname] = useState('');

  const handleRandom = () => {
    const randomHero = OW_HEROES[Math.floor(Math.random() * OW_HEROES.length)];
    onJoin(`익명의 ${randomHero}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname.trim()) {
      onJoin(nickname.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-96 text-center border border-slate-700">
        <h2 className="text-2xl font-bold mb-2 text-white">작전 회의실 접속</h2>
        <p className="text-slate-400 mb-6 text-sm">팀원들과 실시간으로 전술을 공유하세요.</p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-3 text-white mb-4 focus:outline-none focus:border-blue-500"
            placeholder="사용할 닉네임 입력..."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            autoFocus
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors"
          >
            입장하기
          </button>
        </form>
        
        <div className="relative flex items-center py-2 mb-4">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">또는</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button 
          type="button"
          onClick={handleRandom}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
        >
          랜덤 영웅으로 익명 입장
        </button>
      </div>
    </div>
  );
}
