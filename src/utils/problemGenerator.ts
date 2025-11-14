import type { Problem, OperationType, Difficulty } from '../types';

/**
 * 난이도에 따른 숫자 범위 반환 (세 자리 수 범위)
 */
const getNumberRange = (difficulty: Difficulty, type: OperationType): { min1: number; max1: number; min2: number; max2: number } => {
  if (type === 'multiplication') {
    switch (difficulty) {
      case 'easy':
        // 한 자리 × 한 자리 (2~5)
        return { min1: 2, max1: 5, min2: 2, max2: 5 };
      case 'medium':
        // 한 자리 × 한 자리 (2~9) 또는 두 자리 × 한 자리 (10~30 × 2~9)
        return { min1: 2, max1: 30, min2: 2, max2: 9 };
      case 'hard':
        // 두 자리 × 한 자리 또는 두 자리 × 두 자리 (결과가 세 자리 수 이내)
        return { min1: 10, max1: 99, min2: 2, max2: 10 };
    }
  } else {
    // division (세 자리 수 범위, 한 자리 나누기)
    switch (difficulty) {
      case 'easy':
        // 한 자리 나누기 (나누어떨어지는 경우, 두 자리 수)
        return { min1: 2, max1: 9, min2: 10, max2: 90 };
      case 'medium':
        // 한 자리 나누기 (나머지 있을 수 있음, 두~세 자리 수)
        return { min1: 2, max1: 9, min2: 20, max2: 200 };
      case 'hard':
        // 한 자리 나누기 (세 자리 수)
        return { min1: 2, max1: 9, min2: 100, max2: 999 };
    }
  }
};

/**
 * 랜덤 정수 생성
 */
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 곱셈 문제 생성
 */
const generateMultiplicationProblem = (difficulty: Difficulty): Problem => {
  const { min1, max1, min2, max2 } = getNumberRange(difficulty, 'multiplication');
  
  let operand1: number;
  let operand2: number;
  
  if (difficulty === 'easy') {
    operand1 = getRandomInt(min1, max1);
    operand2 = getRandomInt(min2, max2);
  } else if (difficulty === 'medium') {
    // 50% 확률로 한 자리 × 한 자리, 50% 확률로 두 자리 × 한 자리
    if (Math.random() < 0.5) {
      operand1 = getRandomInt(2, 9);
      operand2 = getRandomInt(2, 9);
    } else {
      operand1 = getRandomInt(10, 20);
      operand2 = getRandomInt(2, 5);
    }
  } else {
    operand1 = getRandomInt(min1, max1);
    operand2 = getRandomInt(min2, max2);
  }
  
  const answer = operand1 * operand2;
  
  // 실생활 문제 30% 확률
  const useRealLife = Math.random() < 0.3;
  let question: string;
  
  if (useRealLife) {
    const scenarios = [
      `사과가 한 상자에 ${operand1}개씩 들어있어요. ${operand2}상자에는 사과가 몇 개 있을까요?`,
      `한 줄에 학생이 ${operand1}명씩 있어요. ${operand2}줄이면 학생은 모두 몇 명일까요?`,
      `초콜릿이 한 봉지에 ${operand1}개씩 들어있어요. ${operand2}봉지에는 초콜릿이 몇 개 있을까요?`,
      `꽃이 한 다발에 ${operand1}송이씩 있어요. ${operand2}다발이면 꽃은 모두 몇 송이일까요?`,
      `연필이 한 묶음에 ${operand1}자루씩 있어요. ${operand2}묶음이면 연필은 모두 몇 자루일까요?`,
    ];
    question = scenarios[getRandomInt(0, scenarios.length - 1)];
  } else {
    question = `${operand1} × ${operand2} = ?`;
  }
  
  return {
    id: `mult_${Date.now()}_${Math.random()}`,
    type: 'multiplication',
    operand1,
    operand2,
    answer,
    question,
    difficulty,
    visualHelp: {
      type: ['blocks', 'fruits', 'animals'][getRandomInt(0, 2)] as 'blocks' | 'fruits' | 'animals',
      count: operand1,
      groups: operand2,
    },
  };
};

/**
 * 나눗셈 문제 생성
 */
