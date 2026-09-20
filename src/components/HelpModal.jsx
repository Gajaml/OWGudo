import React, { useState, useEffect } from 'react';

export default function HelpModal({ isOpen, onClose, hideToolPopovers, onToggleToolPopovers }) {
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDoNotShowAgain(localStorage.getItem('hideHelpModal') === 'true');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (doNotShowAgain) {
      localStorage.setItem('hideHelpModal', 'true');
    } else {
      localStorage.removeItem('hideHelpModal');
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
          오버워치 구도(OWGudo) 메이커에 오신 것을 환영합니다.<br/>
          아래 단축키와 조작법으로 쉽게 구도를 만들어보세요!
        </p>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">마우스 우클릭, 휠로 맵 이동</h3>
              <p className="text-xs text-slate-400">화면 빈 공간을 우클릭한 채 드래그하거나, 휠을 굴려 맵 시점을 이동/확대할 수 있습니다.</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-red-500/20 text-red-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">Q, W, E, R, T로 그림 도구 사용</h3>
              <p className="text-xs text-slate-400">단축키를 눌러 좌측 툴바의 도구(선택, 펜, 사각형, 원형, 지우개)를 빠르게 전환합니다.</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">랜덤 배치, 조합 입력, 중앙 이동</h3>
              <p className="text-xs text-slate-400">우상단 메뉴의 기능들을 활용해 복잡한 영웅 조합과 구도를 단번에 배치할 수 있습니다.</p>
            </div>
          </div>
          <div className="flex gap-3 bg-slate-700/50 p-3 rounded-md border border-slate-600/50">
            <div className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm mb-1">1~0 숫자 키로 영웅 선택/이동</h3>
              <p className="text-xs text-slate-400">1~5(블루), 6~0(레드) 키를 눌러 영웅을 즉시 선택하고 마우스로 위치를 옮길 수 있습니다.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6 p-3 bg-slate-900/50 rounded-md border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 mb-1">설정</h3>
          <label className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 w-4 h-4 accent-blue-500"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
            />
            이 시작 가이드 창 다시 보지 않기
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 w-4 h-4 accent-blue-500"
              checked={hideToolPopovers}
              onChange={(e) => onToggleToolPopovers(e.target.checked)}
            />
            좌측 툴바 도구 설명 다시 보지 않기
          </label>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded font-medium transition-colors"
          >
            확인 및 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
