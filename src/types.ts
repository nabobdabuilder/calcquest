export type Topic = 'Parametric' | 'Polar Graphing' | 'Polar Derivatives' | 'Polar Area' | 'Polar Area Between' | 'Nightmare';

export interface Question {
  id: string;
  topic: Topic;
  text: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  difficulty?: 'Normal' | 'Nightmare';
  isFRQ?: boolean;
  answerKey?: string;
}

export type EnemyType = 'Goblin' | 'Slime' | 'Dragon' | 'Wizard';

export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  maxHp: number;
  hp: number;
  color: string;
}

export interface Player {
  maxHp: number;
  hp: number;
  level: number;
  xp: number;
}
