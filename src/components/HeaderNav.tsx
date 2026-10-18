import React from 'react';

interface HeaderNavProps {
  activeView: 'workshop' | 'tenders' | 'research' | 'production' | 'customCaliber';
  hasActiveErrors: boolean;
  isMuted?: boolean;
  debugMode?: boolean;
  onNavigate: (view: 'workshop' | 'tenders' | 'research' | 'production' | 'customCaliber') => void;
  onSubmitToContest: () => void;
  onToggleMute?: () => void;
  onOpenSettings?: () => void;
  onOpenMainMenu?: () => void;
  onOpenCheatPanel?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeView,
  hasActiveErrors,
  isMuted = false,
  debugMode = false,
  onNavigate,
  onSubmitToContest,
  onToggleMute,
  onOpenSettings,
  onOpenMainMenu,
  onOpenCheatPanel,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 lg:gap-8 px-4 lg:px-8 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-lg shadow-slate-950/40">
      {/* Zone 1: Wordmark & Main Menu button */}
      <div className="flex items-center gap-3 shrink-0">
        {onOpenMainMenu && (
          <button
            onClick={onOpenMainMenu}
            title="Выйти в главное меню игры"
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <span>◀</span>
            <span className="hidden sm:inline">Меню</span>
          </button>
        )}

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('workshop');
          }}
          className="text-sm lg:text-base font-bold tracking-tight text-slate-100 whitespace-nowrap flex items-center gap-2"
        >
          <span className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
            КБ
          </span>
          <span className="hidden md:inline font-sans font-extrabold text-slate-100">
            Gunpowder <span className="text-cyan-400 font-mono text-xs font-semibold">v1.7.0</span>
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-3 lg:gap-6 text-xs font-medium text-slate-400 overflow-x-auto py-1">
        <button
          onClick={() => onNavigate('workshop')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
            activeView === 'workshop' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Проектирование
        </button>
        <button
          onClick={() => onNavigate('tenders')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
            activeView === 'tenders' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Госзаказы (ТЗ)
        </button>
        <button
          onClick={() => onNavigate('research')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
            activeView === 'research' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Технологии (НИОКР)
        </button>
        <button
          onClick={() => onNavigate('production')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
            activeView === 'production' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Серия и Завод
        </button>
        <button
          onClick={() => onNavigate('customCaliber')}
          className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
            activeView === 'customCaliber' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Свой калибр
        </button>
      </nav>

      {/* Zone 3: Actions, Settings, Debug, Audio */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Cheat / Debug Panel Trigger Button (Active when code 3689 entered) */}
        {debugMode && onOpenCheatPanel && (
          <button
            type="button"
            onClick={onOpenCheatPanel}
            title="Открыть меню читов и отладки (код 3689)"
            className="px-2.5 py-1.5 rounded-lg border border-amber-500/80 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold animate-pulse flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">ЧИТЫ (3689)</span>
          </button>
        )}

        {/* Audio Mute Toggle */}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors text-xs"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Settings button */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            title="Настройки звука и консоль"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors text-xs"
          >
            ⚙️
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onSubmitToContest}
          className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-md ${
            hasActiveErrors
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900'
              : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-cyan-500/20'
          }`}
        >
          {hasActiveErrors ? 'Исправить дефекты' : 'Подать на конкурс'}
        </button>
      </div>
    </header>
  );
};
