import { motion } from 'framer-motion';
import type { Problem } from '../types';

interface Props {
  problem: Problem;
}

const MAX_GROUPS_DISPLAY = 6;
const MAX_UNITS_DISPLAY = 12;

const themeMap = {
  blocks: {
    title: '블록으로 보기',
    description: '같은 수를 묶어 한눈에 봐요',
    chipClass: 'bg-blue-400',
    accent: 'from-sky-100 to-blue-100 border-blue-200',
    symbol: '🟦',
    labels: { multiplication: '묶음', division: '조각' },
  },
  fruits: {
    title: '과일로 나누기',
    description: '과일을 똑같이 나누어 보아요',
    chipClass: 'bg-pink-400',
    accent: 'from-pink-100 to-orange-100 border-pink-200',
    symbol: '🍎',
    labels: { multiplication: '바구니', division: '친구' },
  },
  animals: {
    title: '동물 친구 모으기',
    description: '친구들을 같은 크기로 모아요',
    chipClass: 'bg-emerald-400',
    accent: 'from-emerald-100 to-lime-100 border-emerald-200',
    symbol: '🐰',
    labels: { multiplication: '무리', division: '친구' },
  },
  default: {
    title: '도형으로 이해하기',
    description: '눈으로 수의 구조를 살펴봐요',
    chipClass: 'bg-purple-400',
    accent: 'from-purple-100 to-violet-100 border-purple-200',
    symbol: '◼️',
    labels: { multiplication: '묶음', division: '그룹' },
  },
} as const;

const VisualHelp = ({ problem }: Props) => {
  const theme =
    themeMap[problem.visualHelp?.type as keyof typeof themeMap] ?? themeMap.default;

  const renderUnits = (count: number, keyPrefix: string) => {
    const limit = Math.max(1, Math.min(count, MAX_UNITS_DISPLAY));
    const chips = Array.from({ length: limit }).map((_, index) => (
      <motion.span
        key={`${keyPrefix}-${index}`}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.02 }}
        className={`w-6 h-6 md:w-7 md:h-7 rounded-xl shadow-inner shadow-black/10 flex items-center justify-center text-xs text-white ${theme.chipClass}`}
      >
        {theme.symbol}
      </motion.span>
    ));

    if (count > limit) {
      chips.push(
        <span key={`${keyPrefix}-more`} className="text-xs text-gray-600 self-end">
          +{count - limit}
        </span>
      );
    }

    return chips;
  };

  const renderMultiplication = () => {
    const groupsToShow = Math.min(problem.operand2, MAX_GROUPS_DISPLAY);
  const label = theme.labels.multiplication;
  const extraGroups = Math.max(0, problem.operand2 - groupsToShow);

    return (
      <>
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from({ length: groupsToShow }).map((_, index) => (
            <motion.div
              key={`mul-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white/80 rounded-xl p-3 border-2 border-white shadow-inner"
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {label} {index + 1} ({problem.operand1}개)
              </p>
              <div className="flex flex-wrap gap-1 max-w-[160px]">
                {renderUnits(problem.operand1, `mul-chip-${index}`)}
              </div>
            </motion.div>
          ))}
          {extraGroups > 0 && (
            <motion.div
              key="mul-extra"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/70 rounded-xl p-3 border-2 border-dashed border-white text-xs text-gray-500 flex items-center justify-center min-w-[100px]"
            >
              + {extraGroups}개의 {label}
            </motion.div>
          )}
        </div>
      </>
    );
  };

  const renderDivision = () => {
    const total = problem.operand1;
    const groups = problem.operand2;
    const baseShare = Math.floor(total / groups);
    const remainder = problem.remainder ?? 0;
    const groupsToShow = Math.min(groups, MAX_GROUPS_DISPLAY);
  const label = theme.labels.division;
  const extraGroups = Math.max(0, groups - groupsToShow);

    return (
      <>
        <div className="flex flex-wrap gap-3 justify-center">
          {Array.from({ length: groupsToShow }).map((_, index) => (
            <motion.div
              key={`div-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white/80 rounded-xl p-3 border-2 border-white shadow-inner"
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">
                {label} {index + 1}
              </p>
              <div className="flex flex-wrap gap-1 max-w-[160px]">
                {renderUnits(baseShare, `div-chip-${index}`)}
              </div>
            </motion.div>
          ))}
          {extraGroups > 0 && (
            <motion.div
              key="div-extra"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/70 rounded-xl p-3 border-2 border-dashed border-white text-xs text-gray-500 flex items-center justify-center min-w-[100px]"
            >
              + {extraGroups}명의 {label}
            </motion.div>
          )}
        </div>
        {remainder > 0 && (
          <div className="mt-4 flex justify-center gap-1">{renderUnits(remainder, 'remainder')}</div>
        )}
      </>
    );
  };

  return (
    <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${theme.accent}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{theme.title}</h3>
        <p className="text-sm text-gray-600">{theme.description}</p>
      </div>

      <div className="max-h-[320px] overflow-y-auto px-2">
        {problem.type === 'multiplication' ? renderMultiplication() : renderDivision()}
      </div>

      <div className="mt-4 text-xs text-center text-gray-500">
        숫자가 커도 같은 방식으로 반복되니, 묶음 하나를 확실히 이해해 보세요.
      </div>
    </div>
  );
};

export default VisualHelp;
