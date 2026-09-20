import React, { useState } from 'react';
import { X, Copy, Eye, EyeOff } from 'lucide-react';

const OW_HEROES = ['겐지', '트레이서', '라인하르트', '아나', '루시우', '디바', '윈스턴', '메르시', '캐서디', '솔저: 76', '위도우메이커', '한조', '정크랫', '바티스트', '키리코', '정커퀸', '라이프위버', '일리아리', '마우가', '벤처', '주노'];

export default function RoomModal({ onJoin, onClose, generatedRoomId }) {
  const [nickname, setNickname] = useState('');
  const [showLink, setShowLink] = useState(false);

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

  const roomUrl = generatedRoomId ? `${window.location.origin}/?room=${generatedRoomId}` : '';

  const handleCopyLink = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      alert('초대 링크가 복사되었습니다!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-96 text-center border border-slate-700 relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            title="닫기"
          >
            <X size={28} strokeWidth={2.5} color="white" />
          </button>
        )}

        <h2 className="text-2xl font-bold mb-2 text-white">작전 회의실 접속</h2>
        {generatedRoomId ? (
          <p className="text-slate-400 mb-6 text-sm">닉네임을 설정하고 방을 생성하세요.</p>
        ) : (
          <p className="text-slate-400 mb-6 text-sm">팀원들과 실시간으로 전술을 공유하세요.</p>
        )}
        
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

        {generatedRoomId && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <p className="text-slate-400 text-sm mb-2 text-left">생성된 초대 링크</p>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  readOnly
                  value={roomUrl}
                  className={`w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300 transition-all ${!showLink ? 'blur-[4px] select-none' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowLink(!showLink)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title={showLink ? "숨기기" : "보기"}
                >
                  {showLink ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-white transition-colors"
                title="복사하기"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
