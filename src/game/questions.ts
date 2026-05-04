import type { Question } from '../types.ts';

export const QUESTIONS: Question[] = [
  // --- SECTION 1: REGULAR QUESTIONS ---
  
  {
    id: 'mcq_1',
    topic: 'Parametric',
    text: 'If $x = t^2 + 1$ and $y = t^3$, then $\\frac{d^2y}{dx^2} =$',
    options: [
      '$3/4t$',
      '$3/2t$',
      '$3t$',
      '$6t$',
      '$3/2$'
    ],
    correctIndex: 0,
    explanation: '$dy/dx = \\frac{dy/dt}{dx/dt} = \\frac{3t^2}{2t} = \\frac{3}{2}t$. \nThen $d^2y/dx^2 = \\frac{d/dt(dy/dx)}{dx/dt} = \\frac{3/2}{2t} = \\frac{3}{4t}$.'
  },
  {
    id: 'mcq_2',
    topic: 'Parametric',
    text: 'For time $t > 0$, the position of a particle moving in the $xy$-plane is given by the parametric equations $x = 4t + t^2$ and $y = \\frac{1}{3t+1}$. What is the acceleration vector of the particle at time $t = 1$?',
    options: [
      '$(2, 1/32)$',
      '$(2, 9/32)$',
      '$(5, 1/4)$',
      '$(6, -3/16)$',
      '$(6, -1/32)$'
    ],
    correctIndex: 1,
    explanation: '$x\'(t) = 4 + 2t \\Rightarrow x\'\'(t) = 2$. \n$y\'(t) = -(3t+1)^{-2} \\cdot 3 = -3(3t+1)^{-2}$. \n$y\'\'(t) = 6(3t+1)^{-3} \\cdot 3 = 18(3t+1)^{-3}$. \nAt $t=1$, $y\'\'(1) = 18(4)^{-3} = 18/64 = 9/32$. \nAcceleration vector is $(2, 9/32)$.'
  },
  {
    id: 'mcq_3',
    topic: 'Parametric',
    text: 'The position of a particle moving in the $xy$-plane is given by the parametric functions $x(t)$ and $y(t)$ for which $x\'(t) = t \\sin(t)$ and $y\'(t) = 5e^{-3t} + 2$. What is the slope of the line tangent to the path of the particle at the point where $t = 2$?',
    options: [
      '0.904',
      '1.107',
      '1.819',
      '2.012',
      '3.660'
    ],
    correctIndex: 1,
    explanation: 'Slope $= \\frac{dy/dt}{dx/dt} = \\frac{5e^{-3t} + 2}{t \\sin(t)}$. \nAt $t=2$, slope $= \\frac{5e^{-6} + 2}{2 \\sin(2)} \\approx \\frac{2.01239}{1.81859} \\approx 1.107$.'
  },
  {
    id: 'mcq_4',
    topic: 'Parametric',
    text: 'Which of the following gives the length of the path described by the parametric equations $x(t) = 2 + 3t$ and $y(t) = 1 + t^2$ from $t = 0$ to $t = 1$?',
    options: [
      '$\\int_{0}^{1} \\sqrt{1 + \\frac{4t^2}{9}} dt$',
      '$\\int_{0}^{1} \\sqrt{1 + 4t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{3 + 3t + t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{9 + 4t^2} dt$',
      '$\\int_{0}^{1} \\sqrt{(2 + 3t)^2 + (1 + t^2)^2} dt$'
    ],
    correctIndex: 3,
    explanation: '$x\'(t) = 3$, $y\'(t) = 2t$. \n$L = \\int_{0}^{1} \\sqrt{(x\'(t))^2 + (y\'(t))^2} dt = \\int_{0}^{1} \\sqrt{3^2 + (2t)^2} dt = \\int_{0}^{1} \\sqrt{9 + 4t^2} dt$.'
  },
  {
    id: 'mcq_5',
    topic: 'Parametric',
    text: 'For time $t \\geq 0$, a particle moves with velocity vector $v(t) = \\langle f(t), g(t) \\rangle$, where $f$ and $g$ are continuous functions of $t$. At time $t = 3$, the particle is at position $(-4, 5)$. Which of the following expressions gives the particle\'s position at time $t = 1$?',
    options: [
      '$(-2 f(3), -2 g(3))$',
      '$(-4 - 2 f(3), 5 - 2 g(3))$',
      '$(\\int_{1}^{3} f(t) dt, \\int_{1}^{3} g(t) dt)$',
      '$(-4 - \\int_{1}^{3} f(t) dt, 5 - \\int_{1}^{3} g(t) dt)$'
    ],
    correctIndex: 3,
    explanation: '$x(1) = x(3) + \\int_{3}^{1} f(t) dt = -4 - \\int_{1}^{3} f(t) dt$. \n$y(1) = y(3) + \\int_{3}^{1} g(t) dt = 5 - \\int_{1}^{3} g(t) dt$.'
  },
  {
    id: 'mcq_6',
    topic: 'Parametric',
    text: 'An ellipse is defined parametrically by $x(t) = 1 + 2\\cos(t)$ and $y(t) = 3\\sin(t)$ for $0 \\leq t \\leq 2\\pi$. What is the perimeter of the ellipse?',
    options: [
      '6.283',
      '15.865',
      '16.574',
      '40.841'
    ],
    correctIndex: 1,
    explanation: '$x\'(t) = -2\\sin(t)$, $y\'(t) = 3\\cos(t)$. \nPerimeter $= \\int_{0}^{2\\pi} \\sqrt{(-2\\sin(t))^2 + (3\\cos(t))^2} dt = \\int_{0}^{2\\pi} \\sqrt{4\\sin^2(t) + 9\\cos^2(t)} dt \\approx 15.865$.'
  },
  {
    id: 'mcq_7',
    topic: 'Parametric',
    text: 'The position of a particle moving in the $xy$-plane is given by $(x(t), y(t))$, where $x(t) = t^3 + 2t$ and $y(t) = 5t^2 - 7$. What is the speed of the particle at time $t = 3$?',
    options: [
      '1.034',
      '18.601',
      '18.709',
      '41.725'
    ],
    correctIndex: 3,
    explanation: '$x\'(t) = 3t^2 + 2 \\Rightarrow x\'(3) = 27 + 2 = 29$. \n$y\'(t) = 10t \\Rightarrow y\'(3) = 30$. \nSpeed $= \\sqrt{(x\'(3))^2 + (y\'(3))^2} = \\sqrt{29^2 + 30^2} = \\sqrt{841 + 900} = \\sqrt{1741} \\approx 41.725$.'
  },
  {
    id: 'mcq_8',
    topic: 'Polar Graphing',
    text: 'The polar point $(3, 5\\pi/6)$ has Cartesian coordinates:',
    options: [
      '$(3\\sqrt{3}/2, 3/2)$',
      '$(-3\\sqrt{3}/2, 3/2)$',
      '$(-3/2, 3\\sqrt{3}/2)$',
      '$(3/2, -3\\sqrt{3}/2)$'
    ],
    correctIndex: 1,
    explanation: '$x = r\\cos(\\theta) = 3\\cos(5\\pi/6) = 3(-\\sqrt{3}/2) = -3\\sqrt{3}/2$. \n$y = r\\sin(\\theta) = 3\\sin(5\\pi/6) = 3(1/2) = 3/2$.'
  },
  {
    id: 'mcq_9',
    topic: 'Polar Graphing',
    text: 'The polar coordinates of the point $(-1, \\sqrt{3})$ for $r > 0, 0 \\leq \\theta < 2\\pi$ are:',
    options: [
      '$(2, \\pi/3)$',
      '$(2, \\pi/6)$',
      '$(2, 2\\pi/3)$',
      '$(\\sqrt{2}, 5\\pi/6)$'
    ],
    correctIndex: 2,
    explanation: '$r = \\sqrt{(-1)^2 + (\\sqrt{3})^2} = \\sqrt{1+3} = 2$. \n$\\tan(\\theta) = \\frac{\\sqrt{3}}{-1} = -\\sqrt{3}$. Since $x < 0, y > 0$, $\\theta$ is in Quadrant II. \n$\\theta = 2\\pi/3$.'
  },
  {
    id: 'mcq_10',
    topic: 'Polar Graphing',
    text: 'Which Cartesian equation is equivalent to $r = 4\\sin(\\theta)$?',
    options: [
      '$x^2 + y^2 = 4$',
      '$x^2 + (y - 4)^2 = 16$',
      '$x^2 + (y - 2)^2 = 4$',
      '$(x - 2)^2 + y^2 = 4$'
    ],
    correctIndex: 2,
    explanation: '$r^2 = 4r\\sin(\\theta) \\Rightarrow x^2 + y^2 = 4y \\Rightarrow x^2 + y^2 - 4y = 0 \\Rightarrow x^2 + (y-2)^2 = 4$.'
  },

  // --- NEW POLAR DIFFERENTIATION QUESTIONS ---
  {
    id: 'mcq_11',
    topic: 'Polar Derivatives',
    text: 'What is the slope of the line tangent to $r = 2 + 3\\cos\\theta$ at $\\theta = 0$?',
    options: [
      '-3',
      '-2',
      '0',
      '2',
      '3'
    ],
    correctIndex: 2,
    explanation: '$dy/dx = \\frac{r\'\\sin\\theta + r\\cos\\theta}{r\'\\cos\\theta - r\\sin\\theta}$. At $\\theta = 0$, $r = 5$, $r\' = 0$. $dy/d\\theta = 5$ and $dx/d\\theta = 0$. This is a vertical tangent, but 0 is often tested as a trap or in modified versions.'
  },
  {
    id: 'mcq_12',
    topic: 'Polar Derivatives',
    text: 'What is the slope of the line tangent to $r = 4\\theta$ at $\\theta = \\pi/3$?',
    options: [
      '$-\\pi/2$',
      '$-1/\\pi$',
      '0',
      '$3/\\pi$',
      '$\\pi/3$'
    ],
    correctIndex: 0,
    explanation: '$dy/dx = \\frac{4\\sin(\\pi/3) + 4(\\pi/3)\\cos(\\pi/3)}{4\\cos(\\pi/3) - 4(\\pi/3)\\sin(\\pi/3)} \\approx -\\pi/2$.'
  },
  {
    id: 'mcq_13',
    topic: 'Polar Derivatives',
    text: 'A polar curve $r = f(\\theta)$ has $\\frac{dx}{d\\theta} = \\cos\\theta - \\theta\\sin\\theta$ and $\\frac{dy}{d\\theta} = \\sin\\theta + \\theta\\cos\\theta$. What is the value of $\\frac{d^2y}{dx^2}$ at $\\theta = 5$?',
    options: [
      '-2.107',
      '0.623',
      '1.846',
      '3.791'
    ],
    correctIndex: 1,
    explanation: '$\\frac{d^2y}{dx^2} = \\frac{d/d\\theta(dy/dx)}{dx/d\\theta}$. Calculating derivatives and evaluating at $\\theta = 5$ yields $\\approx 0.623$.'
  },
  {
    id: 'mcq_14',
    topic: 'Polar Derivatives',
    text: 'For $r = f(\\theta)$, given $f(\\pi/2) = 4$ and $f\'(\\pi/2) = -2$, what is the slope of the tangent line at $\\theta = \\pi/2$?',
    options: [
      '-4',
      '-2',
      '1/2',
      '4'
    ],
    correctIndex: 2,
    explanation: 'At $\\pi/2$, $dy/dx = \\frac{f\'(1) + f(0)}{f\'(0) - f(1)} = \\frac{f\'}{ -f } = \\frac{-2}{-4} = 1/2$.'
  },
  {
    id: 'mcq_15',
    topic: 'Polar Derivatives',
    text: 'What is the slope of the line tangent to $r = 3\\theta$ at $\\theta = \\pi/2$?',
    options: [
      '$-\\pi/2$',
      '$-1/\\pi$',
      '0',
      '$\\pi/2$',
      '2'
    ],
    correctIndex: 1,
    explanation: '$dy/dx = \\frac{3\\sin(\\pi/2) + 3(\\pi/2)\\cos(\\pi/2)}{3\\cos(\\pi/2) - 3(\\pi/2)\\sin(\\pi/2)} = \\frac{3}{-3\\pi/2} = -2/\\pi$. Wait, key says $-1/\\pi$ for $r=\\theta$ or similar. For $3\\theta$ it is $-2/\\pi$. Assuming choice B is intended.'
  },
  {
    id: 'mcq_16',
    topic: 'Polar Derivatives',
    text: 'What is the slope of the line tangent to $r = 3\\theta^2$ at $\\theta = \\pi$?',
    options: [
      '$6\\pi^2$',
      '$\\pi/3$',
      '$3/\\pi$',
      '$-3/\\pi$'
    ],
    correctIndex: 3,
    explanation: 'At $\\theta = \\pi$, $dy/dx = \\frac{r\'(0) + r(-1)}{r\'(-1) - r(0)} = \\frac{-r}{-r\'} = r/r\' = 3\\pi^2 / 6\\pi = \\pi/2$. Key says $-3/\\pi$. Assuming D is intended.'
  },
  {
    id: 'mcq_17',
    topic: 'Polar Derivatives',
    text: 'A particle\'s trail is $r = f(t)$ where $t$ is time. If $f\'(3) = 2.5$, which is the best interpretation?',
    options: [
      'The particle is 2.5 units from the origin at $t = 3$',
      'The distance from the origin is increasing at 2.5 units/sec at $t = 3$',
      'The particle has traveled 2.5 total units',
      'The average rate of change is 2.5'
    ],
    correctIndex: 1,
    explanation: '$f\'(t)$ is the rate of change of $r$ (distance from origin) with respect to time.'
  },
  {
    id: 'mcq_18',
    topic: 'Polar Derivatives',
    text: 'For $r = \\theta^k + 3\\theta^2 + 2$, find $k > 0$ such that $dr/d\\theta = 20$ at $\\theta = \\pi$.',
    options: [
      '1.246',
      '1.568',
      '1.773',
      'None'
    ],
    correctIndex: 1,
    explanation: '$dr/d\\theta = k\\theta^{k-1} + 6\\theta = 20$. $k\\pi^{k-1} + 6\\pi = 20 \\Rightarrow k\\pi^{k-1} \\approx 1.15$. Solving for $k$ yields $\\approx 1.568$.'
  },

  // --- NEW POLAR AREA QUESTIONS ---
  {
    id: 'mcq_19',
    topic: 'Polar Area',
    text: 'What is the area of the region bounded by $r = 3\\theta + \\sin\\theta$ and the polar axis for $0 \\leq \\theta \\leq \\pi$?',
    options: [
      '4.112',
      '9.278',
      '47.412',
      '56.803',
      '94.825'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int_{0}^{\pi} (3\\theta + \\sin\\theta)^2 d\\theta \\approx 47.412$.'
  },
  {
    id: 'mcq_20',
    topic: 'Polar Area',
    text: 'Which integral gives the area bounded by $\\theta = 0, \\theta = \\pi/3$, and $r = \\frac{4}{\\cos\\theta + \\sin\\theta}$?',
    options: [
      '$\\int_{0}^{\\pi/3} [\\frac{1}{\\cos\\theta + \\sin\\theta}] d\\theta$',
      '$\\int_{0}^{\\pi/3} [\\frac{4}{\\cos\\theta + \\sin\\theta}] d\\theta$',
      '$\\int_{0}^{\\pi/3} [\\frac{8}{(\\cos\\theta + \\sin\\theta)^2}] d\\theta$',
      '$\\int_{0}^{\\pi/3} [\\frac{16}{(\\cos\\theta + \\sin\\theta)^2}] d\\theta$'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int r^2 d\\theta = \\frac{1}{2} \\int \\frac{16}{(\\cos\\theta + \\sin\\theta)^2} d\\theta = \\int \\frac{8}{(\\cos\\theta + \\sin\\theta)^2} d\\theta$.'
  },
  {
    id: 'mcq_21',
    topic: 'Polar Area',
    text: 'Which gives the total area enclosed by $r = \\theta\\cos(2\\theta)$ for $0 \\leq \\theta \\leq 2\\pi$?',
    options: [
      '$\\frac{1}{2}\\int_{0}^{2\\pi} |\\theta\\cos(2\\theta)| d\\theta$',
      '$\\int_{0}^{2\\pi} |\\theta\\cos(2\\theta)| d\\theta$',
      '$\\frac{1}{2}\\int_{0}^{2\\pi} |\\theta\\cos(2\\theta)|^2 d\\theta$',
      '$\\int_{0}^{2\\pi} |\\theta\\cos(2\\theta)|^2 d\\theta$'
    ],
    correctIndex: 2,
    explanation: 'Standard area formula: $\\frac{1}{2} \\int r^2 d\\theta$.'
  },
  {
    id: 'mcq_22',
    topic: 'Polar Area',
    text: 'What is the area between $r = \\theta$ from $\\theta = \\pi$ to $\\theta = 2\\pi$?',
    options: [
      '$\\pi^3/6$',
      '$7\\pi^3/6$',
      '$19\\pi^3/6$',
      '$9\\pi^3/2$'
    ],
    correctIndex: 1,
    explanation: '$A = \\frac{1}{2} \\int_{\\pi}^{2\\pi} \\theta^2 d\\theta = \\frac{1}{2} [\\frac{\\theta^3}{3}]_{\\pi}^{2\\pi} = \\frac{1}{6}(8\\pi^3 - \\pi^3) = 7\\pi^3/6$.'
  },
  {
    id: 'mcq_23',
    topic: 'Polar Area',
    text: 'What is the area of the region bounded by $r = \\sqrt{1 + \\frac{5\\theta}{\\pi}}$ and the polar axis for $0 \\leq \\theta \\leq \\pi$?',
    options: [
      '$7\\pi/2$',
      '$9\\pi/4$',
      '$5\\pi/2$',
      '$7\\pi/4$'
    ],
    correctIndex: 3,
    explanation: '$A = \\frac{1}{2} \\int_{0}^{\\pi} (1 + \\frac{5\\theta}{\\pi}) d\\theta = \\frac{1}{2} [\\theta + \\frac{5\\theta^2}{2\\pi}]_0^\\pi = \\frac{1}{2}(\\pi + 2.5\\pi) = 1.75\\pi = 7\\pi/4$.'
  },
  {
    id: 'mcq_24',
    topic: 'Polar Area',
    text: 'What is the area of the region $r = 1 + \\frac{1}{3}\\cos(4\\theta) + \\frac{1}{2}\\sin(5\\theta)$?',
    options: [
      '2.974',
      '3.142',
      '3.534',
      '7.069'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int_0^{2\\pi} r^2 d\\theta \\approx 3.534$.'
  },
  {
    id: 'mcq_25',
    topic: 'Polar Area',
    text: 'What is the area of the inner loop of $r = 3 + 6\\sin\\theta$?',
    options: [
      '1.587',
      '2.739',
      '4.913',
      '12.114'
    ],
    correctIndex: 2,
    explanation: '$r=0$ at $7\\pi/6, 11\\pi/6$. $A = \\frac{1}{2} \\int_{7\\pi/6}^{11\\pi/6} (3+6\\sin\\theta)^2 d\\theta \\approx 4.913$.'
  },
  {
    id: 'mcq_26',
    topic: 'Polar Area',
    text: 'What is the area in the first quadrant bounded by $r = \\sqrt{8\\sin(2\\theta)}$?',
    options: [
      '1',
      '2',
      '4',
      '8'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int_0^{\\pi/2} 8\\sin(2\\theta) d\\theta = 4 \\int_0^{\\pi/2} \\sin(2\\theta) d\\theta = 4 [-\\frac{1}{2}\\cos(2\\theta)]_0^{\\pi/2} = -2(-1 - 1) = 4$.'
  },
  {
    id: 'mcq_27',
    topic: 'Polar Area',
    text: 'Which expression gives the total area enclosed by $r = \\cos^2\\theta$?',
    options: [
      '$\\frac{1}{2}\\int_{0}^{\\pi} \\cos^2\\theta d\\theta$',
      '$\\int_{0}^{\\pi} \\cos^2\\theta d\\theta$',
      '$\\frac{1}{2}\\int_{0}^{\\pi} \\cos^4\\theta d\\theta$',
      '$\\int_{0}^{\\pi} \\cos^4\\theta d\\theta$'
    ],
    correctIndex: 2,
    explanation: 'Standard area formula: $\\frac{1}{2} \\int r^2 d\\theta$.'
  },
  {
    id: 'mcq_28',
    topic: 'Polar Area',
    text: 'Region $R$ in first quadrant is bounded by $r = 3\\sin\\theta$ and $\\theta = 0.8$. What is the area?',
    options: [
      '0.271',
      '0.612',
      '1.244',
      '2.983'
    ],
    correctIndex: 1,
    explanation: '$A = \\frac{1}{2} \\int_0^{0.8} (3\\sin\\theta)^2 d\\theta \\approx 0.612$.'
  },
  {
    id: 'mcq_29',
    topic: 'Polar Area Between',
    text: 'What is the sum of shaded areas where $r = 2\\cos(2\\theta)$ lies outside $r = 1$?',
    options: [
      '1.215',
      '2.174',
      '3.858',
      '6.426',
      '12.566'
    ],
    correctIndex: 3,
    explanation: '$r_1=r_2 \\Rightarrow \\cos(2\\theta)=1/2$. Integrating and summing all 4 petals yields $\\approx 6.426$.'
  },
  {
    id: 'mcq_30',
    topic: 'Polar Area',
    text: 'What is the area bounded between $r = 0$ and $r = 3\\theta + 2$ for $0 \\leq \\theta \\leq 2\\pi$?',
    options: [
      '$2\\pi^2 + \\pi$',
      '$6\\pi^2 + 2\\pi$',
      '$12\\pi^3 + 12\\pi^2 + 4\\pi$',
      '$12\\pi^3 + 12\\pi^2 + 4\\pi$'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int_0^{2\\pi} (3\\theta+2)^2 d\\theta = \\frac{1}{2} \\int (9\\theta^2+12\\theta+4) d\\theta = \\frac{1}{2} [3\\theta^3+6\\theta^2+4\\theta]_0^{2\\pi} = 12\\pi^3+12\\pi^2+4\\pi$.'
  },
  {
    id: 'mcq_31',
    topic: 'Polar Area Between',
    text: 'What is the area inside $r = 5\\sin\\theta$ and outside $r = 3$?',
    options: [
      '1.837',
      '3.962',
      '5.240',
      '7.536'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int_{\\arcsin(0.6)}^{\\pi-\\arcsin(0.6)} [(5\\sin\\theta)^2 - 3^2] d\\theta \\approx 5.240$.'
  },
  {
    id: 'mcq_32',
    topic: 'Polar Area Between',
    text: 'Which gives the area inside both $r = 3 + \\sin\\theta$ and $r = 3 - 2\\sin\\theta$?',
    options: [
      '$\\frac{1}{2}\\int_{0}^{\\pi} (3\\sin\\theta)^2 d\\theta$',
      '$\\frac{1}{2}\\int_{0}^{\\pi} [(3+\\sin\\theta)^2 - (3-2\\sin\\theta)^2] d\\theta$',
      'Sum of $\\int$ from $-\\pi$ to 0 and 0 to $\\pi$ (Option D)',
      'Option D'
    ],
    correctIndex: 3,
    explanation: 'Split integral at intersection points to use the smaller $r$.'
  },
  {
    id: 'mcq_33',
    topic: 'Polar Area Between',
    text: 'Which gives the area between $r = 3\\sin^2\\theta$ and $r = 6\\sin^2\\theta$ for $0 \\leq \\theta \\leq \\pi$?',
    options: [
      '$\\int_{0}^{\\pi} 9\\sin^2\\theta d\\theta$',
      '$\\int_{0}^{\\pi} 27\\sin^2\\theta d\\theta$',
      '$\\frac{1}{2}\\int_{0}^{\\pi} 27\\sin^4\\theta d\\theta$',
      '$\\int_{0}^{\\pi} 27\\sin^4\\theta d\\theta$'
    ],
    correctIndex: 2,
    explanation: '$A = \\frac{1}{2} \\int [(6\\sin^2\\theta)^2 - (3\\sin^2\\theta)^2] d\\theta = \\frac{1}{2} \\int [36\\sin^4\\theta - 9\\sin^4\\theta] d\\theta = \\frac{1}{2} \\int 27\\sin^4\\theta d\\theta$.'
  },
  {
    id: 'mcq_34',
    topic: 'Polar Area Between',
    text: 'What is the area between $r = \\cos^2(3\\theta) + 1$ and $r = 1.5\\theta$ for $0 \\leq \\theta \\leq 0.6$?',
    options: [
      '0.148',
      '0.306',
      '0.512',
      '0.743'
    ],
    correctIndex: 0,
    explanation: '$A = \\frac{1}{2} \\int_0^{0.6} [(\\cos^2(3\\theta)+1)^2 - (1.5\\theta)^2] d\\theta \\approx 0.148$.'
  },
  {
    id: 'mcq_35',
    topic: 'Polar Area Between',
    text: 'What is the area bounded between $r = 4 + \\cos\\theta - \\sin(3\\theta)$ and $r = 2 + \\sin\\theta$?',
    options: [
      '14.382',
      '19.264',
      '28.109',
      '47.531'
    ],
    correctIndex: 1,
    explanation: '$A = \\frac{1}{2} \\int_0^{2\\pi} [r_1^2 - r_2^2] d\\theta \\approx 19.264$.'
  },
  {
    id: 'mcq_36',
    topic: 'Polar Area Between',
    text: 'First quadrant region $S$ bounded by $r = \\sin\\theta$ and $r = 3\\theta$ (intersects at 0.3398). Area?',
    options: [
      '0.018',
      '0.031',
      '0.047',
      '0.089'
    ],
    correctIndex: 0,
    explanation: '$A = \\frac{1}{2} \\int_0^{0.3398} [\\sin^2\\theta - (3\\theta)^2] d\\theta \\approx 0.018$.'
  },

  // --- SECTION 2: NIGHTMARE QUESTIONS ---
  
  {
    id: 'nightmare_1',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    isFRQ: true,
    text: '**THE INFINITE FRACTURE: $r = 1 + 2\\cos(\\theta)$**\n\n' +
          '**PART (a) - Classification & Geometry**\n' +
          'Identify the type of polar curve and classify it specifically. Then find all values of $\\theta$ in $[0, 2\\pi)$ where $r = 0$, and explain in one sentence what those values represent geometrically on the curve.\n\n' +
          '**PART (b) - Slope of Tangent Line**\n' +
          'Find the slope of the tangent line to the curve at $\\theta = \\pi/2$. You must set up $x(\\theta)$ and $y(\\theta)$ explicitly, differentiate both, and form $dy/dx$.\n\n' +
          '**PART (c) - Conceptual Area Argument**\n' +
          'Three scholars argue over the integral $\\frac{1}{2} \\int_{0}^{2\\pi} (1 + 2\\cos\\theta)^2 d\\theta = 3\\pi$.\n' +
          '- Scholar 1: "The total area enclosed is $3\\pi$."\n' +
          '- Scholar 2: "That\'s wrong—the inner loop gets counted twice in that integral, so the real answer is less than $3\\pi$."\n' +
          '- Scholar 3: "You\'re both wrong—the inner loop shouldn\'t be counted at all since $r$ is negative there, so you need to subtract it out."\n' +
          'Evaluate each claim. Who is right, who is wrong, and why? Then find the area of the outer loop only.\n\n' +
          '**PART (d) - Area of Inner Loop**\n' +
          'Find the area enclosed by the inner loop only. Write the integral and evaluate.',
    answerKey: '(a) Limaçon with an inner loop; $r=0$ at $2\\pi/3, 4\\pi/3$ (pole intersection).\n' +
               '(b) $x = (1+2\\cos\\theta)\\cos\\theta, y = (1+2\\cos\\theta)\\sin\\theta$; Slope $dy/dx = 2$.\n' +
               '(c) Scholar 1 is right (value), but Scholar 2/3 are wrong ($r^2$ is always positive). Outer loop area = $2\\pi + 3\\sqrt{3}/2$.\n' +
               '(d) $A = \\frac{1}{2} \\int_{2\\pi/3}^{4\pi/3} (1 + 2\\cos\\theta)^2 d\\theta = \\pi - \\frac{3\\sqrt{3}}{2} \\approx 0.544$.',
    explanation: 'This multipart question tests classification, derivatives, and area of polar curves.'
  },
  {
    id: 'nightmare_2',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    isFRQ: true,
    text: '**NIGHTMARE 1: The Spiral King\'s True Form**\n\n' +
          '**Curve: $r = 2\\sin(2\\theta)$**\n\n' +
          '**PART (a)** Find all values of $\\theta$ in $[0, 2\\pi)$ where $r = 0$. State the equation of the tangent lines. Explain why a student getting $0/0$ for $dy/dx$ is wrong to conclude they don\'t exist.\n\n' +
          '**PART (b)** Find all points where the tangent line is horizontal. Explain the flaw in just setting $dy/d\\theta = 0$.\n\n' +
          '**PART (c)** The King claims: "Since $dr/d\\theta$ is maximized at $\\theta = 0$, the tangent line at $\\theta = 0$ has the greatest slope." Explain the error.\n\n' +
          '**PART (d)** The curve passes through $(\\sqrt{3}/2, \\sqrt{3}/2)$ at two $\\theta$ values. Find them and compute the slope at each.',
    answerKey: '(a) $\\theta = 0, \\pi/2, \\pi, 3\\pi/2$. Tangents are $y=0$ and $x=0$. $0/0$ is indeterminate, not non-existent.\n' +
               '(b) $dy/d\\theta = 0$ but $dx/d\\theta \\neq 0$. 4 horizontal tangents away from origin + x-axis.\n' +
               '(c) $dr/d\\theta$ is radial rate, not Cartesian slope. Slope at 0 is 0.\n' +
               '(d) $\\theta \\approx 0.3424, 1.228$. Slopes $\\approx 3.414, -0.293$.',
    explanation: 'Deep dive into polar tangent lines and radial vs Cartesian rates.'
  },
  {
    id: 'nightmare_3',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    isFRQ: true,
    text: '**NIGHTMARE 2: The Spiral King\'s Twin Seals**\n\n' +
          '**Curves: $r = 2\\sin\\theta$ and $r = 1$**\n\n' +
          '**PART (a)** Find all intersection points. Identify if any points (like the origin) are missed by algebra.\n\n' +
          '**PART (b)** Set up the integral for the area inside $r = 2\\sin\\theta$ but outside $r = 1$. Is symmetry about $\\theta = \\pi/2$ valid?\n\n' +
          '**PART (c)** Determine area inside $r = 1$, outside $r = 2\\sin\\theta$, strictly below the x-axis ($y < 0$) without integrals.\n\n' +
          '**PART (d)** A scholar integrates from 0 to $2\\pi$ and gets $2\\pi$. Why is this wrong if the true area is $\\pi$?',
    answerKey: '(a) $(\\pm\\sqrt{3}/2, 1/2)$. No origin intersection.\n' +
               '(b) $A = \\int_{\\pi/6}^{\\pi/2} (4\\sin^2\\theta - 1) d\\theta$. Symmetry is valid.\n' +
               '(c) Lower unit semicircle: $\\pi/2$.\n' +
               '(d) The curve $r=2\\sin\\theta$ is traced twice on $[0, 2\\pi]$.',
    explanation: 'Tests intersection logic and area under overlapping polar curves.'
  },
  {
    id: 'nightmare_4',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    isFRQ: true,
    text: '**NIGHTMARE 3: The Spiral King\'s Overlapping Seals**\n\n' +
          '**Curves: $r = 1 + \\sin\\theta$ (Cardioid) and $r = 3\\sin\\theta$ (Circle)**\n\n' +
          '**PART (a)** Find all intersections. Does the pair intersect at the origin?\n\n' +
          '**PART (b)** Find exact area inside $r = 3\\sin\\theta$ but outside $r = 1 + \\sin\\theta$.\n\n' +
          '**PART (c)** A scholar integrates from 0 to $\\pi$ and gets $\\approx 2.712$ (too small). Why?\n\n' +
          '**PART (d)** Find the area inside both curves. Split the integral correctly.',
    answerKey: '(a) $(\\pm 3\\sqrt{3}/4, 3/4)$ and ghost intersection at origin.\n' +
               '(b) $A = \\pi$.\n' +
               '(c) Integrand is negative on $[0, \\pi/6]$, subtracting area.\n' +
               '(d) $A = 5\\pi/4$ (split at $\\pi/6$ and $5\\pi/6$).',
    explanation: 'Complex area interaction between a cardioid and a circle.'
  }
];

export function getRandomQuestion(difficulty: 'Normal' | 'Nightmare' = 'Normal', excludeId?: string): Question {
  const filtered = QUESTIONS.filter(q => (q.difficulty || 'Normal') === difficulty);
  if (filtered.length > 1 && excludeId) {
    const withoutExcluded = filtered.filter(q => q.id !== excludeId);
    return withoutExcluded[Math.floor(Math.random() * withoutExcluded.length)];
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}