const generateDivisionProblem = (difficulty: Difficulty): Problem => {
  const { min1, max1, max2 } = getNumberRange(difficulty, 'division');
  
  let divisor: number;
  let dividend: number;
  let quotient: number;
  let remainder: number;
  
  if (difficulty === 'easy') {
    // 나누어떨어지는 문제만
    divisor = getRandomInt(min1, max1);
    quotient = getRandomInt(2, Math.floor(max2 / divisor));
    dividend = divisor * quotient;
    remainder = 0;
  } else if (difficulty === 'medium') {
    // 70% 나누어떨어짐, 30% 나머지 있음
    divisor = getRandomInt(min1, max1);
    quotient = getRandomInt(2, Math.floor(max2 / divisor));
    dividend = divisor * quotient;
    
    if (Math.random() < 0.3) {
      remainder = getRandomInt(1, divisor - 1);
      dividend += remainder;
    } else {
      remainder = 0;
    }
  } else {
    // 두 자리 나누기
    divisor = getRandomInt(min1, max1);
    quotient = getRandomInt(2, Math.floor(max2 / divisor));
    dividend = divisor * quotient;
    
    // 50% 확률로 나머지 추가
    if (Math.random() < 0.5) {
      remainder = getRandomInt(1, divisor - 1);
      dividend += remainder;
    } else {
      remainder = 0;
    }
  }
  
  // 실생활 문제 30% 확률
  const useRealLife = Math.random() < 0.3;
  let question: string;
  
  if (useRealLife) {
    if (remainder === 0) {
      const scenarios = [
        `사탕 ${dividend}개를 ${divisor}명이 똑같이 나눠 가지려고 해요. 한 명당 몇 개씩 가질 수 있을까요?`,
        `학생 ${dividend}명을 한 모둠에 ${divisor}명씩 나누려고 해요. 모둠은 몇 개가 될까요?`,
        `빵 ${dividend}개를 한 상자에 ${divisor}개씩 담으려고 해요. 상자는 몇 개가 필요할까요?`,
        `꽃 ${dividend}송이를 한 다발에 ${divisor}송이씩 묶으려고 해요. 다발은 몇 개가 될까요?`,
      ];
      question = scenarios[getRandomInt(0, scenarios.length - 1)];
    } else {
      const scenarios = [
        `사탕 ${dividend}개를 ${divisor}명이 똑같이 나눠 가지려고 해요. 한 명당 몇 개씩 가질 수 있고, 몇 개가 남을까요?`,
        `빵 ${dividend}개를 한 상자에 ${divisor}개씩 담으려고 해요. 상자는 몇 개가 필요하고, 몇 개가 남을까요?`,
      ];
      question = scenarios[getRandomInt(0, scenarios.length - 1)];
    }
  } else {
    if (remainder === 0) {
      question = `${dividend} ÷ ${divisor} = ?`;
    } else {
      question = `${dividend} ÷ ${divisor} = ? (몫과 나머지를 구하세요)`;
    }
  }
  
  return {
    id: `div_${Date.now()}_${Math.random()}`,
    type: 'division',
    operand1: dividend,
    operand2: divisor,
    answer: quotient,
    remainder,
    question,
    difficulty,
    visualHelp: {
      type: ['blocks', 'fruits', 'animals'][getRandomInt(0, 2)] as 'blocks' | 'fruits' | 'animals',
      count: dividend,
      groups: divisor,
    },
  };
};

/**
 * 문제 생성 (타입과 난이도에 따라)
 */
export const generateProblem = (type: OperationType, difficulty: Difficulty): Problem => {
  if (type === 'multiplication') {
    return generateMultiplicationProblem(difficulty);
  } else {
    return generateDivisionProblem(difficulty);
  }
};

/**
 * 여러 문제 생성
 */
export const generateProblems = (type: OperationType, difficulty: Difficulty, count: number): Problem[] => {
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(generateProblem(type, difficulty));
  }
  return problems;
};

/**
 * 답안 확인
 */
export const checkAnswer = (problem: Problem, userAnswer: number, userRemainder?: number): boolean => {
  if (problem.type === 'division' && problem.remainder !== undefined && problem.remainder > 0) {
    return userAnswer === problem.answer && userRemainder === problem.remainder;
  }
  return userAnswer === problem.answer;
};

/**
 * 힌트 생성
 */
export const generateHints = (problem: Problem): string[] => {
  const hints: string[] = [];
  
  if (problem.type === 'multiplication') {
    hints.push(`${problem.operand1}을(를) ${problem.operand2}번 더하면 돼요!`);
    hints.push(`${problem.operand1} × ${problem.operand2}는 ${problem.operand1}이(가) ${problem.operand2}개 있는 거예요.`);
    
    // 구구단 힌트
    if (problem.operand1 <= 9 && problem.operand2 <= 9) {
      hints.push(`${problem.operand1}단을 생각해보세요!`);
    }
  } else {
    hints.push(`${problem.operand1}을(를) ${problem.operand2}씩 묶으면 몇 묶음이 될까요?`);
    hints.push(`${problem.operand2} × ? = ${problem.operand1}을 생각해보세요!`);
    
    if (problem.remainder && problem.remainder > 0) {
      hints.push(`나누어떨어지지 않으면 나머지가 생겨요!`);
    }
  }
  
  return hints;
};

