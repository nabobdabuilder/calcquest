import React from 'react';
import { Topic } from '../types';
import { motion } from 'motion/react';

interface MenuProps {
  onStart: (topic: Topic) => void;
}

const TOPICS: { title: Topic, subtitle: string, icon: string, color: string }[] = [
  { title: 'Parametric', subtitle: 'Calculus BC Unit 7.1', icon: '\u27b0', color: 'from-blue-600 to-indigo-800' },
  { title: 'Polar Graphing', subtitle: 'Calculus BC Unit 7.2', icon: '\u25ce', color: 'from-purple-600 to-pink-800' },
  { title: 'Polar Derivatives', subtitle: 'Calculus BC Unit 7.3', icon: '\u2202', color: 'from-orange-600 to-red-800' },
  { title: 'Polar Area', subtitle: 'Calculus BC Unit 7.4', icon: '\u25e3', color: 'from-green-600 to-emerald-800' },
  { title: 'Polar Area Between', subtitle: 'Calculus BC Unit 7.5', icon: '\u29d0', color: 'from-teal-600 to-cyan-800' },
];

export function Menu({ onStart }: MenuProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-slate-900">
      
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-4">
          CalcQuest
        </h1>
        <p className="text-2xl font-light text-slate-300">AP Calculus BC • Unit 7</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {TOPICS.map((topic, i) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart(topic.title)}
            className={`cursor-pointer rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-slate-700 bg-gradient-to-br ${topic.color}`}
          >
            <div className="bg-slate-900/40 backdrop-blur-sm p-8 h-full flex flex-col items-center justify-center text-center">
              <span className="text-6xl mb-4 drop-shadow-lg">{topic.icon}</span>
              <h2 className="text-2xl font-bold text-white mb-2">{topic.title}</h2>
              <p className="text-slate-200 text-sm font-medium bg-black/30 px-3 py-1 rounded-full uppercase tracking-wider">{topic.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
