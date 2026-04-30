import { Question, Topic } from '../types.ts';

export const QUESTIONS: Question[] = [
  // Parametric
  {
    id: 'param_1',
    topic: 'Parametric',
    text: 'What is 1 + 1?',
    options: [
      '2',
      '3',
      '4',
      '5'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'param_2',
    topic: 'Parametric',
    text: 'What is 2 + 2?',
    options: [
      '4',
      '5',
      '6',
      '7'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'param_3',
    topic: 'Parametric',
    text: 'What is 3 + 3?',
    options: [
      '6',
      '7',
      '8',
      '9'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  
  // Polar Graphing
  {
    id: 'polar_graph_1',
    topic: 'Polar Graphing',
    text: 'What is 4 + 4?',
    options: [
      '8',
      '9',
      '10',
      '11'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'polar_graph_2',
    topic: 'Polar Graphing',
    text: 'What is 5 + 5?',
    options: [
      '10',
      '11',
      '12',
      '13'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },

  // Polar Derivatives
  {
    id: 'polar_deriv_1',
    topic: 'Polar Derivatives',
    text: 'What is 6 + 6?',
    options: [
      '12',
      '13',
      '14',
      '15'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'polar_deriv_2',
    topic: 'Polar Derivatives',
    text: 'What is 7 + 7?',
    options: [
      '14',
      '15',
      '16',
      '17'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },

  // Polar Area
  {
    id: 'polar_area_1',
    topic: 'Polar Area',
    text: 'What is 8 + 8?',
    options: [
      '16',
      '17',
      '18',
      '19'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'polar_area_2',
    topic: 'Polar Area',
    text: 'What is 9 + 9?',
    options: [
      '18',
      '19',
      '20',
      '21'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },

  // Polar Area Between
  {
    id: 'polar_area_btn_1',
    topic: 'Polar Area Between',
    text: 'What is 10 + 10?',
    options: [
      '20',
      '21',
      '22',
      '23'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'polar_area_btn_2',
    topic: 'Polar Area Between',
    text: 'What is 11 + 11?',
    options: [
      '22',
      '23',
      '24',
      '25'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  // Nightmare Questions
  {
    id: 'nightmare_1',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'What is 100 + 100?',
    options: [
      '200',
      '300',
      '400',
      '500'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'nightmare_2',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'What is 200 + 200?',
    options: [
      '400',
      '500',
      '600',
      '700'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  },
  {
    id: 'nightmare_3',
    topic: 'Nightmare',
    difficulty: 'Nightmare',
    text: 'What is 500 + 500?',
    options: [
      '1000',
      '1500',
      '2000',
      '2500'
    ],
    correctIndex: 0,
    explanation: 'Basic math.'
  }
];

export function getRandomQuestion(difficulty: 'Normal' | 'Nightmare' = 'Normal'): Question {
  const filtered = QUESTIONS.filter(q => (q.difficulty || 'Normal') === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
