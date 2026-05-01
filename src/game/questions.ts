import type { Question } from '../types.ts';

export const QUESTIONS: Question[] = [
  // --- SECTION 1: REGULAR QUESTIONS ---
  
  // --- SECTION 1: PARAMETRIC QUESTIONS ---
  {
    id: 'param_1',
    topic: 'Parametric',
    text: 'If $x = t^2 + 1$ and $y = t^3$, find the expression for $d^2y/dx^2$ in terms of $t$.',
    options: [
      '$3/4t$',
      '$3/2t$',
      '$3t$',
      '$6t$',
      '$3/2$'
    ],
    correctIndex: 0,
    explanation: '$dy/dx = (3t^2)/(2t) = 1.5t$. Then $d^2y/dx^2 = (d/dt(1.5t))/(dx/dt) = 1.5 / 2t = 3/4t$.'
  },
  {
    id: 'param_2',
    topic: 'Parametric',
    text: 'Find the acceleration vector of a particle at $t = 1$ if $x = 4t + t^2$ and $y = 1 / (3t + 1)$.',
    options: [
      '$(2, 1/8)$',
      '$(2, 9/32)$',
      '$(5, 1/4)$',
      '$(6, -3/16)$',
      '$(6, -1/8)$'
    ],
    correctIndex: 1,
    explanation: '$x\'\' = 2$, $y\'\' = 18/(3t+1)^3$. At $t=1$, $y\'\' = 18/64 = 9/32$.'
  },
  {
    id: 'param_3',
    topic: 'Parametric',
    text: 'A particle has $x\'(t) = t \\sin(t)$ and $y\'(t) = 5e^{-3t} + 2$. What is the slope of the tangent line at $t = 2$?',
    options: [
      '0.904',
      '1.107',
      '1.819',
      '2.012',
      '3.660'
    ],
    correctIndex: 1,
    explanation: 'Slope $= y\'(2)/x\'(2) = (5e^{-6} + 2) / (2\\sin(2)) \\approx 1.107$.'
  },
  {
    id: 'param_4',
    topic: 'Parametric',
    text: 'Which integral gives the length of the path for $x(t) = 2 + 3t$ and $y(t) = 1 + t^2$ from $t = 0$ to $t = 1$?',
    options: [
      '$\\int_{0}^{1} \\sqrt{1 + \\frac{4t^2}{9}} dt$',
      '$\\int_{0}^{1} \\sqrt{1 + 4t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{3 + 3t + t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{9 + 4t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{(2 + 3t)^2 + (1 + t^2)^2} dt$'
    ],
    correctIndex: 3,
    explanation: '$L = \\int \\sqrt{(dx/dt)^2 + (dy/dt)^2} dt = \\int \\sqrt{3^2 + (2t)^2} dt$.'
  },
  {
    id: 'param_5',
    topic: 'Parametric',
    text: 'A particle moves with velocity $v(t) = (f(t), g(t))$. At $t = 3$, it is at $(-4, 5)$. Which represents the position at $t = 1$?',
    options: [
      '$(-2f(3), -2g(3))$',
      '$(-4 - 2f(3), 5 - 2g(3))$',
      '$(\\int_{1}^{3} f(t) dt, \\int_{1}^{3} g(t) dt)$',
      '$(-4 - \\int_{1}^{3} f(t) dt, 5 - \\int_{1}^{3} g(t) dt)$',
      '$(-4 + \\int_{1}^{3} f(t) dt, 5 + \\int_{1}^{3} g(t) dt)$'
    ],
    correctIndex: 3,
    explanation: '$P(1) = P(3) + \\int_3^1 v(t) dt = P(3) - \\int_1^3 v(t) dt$.'
  },
  {
    id: 'param_6',
    topic: 'Parametric',
    text: 'What is the perimeter of the ellipse $x(t) = 1 + 2\\cos(t)$ and $y(t) = 3\\sin(t)$ for $0 \\leq t \\leq 2\\pi$?',
    options: [
      '6.283',
      '15.865',
      '16.574',
      '40.841'
    ],
    correctIndex: 1,
    explanation: 'Using the arc length integral: $\\int_0^{2\\pi} \\sqrt{(-2\\sin t)^2 + (3\\cos t)^2} dt \\approx 15.865$.'
  },
  {
    id: 'param_7',
    topic: 'Parametric',
    text: 'The position of a particle is $x(t) = t^3 + 2t$ and $y(t) = 5t^2 - 7$. What is the speed of the particle at $t = 3$?',
    options: [
      '1.034',
      '18.601',
      '18.709',
      '41.725'
    ],
    correctIndex: 3,
    explanation: 'Speed $= \\sqrt{(3(3)^2+2)^2 + (10(3))^2} = \\sqrt{29^2 + 30^2} \\approx 41.725$.'
  },
  {
    id: 'param_8',
    topic: 'Parametric',
    text: 'An object travels along $x = 3\\cos(t), y = 4\\sin(t)$. At $t = 13$, it leaves on a tangent line. What is the slope of that line?',
    options: [
      '$-4/3$',
      '$-3/4$',
      '$(4 \\tan(13)) / 3$',
      '$-4 / (3 \\tan(13))$',
      '$(3 \\tan(13)) / 4$'
    ],
    correctIndex: 3,
    explanation: '$dy/dx = (4\\cos(13)) / (-3\\sin(13)) = -4/(3\\tan(13))$.'
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
  },
  {
    id: 'nightmare_parametric_1',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'A particle moves with $dx/dt = (6/t - 3)^{1/3}$ and $dy/dt = t e^{-t}$. At what time $t$ is the particle farthest to the right?',
    options: [
      '$t = 1$',
      '$t = 2$',
      '$t = 3$',
      '$t = e$',
      'Never'
    ],
    correctIndex: 1,
    explanation: 'Farthest right when $dx/dt = 0$ and switches from positive to negative. $6/t - 3 = 0 \\Rightarrow t = 2$.'
  },
  {
    id: 'nightmare_parametric_2',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'If $P(3) = (5, 4)$ and $dx/dt = (6/t - 3)^{1/3}$, which integral finds the x-coordinate when the particle is farthest right ($t=2$)?',
    options: [
      '$5 + \\int_{2}^{3} (6/t - 3)^{1/3} dt$',
      '$5 - \\int_{2}^{3} (6/t - 3)^{1/3} dt$',
      '$\\int_{2}^{3} (6/t - 3)^{1/3} dt$',
      '$5 + \\int_{3}^{2} (6/t - 3)^{1/3} dt$',
      'None of these'
    ],
    correctIndex: 1,
    explanation: '$x(2) = x(3) + \\int_3^2 x\'(t) dt = 5 - \\int_2^3 x\'(t) dt$.'
  }
];

export function getRandomQuestion(difficulty: 'Normal' | 'Nightmare' = 'Normal'): Question {
  const filtered = QUESTIONS.filter(q => (q.difficulty || 'Normal') === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
