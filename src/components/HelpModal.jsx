import React, { useState, useEffect } from 'react';

export default function HelpModal({ isOpen, onClose }) {
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const handleClose = () => {
    if (doNotShowAgain) {
      localStorage.setItem('hideHelpModal', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span className="text-2xl">👋</span> 환영합니다!
        </h2>
        
        <p className="text-slate-300 mb-6 text-sm leading-relaxed">
          오버워치 구도(OWGudo) 뷰어에 오신 것을 환영합니다.<br/>
          아래 3단계로 쉽게 구도를 만들어보세요!
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">맵 선택 (상단 바)</h3>
              <p className="text-xs text-slate-400">화면 좌상단의 맵 목록에서 원하는 배경 맵을 고르세요.</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-red-500/20 text-red-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">영웅 배치 (우측 패널)</h3>
              <p className="text-xs text-slate-400">우측 팀 슬롯을 클릭하여 영웅을 골라 팀에 배치하세요.</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">화면 그리기 (중앙)</h3>
              <p className="text-xs text-slate-400">영웅을 드래그하여 움직이거나, 좌측 툴바의 펜 툴로 전술을 그려보세요.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
            />
            다시 보지 않기
          </label>
          
          <button 
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded font-medium transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
