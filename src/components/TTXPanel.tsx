import React, { useState } from 'react';
import {
  DerivedStats,
  TechnicalSpecification,
  ValidationIssue,
  WeaponSlots,
} from '../types';
import { checkTZCompliance } from '../engine/physics';

interface TTXPanelProps {
  derived: DerivedStats;
  slots: WeaponSlots;
  tz: TechnicalSpecification | null;
  issues: ValidationIssue[];
  onOpenFormulaExplainer?: (statName: string) => void;
}

export const TTXPanel: React.FC<TTXPanelProps> = ({
  derived,
  slots,
  tz,
  issues,
}) => {
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);

  const compliance = tz ? checkTZCompliance(derived, tz, slots) : null;

  const formulaExplanations: Record<string, { title: string; formula: string; explanation: string }> = {
    velocity: {
      title: 'Начальная скорость пули (v)',
      formula: 'v = vRef * (0.55 + 0.45 * min(1.0, L_ствола / lRef))',
      explanation: `Базовая скорость для патрона ${slots.cartridge.name}: ${slots.cartridge.vRef} м/с при эталоне ствола ${slots.cartridge.lRef} мм. Длина текущего ствола ${slots.barrel.length} мм даёт расчётную скорость ${derived.velocity} м/с.`,
    },
    energy: {
      title: 'Дульная энергия пули (E)',
      formula: 'E = 0.5 * (m_пули / 1000) * v²',
      explanation: `Масса пули ${slots.cartridge.bulletMass} г при скорости ${derived.velocity} м/с обеспечивает кинетическую энергию ${derived.energy} Дж на дульном срезе.`,
    },
    mass: {
      title: 'Масса оружия без патронов',
      formula: 'M = Σ mass(ствол + ресивер + затвор + магазин + приклад + цевьё + планка + ДТК + обвес)',
      explanation: `Ствол: ~${(derived.weaponMass * 0.35).toFixed(1)} кг, Ствольная коробка (${slots.receiver.method}): ~${(derived.weaponMass * 0.3).toFixed(1)} кг, Приклад и цевьё: ~${(derived.weaponMass * 0.2).toFixed(1)} кг, Обвес и механизмы: ~${(derived.weaponMass * 0.15).toFixed(1)} кг.`,
    },
    cost: {
      title: 'Себестоимость серии (у.е.)',
      formula: 'unitCost = Σ cost(узлов) + markup(метод, серия)',
      explanation: `Сумма деталей плюс коэффициент масштаба и метода обработки. Штамповка резко снижает цену при сериях от 20 000 шт., а фрезеровка увеличивает стоимость оснастки.`,
    },
    reliability: {
      title: 'Коэффициент надёжности (%)',
      formula: 'reliability = base(автоматика) - penalties(магазин, грязь/мороз, регулировка) + bonuses',
      explanation: `База ${slots.action.type}: ${slots.action.reliabilityBase}%. Климат "${tz?.climate || 'норма'}" даёт штраф. Регулируемый газоотвод и прочный ресивер удерживают надёжность на уровне ${derived.reliability}%.`,
    },
    accuracy: {
      title: 'Кучность стрельбы (MOA)',
      formula: 'MOA = base(тип) + twistPenalty + triggerPenalty + attachments - compensator',
      explanation: `База схемы: ${slots.action.type === 'manual' ? '1.4' : '2.8'} MOA. Оптимальный шаг нарезки под пулю: ${derived.optimalTwist} мм (текущий: ${slots.barrel.twist} мм). Качество спуска УСМ: ${derived.triggerQuality}%. Итог: ${derived.accuracyMOA} MOA.`,
    },
    recoil: {
      title: 'Ощущаемая отдача (Дж/кг)',
      formula: 'feltRecoil = [E * (1 - muzzleReduction) * (damper ? 0.85 : 1)] / weaponMass',
      explanation: `Энергия отдачи ${derived.recoilEnergy} Дж распределяется на массу оружия ${derived.weaponMass} кг. Чем тяжелее оружие и эффективнее ДТК, тем мягче отдача.`,
    },
  };

  const statItems = [
    {
      key: 'velocity',
      label: 'Скорость пули (v)',
      val: `${derived.velocity} м/с`,
      sub: `E = ${derived.energy} Дж · Настильность ${derived.flatness}/100`,
      req: null,
      passed: true,
    },
    {
      key: 'mass',
      label: 'Масса оружия',
      val: `${derived.weaponMass} кг`,
      sub: `Лимит по ТЗ: ${tz ? `≤ ${tz.maxMass} кг` : '—'}`,
      req: tz ? `≤ ${tz.maxMass} кг` : null,
      passed: tz ? derived.weaponMass <= tz.maxMass : true,
    },
    {
      key: 'cost',
      label: 'Себестоимость',
      val: `${derived.unitCost} у.е.`,
      sub: `Смета ТЗ: ${tz ? `≤ ${tz.maxUnitCost} у.е.` : '—'}`,
      req: tz ? `≤ ${tz.maxUnitCost} у.е.` : null,
      passed: tz ? derived.unitCost <= tz.maxUnitCost : true,
    },
    {
      key: 'reliability',
      label: 'Надёжность',
      val: `${derived.reliability}%`,
      sub: `Норматив ТЗ: ${tz ? `≥ ${tz.minReliability}%` : '—'} (${tz?.climate || 'норма'})`,
      req: tz ? `≥ ${tz.minReliability}%` : null,
      passed: tz ? derived.reliability >= tz.minReliability : true,
    },
    {
      key: 'accuracy',
      label: 'Кучность (MOA)',
      val: `${derived.accuracyMOA} MOA`,
      sub: `Требование ТЗ: ${tz ? `≤ ${tz.minAccuracyMOA} MOA` : '—'} (меньше = лучше)`,
      req: tz ? `≤ ${tz.minAccuracyMOA} MOA` : null,
      passed: tz ? derived.accuracyMOA <= tz.minAccuracyMOA : true,
    },
    {
      key: 'cyclicRate',
      label: 'Темп стрельбы',
      val: `${derived.cyclicRate} в/м`,
      sub: `Требование ТЗ: ${tz ? `≥ ${tz.minRate} в/м` : '—'}`,
      req: tz ? `≥ ${tz.minRate} в/м` : null,
      passed: tz ? derived.cyclicRate >= tz.minRate : true,
    },
    {
      key: 'recoil',
      label: 'Ощущаемая отдача',
      val: `${derived.feltRecoil} Дж/кг`,
      sub: `Энергия отдачи: ${derived.recoilEnergy} Дж (ДТК: -${slots.muzzleDevice.recoilReduction}%)`,
      req: null,
      passed: true,
    },
    {
      key: 'standardization',
      label: 'Стандартизация',
      val: `${derived.standardization}%`,
      sub: `Требование ТЗ: ${tz ? `≥ ${tz.minStandardization}%` : '—'}`,
      req: tz ? `≥ ${tz.minStandardization}%` : null,
      passed: tz ? derived.standardization >= tz.minStandardization : true,
    },
    {
      key: 'manufacturability',
      label: 'Технологичность',
      val: `${derived.manufacturability}%`,
      sub: `Метод: ${slots.receiver.method} (${slots.receiver.material})`,
      req: null,
      passed: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* TTX Table Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Сводная таблица ТТХ
            </h3>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-cyan-400">Физический расчёт</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Нажмите на параметр для просмотра формулы
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {statItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedFormula(item.key)}
              className={`flex flex-col text-left rounded-lg p-3 transition-all border ${
                item.req !== null && !item.passed
                  ? 'border-rose-800/80 bg-rose-950/20 hover:bg-rose-950/30'
                  : item.req !== null && item.passed
                  ? 'border-emerald-800/60 bg-emerald-950/15 hover:bg-emerald-950/25'
                  : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                {item.req !== null && (
                  <span
                    className={`text-xs font-mono font-bold ${
                      item.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.passed ? '✓ Норма' : '✗ Брак'}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono tracking-tight text-slate-100 tabular-nums">
                  {item.val}
                </span>
                {item.req && (
                  <span className="text-xs font-mono text-slate-400">
                    [{item.req}]
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px] text-slate-500 truncate">
                {item.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chief Engineer's Technical Report & Audit */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Отчёт Главного инженера
            </h3>
            <span className="text-xs text-slate-500">·</span>
            <span
              className={`text-xs font-mono ${
                issues.some((i) => i.type === 'error')
                  ? 'text-rose-400'
                  : compliance?.passed
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {issues.some((i) => i.type === 'error')
                ? 'Критический инженерный дефект'
                : compliance?.passed
                ? 'Проект готов к конкурсу'
                : 'Требуется доводка параметров'}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Ошибок: {issues.filter((i) => i.type === 'error').length} · Предупреждений:{' '}
            {issues.filter((i) => i.type === 'warning').length}
          </div>
        </div>

        {/* Hard System Errors (Section 9) */}
        {issues.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {issues.map((issue, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 rounded-lg p-3 text-xs border ${
                  issue.type === 'error'
                    ? 'border-rose-900/80 bg-rose-950/40 text-rose-200'
                    : 'border-amber-900/80 bg-amber-950/40 text-amber-200'
                }`}
              >
                <span className="font-bold text-sm shrink-0">
                  {issue.type === 'error' ? '⛔' : '⚠️'}
                </span>
                <div>
                  <div className="font-semibold text-slate-100">{issue.title}</div>
                  <div className="mt-0.5 text-slate-300 leading-relaxed">
                    {issue.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations / Advice from Chief Engineer */}
        {compliance && compliance.recommendations.length > 0 && (
          <div className="mt-3 rounded-lg border border-cyan-950/80 bg-cyan-950/20 p-3 text-xs">
            <div className="font-semibold text-cyan-300 mb-1">
              Рекомендации по доводке до нормативов ТЗ:
            </div>
            <ul className="flex flex-col gap-1 text-slate-300 list-disc list-inside">
              {compliance.recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {issues.length === 0 && (!compliance || compliance.passed) && (
          <div className="mt-3 text-xs text-emerald-300 bg-emerald-950/25 border border-emerald-900/60 rounded-lg p-3">
            ✓ Все технические узлы согласованы. Схема не имеет прочностных противоречий и полностью удовлетворяет директивам ТЗ. Вы можете подать проект на государственные испытания.
          </div>
        )}
      </div>

      {/* Formula Explainer Modal */}
      {selectedFormula && formulaExplanations[selectedFormula] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-cyan-800 bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-cyan-300">
                {formulaExplanations[selectedFormula].title}
              </h4>
              <button
                onClick={() => setSelectedFormula(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1"
              >
                Закрыть [×]
              </button>
            </div>
            <div className="mt-4">
              <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-cyan-400 border border-cyan-950">
                {formulaExplanations[selectedFormula].formula}
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                {formulaExplanations[selectedFormula].explanation}
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedFormula(null)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
