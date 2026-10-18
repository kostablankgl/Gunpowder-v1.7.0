import React, { useMemo } from 'react';
import { WeaponSlots, WeaponLayout, DerivedStats, ValidationIssue } from '../types';

interface BlueprintCanvasProps {
  slots: WeaponSlots;
  layout: WeaponLayout;
  derived: DerivedStats;
  activeSlot: keyof WeaponSlots | null;
  onSelectSlot: (slot: keyof WeaponSlots) => void;
  issues: ValidationIssue[];
  onOpenFiringRange?: () => void;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({
  slots,
  layout,
  derived,
  activeSlot,
  onSelectSlot,
  issues,
  onOpenFiringRange,
}) => {
  const {
    cartridge,
    barrel,
    action,
    receiver,
    magazine,
    trigger,
    stock,
    topInterface,
    handguard,
    muzzleDevice,
    topAttachment,
    lowerAttachment,
  } = slots;

  // Error mappings per slot
  const issuesBySlot = useMemo(() => {
    const map: Record<string, 'error' | 'warning'> = {};
    issues.forEach((iss) => {
      if (iss.affectedSlot) {
        if (!map[iss.affectedSlot] || iss.type === 'error') {
          map[iss.affectedSlot] = iss.type;
        }
      }
    });
    return map;
  }, [issues]);

  // Dynamic Geometry Calculations
  const isBullpup = layout === 'bullpup';

  // Barrel scaling: 180mm to 650mm mapped to 120px to 410px
  const barrelPixLen = Math.max(110, Math.min(410, barrel.length * 0.58));
  const barrelThickness =
    barrel.profile === 'heavy' ? 14 : barrel.profile === 'medium' ? 10 : 7;

  // Receiver anchor points
  const receiverWidth = Math.max(160, Math.min(250, (receiver.length || 320) * 0.62));
  const receiverHeight = 56;
  const receiverX = isBullpup ? 320 : 430;
  const receiverY = 185;

  // Barrel position
  const barrelX = receiverX + receiverWidth - 12;
  const barrelY = receiverY + 16;

  // Stock length and position
  const stockLenPix = Math.max(85, Math.min(190, (stock.length || 300) * 0.48));
  const stockX = isBullpup ? receiverX - 28 : receiverX - stockLenPix;
  const stockY = receiverY + (isBullpup ? 6 : 8);

  // Grip and Trigger position
  const gripX = isBullpup ? receiverX + 75 : receiverX + 38;
  const gripY = receiverY + receiverHeight;
  const triggerX = gripX + 16;

  // Magazine position & geometry
  const magX = isBullpup ? receiverX + 18 : receiverX + receiverWidth - 85;
  const magY = receiverY + receiverHeight - 4;

  const magWidth =
    cartridge.class === 'pistol'
      ? 24
      : cartridge.class === 'rifle'
      ? 36
      : 30;

  const magHeight =
    magazine.type === 'drum'
      ? 75
      : Math.min(130, Math.max(45, magazine.capacity * 2.9));

  // Handguard length and position
  const handguardLenPix = Math.min(
    barrelPixLen - 30,
    Math.max(90, handguard.length * 0.52)
  );
  const handguardX = barrelX + 4;
  const handguardY = barrelY - 7;
  const handguardHeight = 34;

  // Top Interface position
  const railX = receiverX + 8;
  const railY = receiverY - (topInterface.height ? 10 : 6);
  const railWidth = receiverWidth + 32;

  // Muzzle device position
  const muzzleX = barrelX + barrelPixLen;
  const muzzleY = barrelY - (muzzleDevice.type === 'suppressor' ? 10 : 4);
  const muzzleWidth =
    muzzleDevice.type === 'suppressor'
      ? 74
      : muzzleDevice.type !== 'none'
      ? 26
      : 0;
  const muzzleHeight =
    muzzleDevice.type === 'suppressor' ? 28 : barrelThickness + 8;

  // Dynamic Auto-Centering and Zoom-to-fit Geometry Calculations
  const weaponLeftX = isBullpup ? receiverX - 35 : stockX;
  const weaponRightX = muzzleX + muzzleWidth;
  const currentSpan = Math.max(200, weaponRightX - weaponLeftX);
  const currentMidX = (weaponLeftX + weaponRightX) / 2;

  // Align weapon center around X = 470, Y = 205 (giving breathing room for margins and GOST stamp)
  const targetX = 470;
  const targetY = 205;
  const maxSafeWidth = 740;
  const fitScale = currentSpan > maxSafeWidth ? Math.max(0.62, maxSafeWidth / currentSpan) : 1.0;
  const transX = targetX - currentMidX * fitScale;
  const transY = targetY - 210 * fitScale;

  const slotHighlight = (slotName: keyof WeaponSlots) => {
    const isSelected = activeSlot === slotName;
    const issue = issuesBySlot[slotName];

    let strokeColor = '#38bdf8'; // cyan-400
    let fillColor = 'rgba(56, 189, 248, 0.08)';

    if (issue === 'error') {
      strokeColor = '#f43f5e'; // rose-500
      fillColor = 'rgba(244, 63, 94, 0.18)';
    } else if (issue === 'warning') {
      strokeColor = '#fbbf24'; // amber-400
      fillColor = 'rgba(251, 191, 36, 0.14)';
    } else if (isSelected) {
      strokeColor = '#06b6d4'; // cyan-500
      fillColor = 'rgba(6, 182, 212, 0.25)';
    }

    return {
      stroke: strokeColor,
      fill: fillColor,
      cursor: 'pointer',
      strokeWidth: isSelected ? 2.5 : 1.5,
    };
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-cyan-950/80 bg-slate-950 blueprint-grid shadow-2xl">
      {/* Top Blueprint Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-900/40 bg-slate-950/85 px-4 py-2.5 backdrop-blur-sm gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono">
            Чертёжная схема КБ
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-slate-300">
            {isBullpup ? 'Компоновка Bullpup' : 'Классическая компоновка'}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-cyan-300">
            Калибр: {cartridge.name}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-slate-400">
            {receiver.method === 'stamped'
              ? 'Штампованная коробка'
              : receiver.method === 'milled'
              ? 'Фрезерованная коробка'
              : 'Полимерный ресивер'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            Габарит:{' '}
            <span className="font-semibold text-slate-200">
              {derived.overallLength} мм
            </span>
          </div>
          <div>
            Ствол:{' '}
            <span className="font-semibold text-slate-200">
              {barrel.length} мм
            </span>
          </div>
          <div>
            Масса:{' '}
            <span className="font-semibold text-slate-200">
              {derived.weaponMass} кг
            </span>
          </div>
          {onOpenFiringRange && (
            <button
              type="button"
              onClick={onOpenFiringRange}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-cyan-600/30 text-cyan-200 border border-cyan-500/50 hover:bg-cyan-600/50 hover:text-white transition-colors"
            >
              <span>🎯</span>
              <span>Тестовый отстрел 100м</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Blueprint Canvas Viewport */}
      <div className="relative w-full aspect-[21/9] min-h-[360px] max-h-[480px] bg-slate-950 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 1000 420"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Blueprint Grid pattern */}
            <pattern id="fineGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="0.8" />
            </pattern>
            <pattern id="diagHatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M-1,1 l2,-2 M0,8 l8,-8 M7,9 l2,-2" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
            </pattern>
            <pattern id="woodHatch" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0,2 Q 6,6 12,2 M 0,8 Q 6,12 12,8" stroke="#ca8a04" strokeWidth="0.9" fill="none" opacity="0.45" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Background fine grid overlay */}
          <rect width="1000" height="420" fill="url(#fineGrid)" />

          {/* DYNAMIC AUTO-CENTERED & AUTO-SCALED WEAPON ASSEMBLY */}
          <g transform={`translate(${transX}, ${transY}) scale(${fitScale})`}>
            {/* Reference Centerline Axis */}
            <line
              x1="20"
              y1={barrelY + barrelThickness / 2}
              x2="980"
              y2={barrelY + barrelThickness / 2}
              stroke="rgba(56, 189, 248, 0.22)"
              strokeDasharray="12 4 3 4"
              strokeWidth="1"
            />

            {/* ======================================================== */}
            {/* 1. STOCK / BUTTPAD (ПРИКЛАД) */}
            {/* ======================================================== */}
          <g onClick={() => onSelectSlot('stock')} {...slotHighlight('stock')}>
            {isBullpup ? (
              // Bullpup rear buttpad mounted directly onto receiver rear
              <g>
                <path
                  d={`M ${receiverX - 26} ${receiverY + 4} 
                      L ${receiverX} ${receiverY + 4} 
                      L ${receiverX} ${receiverY + receiverHeight + 14} 
                      L ${receiverX - 22} ${receiverY + receiverHeight + 14} 
                      Q ${receiverX - 32} ${receiverY + receiverHeight / 2} ${receiverX - 26} ${receiverY + 4} Z`}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Rubber buttpad corrugated tread */}
                <line x1={receiverX - 28} y1={receiverY + 15} x2={receiverX - 28} y2={receiverY + receiverHeight + 5} stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="2" />
                {/* Top Cheek Rest pad for Bullpup */}
                <rect x={receiverX} y={receiverY - 8} width="85" height="10" rx="3" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.5" />
              </g>
            ) : stock.type === 'fixedWood' ? (
              // Classic contoured Wooden Stock with grain and sling swivel
              <g>
                <path
                  d={`M ${stockX} ${stockY + 12} 
                      Q ${stockX + 45} ${stockY + 8} ${receiverX} ${receiverY + 12}
                      L ${receiverX} ${receiverY + receiverHeight - 6}
                      L ${stockX + 55} ${stockY + 68}
                      L ${stockX} ${stockY + 88}
                      Q ${stockX - 12} ${stockY + 48} ${stockX} ${stockY + 12} Z`}
                  fill="url(#woodHatch)"
                  stroke="#ca8a04"
                  strokeWidth="2"
                />
                {/* Buttplate screws and metallic buttplate */}
                <line x1={stockX} y1={stockY + 12} x2={stockX} y2={stockY + 88} stroke="#94a3b8" strokeWidth="4" />
                <circle cx={stockX + 5} cy={stockY + 28} r="2" fill="#e2e8f0" />
                <circle cx={stockX + 5} cy={stockY + 70} r="2" fill="#e2e8f0" />
                {/* Sling swivel loop under buttstock */}
                <ellipse cx={stockX + 40} cy={stockY + 76} rx="6" ry="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            ) : stock.type === 'folding' ? (
              // Skeleton / Wire Folding Stock with pivot knuckle
              <g>
                {/* Locking hinge knuckle */}
                <circle cx={receiverX - 6} cy={receiverY + 16} r="7" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="2" />
                <circle cx={receiverX - 6} cy={receiverY + 16} r="2.5" fill="#38bdf8" />
                {/* Twin metal tubular struts */}
                <line x1={stockX + 10} y1={stockY + 14} x2={receiverX - 6} y2={receiverY + 16} stroke="#38bdf8" strokeWidth="3.5" />
                <line x1={stockX + 16} y1={stockY + 74} x2={receiverX - 6} y2={receiverY + receiverHeight - 12} stroke="#38bdf8" strokeWidth="3.5" />
                {/* Triangular butt bracket */}
                <path d={`M ${stockX} ${stockY + 10} L ${stockX + 14} ${stockY + 10} L ${stockX + 14} ${stockY + 78} L ${stockX} ${stockY + 78} Z`} fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="2" />
                {/* Cross-reinforcing strut */}
                <line x1={stockX + 40} y1={stockY + 24} x2={stockX + 40} y2={stockY + 62} stroke="#38bdf8" strokeWidth="2" />
              </g>
            ) : stock.type === 'telescopic' ? (
              // Modern Telescopic Buffer Tube & Crane Stock
              <g>
                {/* Cylindrical Buffer tube */}
                <rect x={receiverX - 65} y={receiverY + 14} width="65" height="18" rx="2" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Adjustment notches */}
                <line x1={receiverX - 55} y1={receiverY + 23} x2={receiverX - 15} y2={receiverY + 23} stroke="#38bdf8" strokeDasharray="4 4" strokeWidth="3" />
                {/* Sliding Crane buttstock body */}
                <rect x={stockX} y={stockY + 6} width={stockLenPix - 48} height="32" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="2" />
                {/* Sloping cheek rest & adjustment lever */}
                <polygon points={`${stockX + 15},${stockY + 6} ${stockX + stockLenPix - 55},${stockY + 6} ${stockX + stockLenPix - 65},${stockY - 2} ${stockX + 25},${stockY - 2}`} fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" strokeWidth="1.5" />
                <path d={`M ${stockX} ${stockY + 2} L ${stockX + 18} ${stockY + 2} L ${stockX + 18} ${stockY + 82} L ${stockX} ${stockY + 82} Z`} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                {/* Textured rubber buttpad */}
                <line x1={stockX + 3} y1={stockY + 12} x2={stockX + 3} y2={stockY + 72} stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="2" />
              </g>
            ) : (
              // Polymer Ergonomic Fixed Stock with skeletonized cutout
              <g>
                <path
                  d={`M ${stockX} ${stockY + 10}
                      L ${receiverX} ${receiverY + 12}
                      L ${receiverX} ${receiverY + receiverHeight - 6}
                      L ${stockX + 65} ${stockY + 54}
                      L ${stockX} ${stockY + 82} Z`}
                  fill="url(#diagHatch)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Hollow triangle ergonomic cutout */}
                <polygon
                  points={`${stockX + 25},${stockY + 28} ${stockX + 65},${stockY + 22} ${stockX + 45},${stockY + 54}`}
                  fill="#020617"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <line x1={stockX} y1={stockY + 10} x2={stockX} y2={stockY + 82} stroke="#38bdf8" strokeWidth="3" />
              </g>
            )}
            <text x={stockX + 8} y={stockY + 100} fill="#94a3b8" fontSize="9" fontFamily="monospace">
              ПРИКЛАД: {stock.type}
            </text>
          </g>

          {/* ======================================================== */}
          {/* 2. RECEIVER (СТВОЛЬНАЯ КОРОБКА) */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('receiver')} {...slotHighlight('receiver')}>
            {/* Main receiver silhouette */}
            <rect
              x={receiverX}
              y={receiverY}
              width={receiverWidth}
              height={receiverHeight}
              rx={receiver.material === 'polymer' ? '6' : '3'}
              fill="rgba(15, 23, 42, 0.95)"
            />

            {/* Distinct Visual styling based on Manufacturing Method */}
            {receiver.method === 'stamped' ? (
              // STAMPED SHEET METAL (AK/PPS style): corrugation ribs, dimple, rivets
              <g stroke="#38bdf8">
                {/* Stamped top cover with longitudinal strengthening corrugation ridges */}
                <line x1={receiverX + 15} y1={receiverY + 6} x2={receiverX + receiverWidth - 25} y2={receiverY + 6} strokeWidth="1.5" />
                <line x1={receiverX + 25} y1={receiverY + 10} x2={receiverX + receiverWidth - 35} y2={receiverY + 10} strokeWidth="1.2" opacity="0.7" />
                {/* Trunnion rivets (front & rear) */}
                <circle cx={receiverX + 12} cy={receiverY + 20} r="2" fill="#38bdf8" />
                <circle cx={receiverX + 12} cy={receiverY + 40} r="2" fill="#38bdf8" />
                <circle cx={receiverX + receiverWidth - 18} cy={receiverY + 18} r="2" fill="#38bdf8" />
                <circle cx={receiverX + receiverWidth - 18} cy={receiverY + 38} r="2" fill="#38bdf8" />
                {/* Magazine well stamped dimple */}
                <ellipse cx={receiverX + receiverWidth - 55} cy={receiverY + receiverHeight - 14} rx="12" ry="5" fill="none" strokeWidth="1.5" />
                {/* Fire selector lever with Cyrillic markings (ПР / АВ / ОД) */}
                <line x1={receiverX + 35} y1={receiverY + 32} x2={receiverX + 70} y2={receiverY + 24} strokeWidth="2.5" />
                <circle cx={receiverX + 35} cy={receiverY + 32} r="3" fill="#38bdf8" />
              </g>
            ) : receiver.method === 'milled' ? (
              // MILLED SOLID STEEL (Type 3 / SVD): deep rectangular machined lightening cuts
              <g stroke="#38bdf8">
                <rect
                  x={receiverX + 24}
                  y={receiverY + 18}
                  width={receiverWidth - 95}
                  height="22"
                  rx="3"
                  fill="none"
                  strokeWidth="1.8"
                />
                <line x1={receiverX + 28} y1={receiverY + 29} x2={receiverX + receiverWidth - 75} y2={receiverY + 29} strokeDasharray="6 3" strokeWidth="1" opacity="0.6" />
                {/* Heavy solid top cover with clean machined step */}
                <rect x={receiverX + 10} y={receiverY + 4} width={receiverWidth - 20} height="5" fill="none" strokeWidth="1.2" />
                <circle cx={receiverX + 28} cy={receiverY + 42} r="2.5" fill="#38bdf8" />
              </g>
            ) : (
              // MODERN POLYMER RECEIVER: angular faceted body and modular pin locks
              <g stroke="#38bdf8">
                <polygon
                  points={`${receiverX + 20},${receiverY + 12} ${receiverX + receiverWidth - 40},${receiverY + 12} ${receiverX + receiverWidth - 50},${receiverY + 38} ${receiverX + 30},${receiverY + 38}`}
                  fill="url(#diagHatch)"
                  strokeWidth="1.2"
                />
                {/* Modular takedown push-pins */}
                <circle cx={receiverX + 16} cy={receiverY + receiverHeight - 12} r="3" fill="none" strokeWidth="2" />
                <circle cx={receiverX + receiverWidth - 22} cy={receiverY + receiverHeight - 12} r="3" fill="none" strokeWidth="2" />
              </g>
            )}

            {/* Ejection port scaled to cartridge case length */}
            <rect
              x={receiverX + receiverWidth - (cartridge.class === 'rifle' ? 75 : 62)}
              y={receiverY + 12}
              width={cartridge.class === 'rifle' ? 52 : cartridge.class === 'intermediate' ? 42 : 28}
              height="16"
              rx="2"
              fill="#020617"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            <text x={receiverX + 10} y={receiverY + receiverHeight - 6} fill="#7dd3fc" fontSize="9" fontFamily="monospace">
              РЕЙКА/КОРОБКА ({receiver.method})
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3. ACTION & GAS SYSTEM (АВТОМАТИКА И ГАЗООТВОД) */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('action')} {...slotHighlight('action')}>
            {action.requiresGasTube ? (
              // Gas operated (Long stroke or Short stroke)
              <g>
                {/* Gas tube cylinder above barrel */}
                <rect
                  x={barrelX}
                  y={barrelY - 14}
                  width={Math.min(barrelPixLen - 38, 175)}
                  height="9"
                  rx="1.5"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Gas block collar on barrel */}
                <path
                  d={`M ${barrelX + Math.min(barrelPixLen - 42, 170)} ${barrelY - 18}
                      L ${barrelX + Math.min(barrelPixLen - 42, 170) + 18} ${barrelY - 18}
                      L ${barrelX + Math.min(barrelPixLen - 42, 170) + 18} ${barrelY + barrelThickness}
                      L ${barrelX + Math.min(barrelPixLen - 42, 170)} ${barrelY + barrelThickness} Z`}
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Gas regulator switch if adjustable */}
                {action.gasAdjustable && (
                  <circle
                    cx={barrelX + Math.min(barrelPixLen - 42, 170) + 9}
                    cy={barrelY - 21}
                    r="3.5"
                    fill="#38bdf8"
                  />
                )}
                {/* Reciprocating bolt cocking handle */}
                <rect
                  x={receiverX + receiverWidth - 45}
                  y={receiverY + 16}
                  width="14"
                  height="6"
                  rx="2"
                  fill="#38bdf8"
                />
                <text x={barrelX + 10} y={barrelY - 19} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  ГАЗООТВОД ({action.type})
                </text>
              </g>
            ) : action.type === 'blowback' ? (
              // Simple Blowback (PPSh / SMG): NO top gas tube, massive heavy bolt knob
              <g>
                <circle
                  cx={receiverX + receiverWidth - 40}
                  y={receiverY + 20}
                  r="5"
                  fill="#38bdf8"
                />
                <line x1={receiverX + receiverWidth - 40} y1={receiverY + 20} x2={receiverX + receiverWidth - 25} y2={receiverY + 20} stroke="#38bdf8" strokeWidth="3" />
                <text x={receiverX + 25} y={receiverY - 5} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  СВОБОДНЫЙ ЗАТВОР (БЕЗ ГАЗООТВОДА)
                </text>
              </g>
            ) : action.type === 'manual' ? (
              // Bolt-Action: Turn bolt handle with ball knob
              <g>
                <line x1={receiverX + 45} y1={receiverY + 12} x2={receiverX + 45} y2={receiverY - 14} stroke="#38bdf8" strokeWidth="3.5" />
                <circle cx={receiverX + 45} cy={receiverY - 14} r="5" fill="#38bdf8" />
                <text x={receiverX + 20} y={receiverY - 18} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  ПОВОРОТНЫЙ ЗАТВОР
                </text>
              </g>
            ) : null}
          </g>

          {/* ======================================================== */}
          {/* 4. BARREL (СТВОЛ) */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('barrel')} {...slotHighlight('barrel')}>
            <rect
              x={barrelX}
              y={barrelY}
              width={barrelPixLen}
              height={barrelThickness}
              rx="1"
              fill="rgba(15, 23, 42, 0.9)"
            />

            {/* Heavy Barrel Fluting or Ribs */}
            {barrel.profile === 'heavy' ? (
              <g stroke="#38bdf8" opacity="0.6">
                <line x1={barrelX + 15} y1={barrelY + 3} x2={barrelX + barrelPixLen - 15} y2={barrelY + 3} strokeWidth="1.5" />
                <line x1={barrelX + 15} y1={barrelY + barrelThickness - 3} x2={barrelX + barrelPixLen - 15} y2={barrelY + barrelThickness - 3} strokeWidth="1.5" />
                {/* Radial cooling fins near chamber */}
                <line x1={barrelX + 25} y1={barrelY - 2} x2={barrelX + 25} y2={barrelY + barrelThickness + 2} strokeWidth="1.5" />
                <line x1={barrelX + 35} y1={barrelY - 2} x2={barrelX + 35} y2={barrelY + barrelThickness + 2} strokeWidth="1.5" />
                <line x1={barrelX + 45} y1={barrelY - 2} x2={barrelX + 45} y2={barrelY + barrelThickness + 2} strokeWidth="1.5" />
              </g>
            ) : barrel.profile === 'light' ? (
              // Tapered pencil barrel step
              <line
                x1={barrelX + barrelPixLen * 0.4}
                y1={barrelY}
                x2={barrelX + barrelPixLen}
                y2={barrelY + 1}
                stroke="#38bdf8"
                strokeWidth="1"
              />
            ) : null}

            {/* Rifling spiral dashes */}
            {barrel.rifled && (
              <line
                x1={barrelX + 12}
                y1={barrelY + barrelThickness / 2}
                x2={barrelX + barrelPixLen - 12}
                y2={barrelY + barrelThickness / 2}
                stroke="#38bdf8"
                strokeDasharray="8 6"
                strokeWidth="1.5"
                opacity="0.75"
              />
            )}

            {/* Threaded muzzle indication */}
            {barrel.thread !== 'none' && (
              <g stroke="#38bdf8" strokeWidth="1">
                <line x1={barrelX + barrelPixLen - 9} y1={barrelY - 2} x2={barrelX + barrelPixLen - 9} y2={barrelY + barrelThickness + 2} />
                <line x1={barrelX + barrelPixLen - 6} y1={barrelY - 2} x2={barrelX + barrelPixLen - 6} y2={barrelY + barrelThickness + 2} />
                <line x1={barrelX + barrelPixLen - 3} y1={barrelY - 2} x2={barrelX + barrelPixLen - 3} y2={barrelY + barrelThickness + 2} />
              </g>
            )}

            <text
              x={barrelX + barrelPixLen / 2 - 35}
              y={barrelY + barrelThickness + 14}
              fill="#7dd3fc"
              fontSize="9"
              fontFamily="monospace"
            >
              СТВОЛ {barrel.length} мм ({barrel.profile})
            </text>
          </g>

          {/* ======================================================== */}
          {/* 5. HANDGUARD (ЦЕВЬЁ) */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('handguard')} {...slotHighlight('handguard')}>
            <rect
              x={handguardX}
              y={handguardY}
              width={handguardLenPix}
              height={handguardHeight}
              rx={handguard.material === 'wood' ? '4' : '2'}
              fill={
                handguard.material === 'wood'
                  ? 'url(#woodHatch)'
                  : handguard.material === 'aluminum'
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'url(#diagHatch)'
              }
              stroke={handguard.material === 'wood' ? '#ca8a04' : '#38bdf8'}
              strokeWidth="2"
            />

            {/* Handguard Material specific details */}
            {handguard.material === 'aluminum' ? (
              // Ventilated aluminum or perforated shroud
              <g fill="#020617" stroke="#38bdf8" strokeWidth="1">
                <circle cx={handguardX + 20} cy={handguardY + 11} r="4" />
                <circle cx={handguardX + 40} cy={handguardY + 11} r="4" />
                <circle cx={handguardX + 60} cy={handguardY + 11} r="4" />
                <circle cx={handguardX + 80} cy={handguardY + 11} r="4" />
                <circle cx={handguardX + 30} cy={handguardY + 23} r="4" />
                <circle cx={handguardX + 50} cy={handguardY + 23} r="4" />
                <circle cx={handguardX + 70} cy={handguardY + 23} r="4" />
              </g>
            ) : handguard.material === 'wood' ? (
              // Wooden finger swells and cooling vents
              <g stroke="#ca8a04" strokeWidth="1.2">
                <rect x={handguardX + 22} y={handguardY + 7} width="16" height="4" rx="1" fill="#020617" />
                <rect x={handguardX + 50} y={handguardY + 7} width="16" height="4" rx="1" fill="#020617" />
                {/* Steel retainer ring at front of handguard */}
                <line x1={handguardX + handguardLenPix - 4} y1={handguardY} x2={handguardX + handguardLenPix - 4} y2={handguardY + handguardHeight} stroke="#94a3b8" strokeWidth="4" />
              </g>
            ) : (
              // Modern Quad-Rail / M-LOK handguard with slots
              <g stroke="#38bdf8">
                {/* M-LOK slots */}
                <rect x={handguardX + 16} y={handguardY + 12} width="22" height="6" rx="2" fill="#020617" strokeWidth="1" />
                <rect x={handguardX + 46} y={handguardY + 12} width="22" height="6" rx="2" fill="#020617" strokeWidth="1" />
                {handguardLenPix > 110 && (
                  <rect x={handguardX + 76} y={handguardY + 12} width="22" height="6" rx="2" fill="#020617" strokeWidth="1" />
                )}
                {/* Lower Picatinny rail teeth */}
                <line x1={handguardX + 8} y1={handguardY + handguardHeight - 2} x2={handguardX + handguardLenPix - 8} y2={handguardY + handguardHeight - 2} strokeDasharray="4 2" strokeWidth="3" />
              </g>
            )}

            <text x={handguardX + 8} y={handguardY + handguardHeight + 13} fill="#94a3b8" fontSize="8" fontFamily="monospace">
              ЦЕВЬЁ ({handguard.material})
            </text>
          </g>

          {/* ======================================================== */}
          {/* 6. MAGAZINE (МАГАЗИН) */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('magazine')} {...slotHighlight('magazine')}>
            {magazine.type === 'drum' ? (
              // Circular Drum Magazine (PPSh / RPK style)
              <g>
                <circle
                  cx={magX + 28}
                  cy={magY + 44}
                  r="42"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <circle cx={magX + 28} cy={magY + 44} r="18" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx={magX + 28} cy={magY + 44} r="5" fill="#38bdf8" />
                {/* Drum winding key */}
                <line x1={magX + 28} y1={magY + 39} x2={magX + 28} y2={magY + 49} stroke="#020617" strokeWidth="2" />
                <line x1={magX + 23} y1={magY + 44} x2={magX + 33} y2={magY + 44} stroke="#020617" strokeWidth="2" />
              </g>
            ) : cartridge.class === 'intermediate' ? (
              // Curved banana magazine (AK / 5.45 style) with curvature and reinforcement ribs
              <g>
                <path
                  d={`M ${magX} ${magY}
                      L ${magX + magWidth} ${magY}
                      Q ${magX + magWidth + 20} ${magY + magHeight * 0.65} ${magX + magWidth + 6} ${magY + magHeight}
                      L ${magX - 14} ${magY + magHeight}
                      Q ${magX - 6} ${magY + magHeight * 0.65} ${magX} ${magY} Z`}
                  fill={magazine.material === 'polymer' ? 'url(#diagHatch)' : 'rgba(15, 23, 42, 0.95)'}
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Horizontal stamped reinforcement ribs */}
                <line x1={magX + 4} y1={magY + magHeight * 0.28} x2={magX + magWidth + 5} y2={magY + magHeight * 0.28} stroke="#38bdf8" strokeWidth="1.5" />
                <line x1={magX + 1} y1={magY + magHeight * 0.52} x2={magX + magWidth + 10} y2={magY + magHeight * 0.52} stroke="#38bdf8" strokeWidth="1.5" />
                <line x1={magX - 4} y1={magY + magHeight * 0.76} x2={magX + magWidth + 8} y2={magY + magHeight * 0.76} stroke="#38bdf8" strokeWidth="1.5" />
                {/* Removable steel baseplate */}
                <line x1={magX - 16} y1={magY + magHeight} x2={magX + magWidth + 8} y2={magY + magHeight} stroke="#38bdf8" strokeWidth="4" />
              </g>
            ) : (
              // Straight box magazine (Pistol SMG stick or Sniper rifle box)
              <g>
                <rect
                  x={magX}
                  y={magY}
                  width={magWidth}
                  height={magHeight}
                  rx="2"
                  fill="rgba(15, 23, 42, 0.95)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Vertical stamped rib line */}
                <line x1={magX + magWidth / 2} y1={magY + 8} x2={magX + magWidth / 2} y2={magY + magHeight - 8} stroke="#38bdf8" strokeWidth="1.5" />
                <line x1={magX - 2} y1={magY + magHeight} x2={magX + magWidth + 2} y2={magY + magHeight} stroke="#38bdf8" strokeWidth="3" />
              </g>
            )}

            <text x={magX - 8} y={magY + magHeight + 15} fill="#7dd3fc" fontSize="9" fontFamily="monospace">
              МАГАЗИН: {magazine.capacity} п.
            </text>
          </g>

          {/* ======================================================== */}
          {/* 7. PISTOL GRIP & TRIGGER / УСМ */}
          {/* ======================================================== */}
          <g onClick={() => onSelectSlot('trigger')} {...slotHighlight('trigger')}>
            {/* If bullpup, show forward linkage bar to rear sear */}
            {isBullpup && (
              <line
                x1={gripX + 15}
                y1={receiverY + receiverHeight - 3}
                x2={receiverX + 25}
                y2={receiverY + receiverHeight - 3}
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            )}

            {/* Pistol Grip Handle */}
            <path
              d={`M ${gripX} ${gripY - 4}
                  L ${gripX + 32} ${gripY - 4}
                  L ${gripX + 22} ${gripY + 68}
                  L ${gripX - 6} ${gripY + 65} Z`}
              fill="rgba(15, 23, 42, 0.95)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {/* Grip texture checkering */}
            <line x1={gripX + 5} y1={gripY + 18} x2={gripX + 22} y2={gripY + 18} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth="2" />
            <line x1={gripX + 3} y1={gripY + 34} x2={gripX + 18} y2={gripY + 34} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth="2" />
            <line x1={gripX} y1={gripY + 50} x2={gripX + 14} y2={gripY + 50} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth="2" />

            {/* Trigger Guard */}
            <path
              d={`M ${triggerX - 6} ${gripY}
                  L ${triggerX + 26} ${gripY}
                  L ${triggerX + 26} ${gripY + 25}
                  L ${triggerX - 6} ${gripY + 25} Z`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
            />
            {/* Curved Trigger Blade */}
            <path
              d={`M ${triggerX + 12} ${gripY + 2}
                  Q ${triggerX + 16} ${gripY + 12} ${triggerX + 5} ${gripY + 20}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.8"
            />

            <text x={gripX - 6} y={gripY + 82} fill="#94a3b8" fontSize="8" fontFamily="monospace">
              УСМ ({trigger.mode})
            </text>
          </g>

          {/* ======================================================== */}
          {/* 8. TOP INTERFACE RAIL (ПЛАНКА) */}
          {/* ======================================================== */}
          {topInterface.type !== 'none' && (
            <g onClick={() => onSelectSlot('topInterface')} {...slotHighlight('topInterface')}>
              <rect
                x={railX}
                y={railY}
                width={railWidth}
                height="8"
                rx="1"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              {/* Rail discrete teeth notches */}
              <line
                x1={railX + 6}
                y1={railY + 4}
                x2={railX + railWidth - 6}
                y2={railY + 4}
                stroke="#38bdf8"
                strokeDasharray="4 3"
                strokeWidth="4"
              />
              <text x={railX + 8} y={railY - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                РЕЙКА: {topInterface.type}
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* 9. TOP ATTACHMENT (ПРИЦЕЛ / ОПТИКА) ИЛИ МУШКА */}
          {/* ======================================================== */}
          {topAttachment ? (
            <g onClick={() => onSelectSlot('topAttachment')} {...slotHighlight('topAttachment')}>
              {topAttachment.type === 'collimator' ? (
                // Red Dot Collimator Sight
                <g>
                  <rect x={railX + 52} y={railY - 26} width="46" height="24" rx="3" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  <ellipse cx={railX + 75} cy={railY - 14} rx="13" ry="9" fill="rgba(6, 182, 212, 0.25)" stroke="#38bdf8" strokeWidth="1.2" />
                  <circle cx={railX + 75} cy={railY - 14} r="2" fill="#f43f5e" />
                </g>
              ) : topAttachment.type === 'optic4x' ? (
                // 4x Combat Optical Scope (ACOG / PSO-1)
                <g>
                  {/* Scope Tube */}
                  <rect x={railX + 28} y={railY - 34} width="115" height="13" rx="1.5" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  {/* Objective bell */}
                  <path d={`M ${railX + 143} ${railY - 38} L ${railX + 170} ${railY - 45} L ${railX + 170} ${railY - 16} L ${railX + 143} ${railY - 21} Z`} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  {/* Ocular bell with rubber eye shade */}
                  <path d={`M ${railX + 28} ${railY - 34} L ${railX + 12} ${railY - 40} L ${railX + 12} ${railY - 18} L ${railX + 28} ${railY - 24} Z`} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  {/* Adjustment turrets */}
                  <rect x={railX + 80} y={railY - 45} width="16" height="11" rx="1" fill="#38bdf8" />
                  {/* Heavy mounting rings */}
                  <rect x={railX + 44} y={railY - 21} width="11" height="21" fill="#38bdf8" />
                  <rect x={railX + 115} y={railY - 21} width="11" height="21" fill="#38bdf8" />
                </g>
              ) : topAttachment.type === 'optic8x' ? (
                // 8x-12x Precision Sniper Scope with long sunshade
                <g>
                  <rect x={railX + 18} y={railY - 38} width="155" height="15" rx="2" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  {/* Giant 56mm objective bell with sunshade tube */}
                  <path d={`M ${railX + 173} ${railY - 44} L ${railX + 215} ${railY - 50} L ${railX + 215} ${railY - 14} L ${railX + 173} ${railY - 20} Z`} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  <path d={`M ${railX + 18} ${railY - 38} L ${railX + 2} ${railY - 44} L ${railX + 2} ${railY - 18} L ${railX + 18} ${railY - 24} Z`} fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  {/* Large tactical target elevation and windage turrets */}
                  <rect x={railX + 88} y={railY - 52} width="18" height="14" rx="2" fill="#38bdf8" />
                  <rect x={railX + 45} y={railY - 23} width="12" height="23" fill="#38bdf8" />
                  <rect x={railX + 135} y={railY - 23} width="12" height="23" fill="#38bdf8" />
                </g>
              ) : (
                // Thermal / Night Vision Device
                <g>
                  <rect x={railX + 25} y={railY - 42} width="105" height="36" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
                  <rect x={railX + 130} y={railY - 38} width="24" height="28" rx="3" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1={railX + 55} y1={railY - 46} x2={railX + 75} y2={railY - 46} stroke="#38bdf8" strokeWidth="3" />
                  <circle cx={railX + 90} cy={railY - 24} r="4" fill="#38bdf8" />
                </g>
              )}
              <text x={railX + 35} y={railY - 48} fill="#38bdf8" fontSize="9" fontFamily="monospace">
                {topAttachment.name}
              </text>
            </g>
          ) : (
            // IRON SIGHTS (Default if no optic mounted)
            <g stroke="#38bdf8" strokeWidth="1.5" fill="rgba(15, 23, 42, 0.9)">
              {/* Rear Sight Tangent Block on receiver front */}
              <path
                d={`M ${receiverX + receiverWidth - 48} ${receiverY}
                    L ${receiverX + receiverWidth - 48} ${receiverY - 14}
                    L ${receiverX + receiverWidth - 24} ${receiverY - 11}
                    L ${receiverX + receiverWidth - 24} ${receiverY} Z`}
              />
              <line x1={receiverX + receiverWidth - 44} y1={receiverY - 14} x2={receiverX + receiverWidth - 44} y2={receiverY - 18} strokeWidth="2" stroke="#7dd3fc" />

              {/* Front Sight Base & Post near barrel muzzle */}
              <path
                d={`M ${barrelX + Math.min(barrelPixLen - 22, barrelPixLen)} ${barrelY}
                    L ${barrelX + Math.min(barrelPixLen - 22, barrelPixLen)} ${barrelY - 20}
                    L ${barrelX + Math.min(barrelPixLen - 8, barrelPixLen + 14)} ${barrelY - 20}
                    L ${barrelX + Math.min(barrelPixLen - 8, barrelPixLen + 14)} ${barrelY} Z`}
              />
              {/* Front sight post needle */}
              <line
                x1={barrelX + Math.min(barrelPixLen - 15, barrelPixLen + 7)}
                y1={barrelY - 20}
                x2={barrelX + Math.min(barrelPixLen - 15, barrelPixLen + 7)}
                y2={barrelY - 26}
                strokeWidth="2.5"
                stroke="#7dd3fc"
              />
              {/* Protective cylindrical ear hood */}
              <path
                d={`M ${barrelX + Math.min(barrelPixLen - 21, barrelPixLen + 1)} ${barrelY - 20}
                    Q ${barrelX + Math.min(barrelPixLen - 15, barrelPixLen + 7)} ${barrelY - 29}
                      ${barrelX + Math.min(barrelPixLen - 9, barrelPixLen + 13)} ${barrelY - 20}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* ======================================================== */}
          {/* 10. LOWER ATTACHMENT (РУКОЯТЬ / СОШКИ / ФОНАРЬ) */}
          {/* ======================================================== */}
          {lowerAttachment && (
            <g onClick={() => onSelectSlot('lowerAttachment')} {...slotHighlight('lowerAttachment')}>
              {lowerAttachment.type === 'verticalGrip' ? (
                // Tactical vertical foregrip
                <rect x={handguardX + 32} y={handguardY + handguardHeight} width="22" height="52" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="2" />
              ) : lowerAttachment.type === 'bipod' ? (
                // Deployed precision folding bipod
                <g stroke="#38bdf8">
                  <rect x={handguardX + handguardLenPix - 34} y={handguardY + handguardHeight} width="20" height="12" fill="rgba(15, 23, 42, 0.95)" strokeWidth="1.5" />
                  <line
                    x1={handguardX + handguardLenPix - 24}
                    y1={handguardY + handguardHeight + 12}
                    x2={handguardX + handguardLenPix - 48}
                    y2={handguardY + handguardHeight + 70}
                    strokeWidth="3.5"
                  />
                  <line
                    x1={handguardX + handguardLenPix - 24}
                    y1={handguardY + handguardHeight + 12}
                    x2={handguardX + handguardLenPix + 10}
                    y2={handguardY + handguardHeight + 70}
                    strokeWidth="3.5"
                  />
                  {/* Rubber feet pads */}
                  <circle cx={handguardX + handguardLenPix - 48} cy={handguardY + handguardHeight + 70} r="3" fill="#38bdf8" />
                  <circle cx={handguardX + handguardLenPix + 10} cy={handguardY + handguardHeight + 70} r="3" fill="#38bdf8" />
                </g>
              ) : (
                // Tactical Flashlight / Laser with Light Cone
                <g stroke="#38bdf8">
                  <rect x={handguardX + 26} y={handguardY + handguardHeight} width="40" height="15" rx="2" fill="rgba(15, 23, 42, 0.95)" strokeWidth="1.5" />
                  {/* Projected light cone */}
                  <polygon
                    points={`${handguardX + 66},${handguardY + handguardHeight + 4} ${handguardX + 130},${handguardY + handguardHeight - 18} ${handguardX + 130},${handguardY + handguardHeight + 36} ${handguardX + 66},${handguardY + handguardHeight + 11}`}
                    fill="rgba(56, 189, 248, 0.12)"
                    stroke="none"
                  />
                </g>
              )}
              <text x={handguardX + 20} y={handguardY + handguardHeight + 76} fill="#94a3b8" fontSize="8" fontFamily="monospace">
                {lowerAttachment.name}
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* 11. MUZZLE DEVICE (ДТК / ПЛАМЕГАСИТЕЛЬ / ГЛУШИТЕЛЬ) */}
          {/* ======================================================== */}
          {muzzleDevice.type !== 'none' && (
            <g onClick={() => onSelectSlot('muzzleDevice')} {...slotHighlight('muzzleDevice')}>
              <rect
                x={muzzleX}
                y={muzzleY}
                width={muzzleWidth}
                height={muzzleHeight}
                rx={muzzleDevice.type === 'suppressor' ? 4 : 1}
                fill="rgba(15, 23, 42, 0.95)"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              {muzzleDevice.type === 'suppressor' ? (
                // Tactical Silencer: knurling & baffle ribs
                <g stroke="#38bdf8" strokeWidth="1.2">
                  <line x1={muzzleX + 12} y1={muzzleY} x2={muzzleX + 12} y2={muzzleY + muzzleHeight} />
                  <line x1={muzzleX + muzzleWidth - 10} y1={muzzleY} x2={muzzleX + muzzleWidth - 10} y2={muzzleY + muzzleHeight} />
                  {/* Knurled collar pattern */}
                  <line x1={muzzleX + 4} y1={muzzleY + 4} x2={muzzleX + 10} y2={muzzleY + muzzleHeight - 4} strokeDasharray="2 2" />
                </g>
              ) : muzzleDevice.type === 'flashHider' ? (
                // Birdcage flash hider slots
                <g stroke="#020617" strokeWidth="2">
                  <line x1={muzzleX + 4} y1={muzzleY + 3} x2={muzzleX + muzzleWidth - 2} y2={muzzleY + 3} />
                  <line x1={muzzleX + 4} y1={muzzleY + muzzleHeight - 3} x2={muzzleX + muzzleWidth - 2} y2={muzzleY + muzzleHeight - 3} />
                </g>
              ) : muzzleDevice.type === 'compensator' ? (
                // Multi-port compensator venting ports
                <g fill="#020617">
                  <rect x={muzzleX + 5} y={muzzleY - 3} width="6" height="5" />
                  <rect x={muzzleX + 14} y={muzzleY - 3} width="6" height="5" />
                </g>
              ) : null}

              <text x={muzzleX - 10} y={muzzleY - 10} fill="#7dd3fc" fontSize="8" fontFamily="monospace">
                {muzzleDevice.type === 'suppressor' ? 'ПБС Глушитель' : 'ДТК'}
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* DIMENSION LINES & ARROWS */}
          {/* ======================================================== */}
          {/* Overall Weapon Length Dimension Line */}
          <g stroke="#38bdf8" strokeWidth="1" opacity="0.65">
            <line
              x1={stockX}
              y1="368"
              x2={muzzleX + muzzleWidth}
              y2="368"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <line x1={stockX} y1={stockY + 75} x2={stockX} y2="378" strokeDasharray="2 2" />
            <line
              x1={muzzleX + muzzleWidth}
              y1={muzzleY + muzzleHeight + 5}
              x2={muzzleX + muzzleWidth}
              y2="378"
              strokeDasharray="2 2"
            />
            <text
              x={(stockX + muzzleX + muzzleWidth) / 2}
              y="384"
              fill="#38bdf8"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              className="font-bold"
            >
              ОБЩАЯ ДЛИНА: {derived.overallLength} мм
            </text>
          </g>

          {/* Barrel Length Dimension Line */}
          <g stroke="#0ea5e9" strokeWidth="1" opacity="0.6">
            <line
              x1={barrelX}
              y1="68"
              x2={barrelX + barrelPixLen}
              y2="68"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <line x1={barrelX} y1="62" x2={barrelX} y2={barrelY} strokeDasharray="2 2" />
            <line x1={barrelX + barrelPixLen} y1="62" x2={barrelX + barrelPixLen} y2={barrelY} strokeDasharray="2 2" />
            <text
              x={barrelX + barrelPixLen / 2}
              y="60"
              fill="#7dd3fc"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
            >
              ДЛИНА СТВОЛА: {barrel.length} мм
            </text>
          </g>
          </g>

          {/* Official Engineering Blueprint Stamp (GOST style) */}
          <g transform="translate(735, 318)">
            <rect x="0" y="0" width="250" height="88" rx="2" fill="rgba(6, 14, 26, 0.96)" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="0" y1="22" x2="250" y2="22" stroke="#0284c7" strokeWidth="1" />
            <line x1="0" y1="44" x2="250" y2="44" stroke="#0284c7" strokeWidth="1" />
            <line x1="0" y1="66" x2="250" y2="66" stroke="#0284c7" strokeWidth="1" />
            <line x1="130" y1="22" x2="130" y2="66" stroke="#0284c7" strokeWidth="1" />

            {/* Row 1: Header */}
            <text x="8" y="16" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              GUNPOWDER v1.7.0 · КБ
            </text>
            <text x="175" y="16" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              МАСШТАБ 1:2
            </text>

            {/* Row 2: Developer & Caliber */}
            <text x="8" y="37" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
              РАЗРАБ: Главный инж.
            </text>
            <text x="136" y="37" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
              {slots.cartridge.class.toUpperCase()}
            </text>

            {/* Row 3: GRAU & Mass */}
            <text x="8" y="58" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
              ВООРУЖЕНИЕ: {slots.action.type.slice(0, 14)}
            </text>
            <text x="136" y="58" fill="#a5f3fc" fontSize="9" fontFamily="monospace">
              МАССА: {derived.weaponMass} кг
            </text>

            {/* Row 4: Status */}
            <text
              x="8"
              y="80"
              fill={issues.length === 0 ? '#4ade80' : '#f87171'}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              СТАТУС: {issues.length === 0 ? '✓ ЧЕРТЁЖ УТВЕРЖДЁН' : `✗ ТРЕБУЕТ ПРАВОК (${issues.length})`}
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Slot Hotbar underneath blueprint */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-cyan-950/80 bg-slate-900/60 p-2.5 overflow-x-auto">
        {(
          [
            ['cartridge', 'Патрон', slots.cartridge.name],
            ['barrel', 'Ствол', `${slots.barrel.length}мм (${slots.barrel.profile})`],
            ['action', 'Автоматика', slots.action.type],
            ['receiver', 'Ресивер', `${slots.receiver.method}`],
            ['magazine', 'Магазин', `${slots.magazine.capacity} патр.`],
            ['trigger', 'УСМ', `${slots.trigger.mode}`],
            ['stock', 'Приклад', slots.stock.type],
            ['topInterface', 'Планка', slots.topInterface.type],
            ['handguard', 'Цевьё', slots.handguard.material],
            ['muzzleDevice', 'Дульное', slots.muzzleDevice.type],
            ['topAttachment', 'Прицел', slots.topAttachment ? slots.topAttachment.name : 'отсутствует'],
            ['lowerAttachment', 'Обвес', slots.lowerAttachment ? slots.lowerAttachment.name : 'отсутствует'],
          ] as const
        ).map(([key, label, value]) => {
          const isSelected = activeSlot === key;
          const issue = issuesBySlot[key];
          return (
            <button
              key={key}
              onClick={() => onSelectSlot(key as keyof WeaponSlots)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors whitespace-nowrap shrink-0 ${
                issue === 'error'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
                  : issue === 'warning'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                  : isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/60'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-slate-400 font-mono text-[10px] uppercase">{label}:</span>
              <span className="font-medium truncate max-w-[110px]">{value}</span>
              {issue === 'error' && <span className="text-rose-400 font-bold">!</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
