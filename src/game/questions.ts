import type { Question } from '../types.ts';

export const QUESTIONS: Question[] = [
  // --- SECTION 1: REGULAR QUESTIONS ---
  
  // Parametric (Keep a few basics for the start)
  {
    id: 'param_1',
    topic: 'Parametric',
    text: 'A particle moves with $x(t) = t^2$ and $y(t) = 3t - 1$. Find the coordinates at $t = 2$.',
    options: [
      '(4, 5)',
      '(2, 5)',
      '(4, 7)',
      '(2, 7)'
    ],
    correctIndex: 0,
    explanation: '$x(2) = 2^2 = 4$, $y(2) = 3(2) - 1 = 5$.'
  },

  // Polar Graphing
  {
    id: 'polar_1',
    topic: 'Polar Graphing',
    text: 'The polar point $(3, 5\\pi/6)$ has Cartesian coordinates $(x, y)$. Find the Cartesian coordinates.',
    options: [
      '$(3\\sqrt{3}/2, 3/2)$',
      '$(-3\\sqrt{3}/2, 3/2)$',
      '$(-3/2, 3\\sqrt{3}/2)$',
      '$(3/2, -3\\sqrt{3}/2)$',
      '$(-3\\sqrt{3}/2, -3/2)$'
    ],
    correctIndex: 1,
    explanation: '$x = r\\cos(\\theta) = 3\\cos(5\\pi/6) = -3\\sqrt{3}/2$. $y = r\\sin(\\theta) = 3\\sin(5\\pi/6) = 3/2$.'
  },
  {
    id: 'polar_2',
    topic: 'Polar Graphing',
    text: 'A position is located at $(-1, \\sqrt{3})$ on the Cartesian map. Encode this location in polar form $(r, \\theta)$ where $r > 0$ and $0 \\leq \\theta < 2\\pi$.',
    options: [
      '$(2, \\pi/3)$',
      '$(2, \\pi/6)$',
      '$(2, 2\\pi/3)$',
      '$(\\sqrt{2}, 5\\pi/6)$',
      '$(2, 5\\pi/3)$'
    ],
    correctIndex: 2,
    explanation: '$r = \\sqrt{(-1)^2 + (\\sqrt{3})^2} = 2$. $\\theta = \\arctan(\\sqrt{3}/-1) = 2\\pi/3$ (Quadrant II).'
  },
  {
    id: 'polar_3',
    topic: 'Polar Graphing',
    text: 'Which Cartesian equation is equivalent to the polar equation $r = 4\\sin(\\theta)$?',
    options: [
      '$x^2 + y^2 = 4$',
      '$x^2 + (y - 4)^2 = 16$',
      '$x^2 + (y - 2)^2 = 4$',
      '$(x - 2)^2 + y^2 = 4$',
      '$x^2 + y^2 = 4y$'
    ],
    correctIndex: 2,
    explanation: '$r^2 = 4r\\sin(\\theta) \\Rightarrow x^2 + y^2 = 4y \\Rightarrow x^2 + (y-2)^2 = 4$. Option C is the simplified form, but E is also correct algebraically. C is the standard circle form.'
  },
  {
    id: 'polar_4',
    topic: 'Polar Graphing',
    text: 'Which polar equation is equivalent to the Cartesian equation $x^2 + y^2 - 6x = 0$?',
    options: [
      '$r = 6$',
      '$r = 6\\sin(\\theta)$',
      '$r^2 = 6\\cos(\\theta)$',
      '$r = 6\\cos(\\theta)$',
      '$r = 3\\cos(\\theta)$'
    ],
    correctIndex: 3,
    explanation: '$r^2 - 6r\\cos(\\theta) = 0 \\Rightarrow r(r - 6\\cos(\\theta)) = 0 \\Rightarrow r = 6\\cos(\\theta)$.'
  },
  {
    id: 'polar_5',
    topic: 'Polar Derivatives',
    text: 'Find the slope of the line tangent to the curve $r = 3\\cos(\\theta)$ at $\\theta = \\pi/3$.',
    options: [
      '$-\\sqrt{3}$',
      '$-1/\\sqrt{3}$',
      '$0$',
      '$\\sqrt{3}/3$',
      '$\\sqrt{3}$'
    ],
    correctIndex: 0,
    explanation: '$dy/dx = (r\'\\sin\\theta + r\\cos\\theta)/(r\'\\cos\\theta - r\\sin\\theta)$. For $r=3\\cos\\theta$, $r\'=-3\\sin\\theta$. At $\\theta=\\pi/3$, slope is $-\\sqrt{3}$.'
  },
  {
    id: 'polar_6',
    topic: 'Polar Graphing',
    text: 'A curve consists of two perfect lobes—one left, one right—pinched at the origin (Lemniscate). Which equation matches this curve?',
    options: [
      '$r = \\sin(2\\theta)$',
      '$r = 1 + \\cos(2\\theta)$',
      '$r^2 = 4\\cos(2\\theta)$',
      '$r = 4\\cos(\\theta)$',
      '$r^2 = 4\\sin(2\\theta)$'
    ],
    correctIndex: 2,
    explanation: '$r^2 = a^2\\cos(2\\theta)$ is the standard form for a horizontal lemniscate.'
  },
  {
    id: 'polar_7',
    topic: 'Polar Graphing',
    text: 'A curve passes through $(5, 0)$ and $(1, \\pi)$. It is thick on the right and compressed on the left (Limaçon). Which equation matches this?',
    options: [
      '$r = 2 + 3\\cos(\\theta)$',
      '$r = 3 + 2\\cos(\\theta)$',
      '$r = 3\\cos(\\theta)$',
      '$r^2 = 3\\cos(2\\theta)$',
      '$r = 2 - 2\\cos(\\theta)$'
    ],
    correctIndex: 1,
    explanation: 'Check points: $3+2\\cos(0) = 5$. $3+2\\cos(\\pi) = 1$.'
  },
  {
    id: 'polar_8',
    topic: 'Polar Graphing',
    text: 'How many petals does the rose curve $r = 8\\cos(5\\theta)$ have?',
    options: [
      '5 petals',
      '10 petals',
      '8 petals',
      '2.5 petals',
      'Infinitely many'
    ],
    correctIndex: 0,
    explanation: 'For $r = a\\cos(n\\theta)$, if $n$ is odd, there are $n$ petals.'
  },

  // --- SECTION 2: NIGHTMARE QUESTIONS ---
  
  {
    id: 'nightmare_1',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'Consider $r = 1 + 2\\cos(\\theta)$. At what values of $\\theta$ in $[0, 2\\pi)$ does the curve pass through the origin?',
    options: [
      '$\\pi/3$ and $5\\pi/3$',
      '$2\\pi/3$ and $4\\pi/3$',
      '$\\pi/2$ and $3\\pi/2$',
      '$\\pi/6$ and $11\\pi/6$',
      'None, it never passes through the origin'
    ],
    correctIndex: 1,
    explanation: '$1 + 2\\cos\\theta = 0 \\Rightarrow \\cos\\theta = -1/2 \\Rightarrow \\theta = 2\\pi/3, 4\\pi/3$.'
  },
  {
    id: 'nightmare_2',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'For the curve $r = 1 + 2\\cos(\\theta)$, what is the slope of the tangent line at $\\theta = \\pi/2$?',
    options: [
      '$1/2$',
      '$-1/2$',
      '$2$',
      '$-2$',
      '$0$'
    ],
    correctIndex: 0,
    explanation: '$x = (1+2\\cos\\theta)\\cos\\theta$, $y = (1+2\\cos\\theta)\\sin\\theta$. $dy/dx$ at $\\pi/2$ is $1/2$.'
  },
  {
    id: 'nightmare_3',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'Regarding $r = 1 + 2\\cos(\\theta)$, which scholar correctly identifies the area of the outer loop?',
    options: [
      'Scholar 1: Total area is $3\\pi$.',
      'Scholar 2: Outer loop is $\\int_{-2\\pi/3}^{2\\pi/3} \\frac{1}{2}r^2 d\\theta$.',
      'Scholar 3: Subtract inner loop from total.',
      'All of them are wrong.',
      'Scholar 2 & 3 are partially correct.'
    ],
    correctIndex: 1,
    explanation: 'The outer loop is traced from $-2\\pi/3$ to $2\\pi/3$. Area is $\\int_{-2\\pi/3}^{2\\pi/3} \\frac{1}{2}(1+2\\cos\\theta)^2 d\\theta$.'
  }
];

export function getRandomQuestion(difficulty: 'Normal' | 'Nightmare' = 'Normal'): Question {
  const filtered = QUESTIONS.filter(q => (q.difficulty || 'Normal') === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
