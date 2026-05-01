import React, { useState, useEffect, Suspense } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Shield, Wand2, Heart, Sparkles, Skull, Zap } from 'lucide-react';
import { Question } from '../types';
import { MathText } from '../components/MathText';

const CampaignWorld = React.lazy(() => import('./CampaignWorld'));

type GameState = 'CUSTOMIZE' | 'THEME_SELECT' | 'MODE_SELECT' | 'INSTRUCTIONS_PVP' | 'INSTRUCTIONS_PVE' | 'MATCHMAKING' | 'MATCH_FOUND' | 'BATTLE_SELECT_STANCE' | 'BATTLE_ANSWER_QUESTION' | 'BATTLE_RESOLVE' | 'GAME_OVER' | 'CAMPAIGN';

type Stance = 'ATTACK' | 'DEFEND' | 'MAGIC' | 'HEAL' | 'SUPER_DOMAIN_EXPANSION' | 'SUPER_BANKAI' | 'SUPER_HOLLOW_PURPLE';

let socket: Socket;

const AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Liliana&backgroundColor=ffb8b8',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=b9f2ff',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mia&backgroundColor=ffd5dc',
];

export function Game() {
  const [gameState, setGameState] = useState<GameState>('CUSTOMIZE');
  
  // Customization
  const [name, setName] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [selectedBgColor, setSelectedBgColor] = useState('#1e1b4b');

  // Network state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [roomState, setRoomState] = useState<any>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionEndTime, setQuestionEndTime] = useState<number>(0);
  const [roundResult, setRoundResult] = useState<any>(null);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [debugBg, setDebugBg] = useState<'normal' | 'winning' | 'losing' | 'intense'>('normal');
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isPVE, setIsPVE] = useState(false);
  const [botOpponent, setBotOpponent] = useState<any>(null);
  const [activeEmotes, setActiveEmotes] = useState<{[key: string]: { emote: string, id: number }}>({}); // playerId -> emote details
  const [deathDialogIndex, setDeathDialogIndex] = useState<number>(0);

  useEffect(() => {
    socket = io();


    socket.on('connect', () => {
      setMyId(socket.id!);
    });

    socket.on('waiting_for_match', () => {
      setGameState('MATCHMAKING');
    });

    socket.on('match_found', (data) => {
      setRoomId(data.room.id);
      setOpponent(data.opponent[socket.id!]);
      setRoomState(data.room);
      setGameState('MATCH_FOUND');
    });

    socket.on('round_start', (data) => {
      setRoomState(data.room);
      setGameState(prev => {
        // If we're coming from customization or matchmaking, we MUST show the VS screen
        if (prev === 'MATCHMAKING' || prev === 'CUSTOMIZE' || prev === 'MATCH_FOUND') {
          setTimeout(() => {
            setGameState('BATTLE_SELECT_STANCE');
          }, 3500); 
          return 'MATCH_FOUND';
        }
        return 'BATTLE_SELECT_STANCE';
      });
      setRoundResult(null);
    });

    socket.on('question_phase', (data) => {
      setQuestion(data.question);
      setQuestionEndTime(data.endTime);
      setGameState('BATTLE_ANSWER_QUESTION');
    });

    socket.on('round_resolved', (data) => {
      setRoomState(data.room);
      setRoundResult(data.result);
      setGameState('BATTLE_RESOLVE');
      setShowAnimation(true);
      // Wait longer for full animations to complete (synced with server)
      setTimeout(() => setShowAnimation(false), 5000);
    });

    socket.on('game_over', (data) => {
      setWinnerId(data.winnerId);
      setGameState('GAME_OVER');
    });
    
    socket.on('receive_emote', (data: { playerId: string, emote: string }) => {
      const emoteId = Date.now();
      setActiveEmotes(prev => ({
        ...prev,
        [data.playerId]: { emote: data.emote, id: emoteId }
      }));
      setTimeout(() => {
        setActiveEmotes(prev => {
          if (prev[data.playerId]?.id === emoteId) {
            const next = { ...prev };
            delete next[data.playerId];
            return next;
          }
          return prev;
        });
      }, 3000);
    });

    socket.on('opponent_disconnected', () => {
      // Avoid blocking alert
      setGameState('CUSTOMIZE');
      setRoomId(null);
      setOpponent(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (!name.trim()) return;
    setIsPVE(false);
    socket.emit('join_matchmaking', { name, avatar: AVATARS[avatarIndex] });
  };

  const startPVEBattle = async (bot: any) => {
    const { campaignStore } = await import('./CampaignWorld');
    const buffs = campaignStore.getBuffs();
    const playerMaxHp = 100 + buffs.hpBonus;

    setIsPVE(true);
    setBotOpponent(bot);
    setOpponent(bot);
    setMyId('player1'); // Mock ID
    
    // Mock room
    const mockRoom = {
      id: 'pve_room',
      state: 'STANCE',
      players: {
        'player1': { id: 'player1', name: name, avatar: AVATARS[avatarIndex], hp: playerMaxHp, maxHp: playerMaxHp, stance: null },
        [bot.id]: { id: bot.id, name: bot.name, avatar: bot.avatar, hp: bot.hp, maxHp: bot.hp, stance: null }
      }
    };
    
    setRoomState(mockRoom);
    setGameState('MATCH_FOUND');
    setTimeout(() => setGameState('BATTLE_SELECT_STANCE'), 3500);
  };

  // --- PVE Logic ---
  const handlePVESelectStance = async (stance: Stance) => {
    // Dynamically import the questions to keep it out of the main bundle if possible, 
    // but we can just import it statically since it's small. Let's do dynamic import:
    const { QUESTIONS } = await import('./questions');
    
    // Generate an opponent stance
    const stances: Stance[] = ['ATTACK', 'DEFEND', 'MAGIC', 'HEAL'];
    const botStance = stances[Math.floor(Math.random() * stances.length)];
    
    // Choose question
    const isSuper = stance.startsWith('SUPER_');
    let q;
    
    if (isSuper) {
      const { getRandomQuestion } = await import('./questions');
      q = getRandomQuestion('Nightmare');
    } else {
      const topic = botOpponent?.topic || 'Parametric';
      const topicQuestions = QUESTIONS.filter(q => q.topic === topic && (q.difficulty || 'Normal') === 'Normal');
      q = topicQuestions.length > 0 
        ? topicQuestions[Math.floor(Math.random() * topicQuestions.length)]
        : QUESTIONS.filter(q => (q.difficulty || 'Normal') === 'Normal')[Math.floor(Math.random() * QUESTIONS.length)];
    }

    setRoomState((prev: any) => {
      const next = { ...prev };
      next.players['player1'].stance = stance;
      next.players[botOpponent.id].stance = botStance;
      return next;
    });

    setQuestion(q);
    setQuestionEndTime(Date.now() + 10000);
    setGameState('BATTLE_ANSWER_QUESTION');
  };

  const handlePVEAnswer = async (index: number) => {
    setGameState('BATTLE_RESOLVE');
    const { campaignStore } = await import('./CampaignWorld');
    const buffs = campaignStore.getBuffs();

    const myStance = roomState.players['player1'].stance;
    const botStance = roomState.players[botOpponent.id].stance;
    const isCorrect = index === question?.correctIndex;
    
    // Simple damage logic
    let myDamage = isCorrect ? (myStance === 'ATTACK' ? 20 : myStance === 'MAGIC' ? 15 : myStance === 'DEFEND' ? 10 : 0) : 0;
    let myHeal = 0;

    if (isCorrect && myStance === 'HEAL') {
      myHeal = 25;
    }

    if (isCorrect && myDamage > 0) {
      myDamage += buffs.dmgBonus;
    }
    
    // Super skills damage (Kept powerful in PVE)
    if (isCorrect && myStance.startsWith('SUPER_')) {
      myDamage = 50 + buffs.dmgBonus + buffs.superBonus; 
      if (myStance === 'SUPER_BANKAI') {
        myDamage = 30 + buffs.dmgBonus;
        myHeal = 30;
      }
      if (myStance === 'SUPER_HOLLOW_PURPLE') {
        myDamage = 75 + buffs.dmgBonus + buffs.superBonus;
      }
    }

    let botDamage = 0;
    let botHeal = 0;

    if (botStance === 'ATTACK') botDamage = 15;
    else if (botStance === 'MAGIC') botDamage = 10;
    else if (botStance === 'DEFEND') botDamage = 5;
    else if (botStance === 'HEAL') botHeal = 15;

    if (botStance.startsWith('SUPER_')) {
      botDamage = 40;
    }

    // RPS Logic for PVE (Simplified but respecting HEAL)
    if (myStance === 'DEFEND' && isCorrect) botDamage = Math.floor(botDamage / 2);
    if (botStance === 'DEFEND') myDamage = Math.floor(myDamage / 2);
    
    // HEAL vulnerability
    if (myStance === 'HEAL' && isCorrect && botStance === 'ATTACK') botDamage = Math.floor(botDamage * 1.5);
    if (botStance === 'HEAL' && myStance === 'ATTACK' && isCorrect) myDamage = Math.floor(myDamage * 1.5);

    if (myStance === 'SUPER_DOMAIN_EXPANSION' && isCorrect) botDamage = 0; // complete block

    const result = {
      player1: { stance: myStance, damageDealt: myDamage, correct: isCorrect, heal: myHeal },
      [botOpponent.id]: { stance: botStance, damageDealt: botDamage, correct: true, heal: botHeal } 
    };

    setRoomState((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const p1MaxHp = next.players['player1'].maxHp || 100;
      const botMaxHp = next.players[botOpponent.id].maxHp || botOpponent.hp || 100;

      next.players['player1'].hp = Math.min(p1MaxHp, Math.max(0, next.players['player1'].hp - botDamage + myHeal));
      next.players[botOpponent.id].hp = Math.min(botMaxHp, Math.max(0, next.players[botOpponent.id].hp - myDamage + botHeal));
      
      // Handle energy / correct answers tracking
      if (isCorrect) {
        if (myStance.startsWith('SUPER_')) {
          next.players['player1'].correctAnswers = 0;
        } else {
          next.players['player1'].correctAnswers = (next.players['player1'].correctAnswers || 0) + 1;
        }
      }
      
      if (botStance.startsWith('SUPER_')) {
        next.players[botOpponent.id].correctAnswers = 0;
      } else {
        next.players[botOpponent.id].correctAnswers = (next.players[botOpponent.id].correctAnswers || 0) + 1;
      }

      return next;
    });
    
    setRoundResult(result);
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
      // Wait for summary screen visibility
      setTimeout(() => {
        setRoomState((prev:any) => {
          if (prev.players['player1'].hp <= 0 || prev.players[botOpponent.id].hp <= 0) {
            setWinnerId(prev.players['player1'].hp > 0 ? 'player1' : botOpponent.id);
            setGameState('GAME_OVER');
          } else {
            setGameState('BATTLE_SELECT_STANCE');
          }
          return prev;
        });
      }, 2500);
    }, 5000);
  };
  // -----------------

  const handleSelectStance = (stance: Stance) => {
    if (isPVE) {
      handlePVESelectStance(stance);
      return;
    }
    if (!roomId) return;
    socket.emit('submit_stance', { roomId, stance });
    // Optimistic UI update
    setRoomState((prev: any) => {
      if (!prev || !prev.players || !prev.players[myId]) return prev;
      const next = { ...prev };
      next.players[myId] = { ...next.players[myId], stance: 'SELECTED' };
      return next;
    });
  };

  const handleAnswer = (index: number) => {
    if (isPVE) {
      handlePVEAnswer(index);
      return;
    }
    if (!roomId || gameState !== 'BATTLE_ANSWER_QUESTION') return;
    socket.emit('submit_answer', { roomId, answerIndex: index });
    setGameState('BATTLE_RESOLVE');
  };

  const restartGame = async () => {
    if (isPVE) {
      if (winnerId === 'player1' && botOpponent) {
        // If we have a death dialog, check if we've finished it
        const dialogs = botOpponent.deathDialog || [];
        if (deathDialogIndex < dialogs.length - 1) {
          setDeathDialogIndex(prev => prev + 1);
          return; // Don't restart yet
        }
        const m = await import('./CampaignWorld');
        m.campaignStore.markDefeated(botOpponent.id);
      }
      setIsPVE(false);
      setBotOpponent(null);
      setRoomState(null);
      setGameState('CAMPAIGN');
      setWinnerId(null);
      setDeathDialogIndex(0);
      return;
    }
    setGameState('CUSTOMIZE');
    setRoomId(null);
    setOpponent(null);
    setRoomState(null);
  };

  const sendEmote = (emote: string) => {
    if (!roomId) return;
    socket.emit('send_emote', { roomId, emote });
    // Show for self too
    const emoteId = Date.now();
    setActiveEmotes(prev => ({
      ...prev,
      [myId]: { emote, id: emoteId }
    }));
    setTimeout(() => {
      setActiveEmotes(prev => {
        if (prev[myId]?.id === emoteId) {
          const next = { ...prev };
          delete next[myId];
          return next;
        }
        return prev;
      });
    }, 3000);
  };

  if (gameState === 'CUSTOMIZE') {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center pt-8 pb-8 relative overflow-hidden font-sans transition-colors duration-700" style={{ backgroundColor: selectedBgColor === '#1e1b4b' ? '#ffd6e0' : selectedBgColor }}>
        {/* Floating background elements */}
        <div className="absolute top-10 left-10 text-5xl opacity-40 animate-bounce" style={{animationDuration: '3s'}}>✨</div>
        <div className="absolute bottom-20 right-20 text-6xl opacity-40 animate-pulse" style={{animationDuration: '4s'}}>🌟</div>
        <div className="absolute top-1/4 right-1/4 text-4xl opacity-30 animate-bounce" style={{animationDuration: '5s'}}>☁️</div>
        
        <div className="bg-white p-8 rounded-[2rem] border-[6px] border-[#ff9eb5] shadow-[0_12px_0_#ff9eb5] max-w-md w-full relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black text-center text-[#ff6b8b] mb-2 drop-shadow-sm">CalcQuest</h1>
          <p className="text-[#a49a9c] text-center mb-8 font-medium">Enroll your wizard to start your journey!</p>
          
          <div className="flex flex-col items-center mb-8 bg-[#fff0f3] w-full py-6 rounded-3xl border-4 border-[#ffe3e8]">
             <div className="relative w-40 h-40 mb-4 bg-white rounded-full border-4 border-[#ff9eb5] shadow-[0_6px_0_#ffe3e8] overflow-hidden flex items-center justify-center">
               <motion.img 
                 key={avatarIndex}
                 initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                 animate={{ scale: 1, rotate: 0, opacity: 1 }}
                 transition={{ type: "spring", bounce: 0.6 }}
                 src={AVATARS[avatarIndex]} 
                 alt="Avatar" 
                 className="w-[120%] h-[120%] object-cover mt-4" 
               />
             </div>
             <div className="flex gap-6 mt-2">
               <button 
                 onClick={() => setAvatarIndex((prev) => (prev > 0 ? prev - 1 : AVATARS.length - 1))}
                 className="w-12 h-12 bg-white rounded-full border-4 border-[#ff9eb5] text-[#ff6b8b] font-black text-xl shadow-[0_4px_0_#ff9eb5] active:translate-y-1 active:shadow-[0_0px_0_#ff9eb5] transition-all flex items-center justify-center cursor-pointer hover:bg-[#fff0f3]"
               >
                 &larr;
               </button>
               <button 
                 onClick={() => setAvatarIndex((prev) => (prev < AVATARS.length - 1 ? prev + 1 : 0))}
                 className="w-12 h-12 bg-white rounded-full border-4 border-[#ff9eb5] text-[#ff6b8b] font-black text-xl shadow-[0_4px_0_#ff9eb5] active:translate-y-1 active:shadow-[0_0px_0_#ff9eb5] transition-all flex items-center justify-center cursor-pointer hover:bg-[#fff0f3]"
               >
                 &rarr;
               </button>
             </div>
          </div>

          <div className="w-full relative mb-8">
            <span className="absolute -top-3 left-6 bg-white px-2 text-[#ff9eb5] font-bold text-sm">Wizard Name</span>
            <input 
              type="text" 
              placeholder="e.g. Merlin" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#f8f9fa] border-4 border-[#e9ecef] rounded-2xl px-6 py-4 text-[#495057] font-bold text-lg focus:border-[#ff9eb5] focus:bg-white focus:outline-none transition-colors"
              maxLength={15}
            />
          </div>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={() => setGameState('THEME_SELECT')}
              disabled={!name.trim()}
              className="w-full bg-[#3ecf8e] text-white font-black text-xl py-5 rounded-2xl border-b-[8px] border-[#2bae74] active:border-b-[0px] active:translate-y-[8px] disabled:opacity-50 disabled:active:border-b-[8px] disabled:active:translate-y-0 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'THEME_SELECT') {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans transition-colors duration-700" style={{ backgroundColor: selectedBgColor === '#1e1b4b' ? '#ffd6e0' : selectedBgColor }}>
        {/* Floating background elements */}
        <div className="absolute top-10 right-20 text-5xl opacity-40 animate-bounce" style={{animationDuration: '3s'}}>✨</div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-40 animate-pulse" style={{animationDuration: '4s'}}>🌟</div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] border-[6px] border-[#ff9eb5] shadow-[0_12px_0_#ff9eb5] max-w-xl w-full relative z-10 flex flex-col items-center">
          <h1 className="text-4xl font-black text-center text-[#ff6b8b] mb-2 drop-shadow-sm">Choose Your Vibe</h1>
          <p className="text-[#a49a9c] text-center mb-10 font-medium">Select an aesthetic for your magical journey</p>

          <div className="grid grid-cols-2 gap-6 w-full mb-10">
            {[
              { name: 'Midnight', color: '#1e1b4b', desc: 'Dark & Deep' },
              { name: 'Sky', color: '#e0f7fa', desc: 'Bright & Calm' },
              { name: 'Rose', color: '#ffd6e0', desc: 'Soft & Sweet' },
              { name: 'Lavender', color: '#f5f3ff', desc: 'Cool & Mystic' },
            ].map((theme) => (
              <button
                key={theme.name}
                onClick={() => setSelectedBgColor(theme.color)}
                className={`flex flex-col items-center p-6 rounded-[2rem] border-4 transition-all ${selectedBgColor === theme.color ? 'border-[#ff6b8b] bg-[#fff0f3] scale-105 shadow-md' : 'border-[#e9ecef] bg-[#f8f9fa] hover:border-[#ff9eb5]'}`}
              >
                <div 
                  className={`w-16 h-16 rounded-full border-4 border-white shadow-sm mb-3`}
                  style={{ backgroundColor: theme.color }}
                />
                <span className={`font-black uppercase tracking-tight ${selectedBgColor === theme.color ? 'text-[#ff6b8b]' : 'text-[#495057]'}`}>{theme.name}</span>
                <span className="text-[10px] font-bold text-[#a49a9c] uppercase">{theme.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setGameState('CUSTOMIZE')}
              className="flex-1 bg-white text-[#ff9eb5] font-black text-xl py-4 rounded-xl border-4 border-[#ff9eb5] shadow-[0_4px_0_#ff9eb5] active:translate-y-1 active:shadow-[0_0px_0_#ff9eb5] transition-all cursor-pointer"
            >
              Back
            </button>
            <button 
              onClick={() => setGameState('MODE_SELECT')}
              className="flex-[2] bg-[#3ecf8e] text-white font-black text-xl py-4 rounded-xl border-b-[8px] border-[#2bae74] active:border-b-[0px] active:translate-y-[8px] transition-all cursor-pointer"
            >
              Confirm Choice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'MODE_SELECT') {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans transition-colors duration-700" style={{ backgroundColor: selectedBgColor === '#1e1b4b' ? '#ffd6e0' : selectedBgColor }}>
        {/* Floating background elements */}
        <div className="absolute top-10 right-20 text-5xl opacity-40 animate-bounce" style={{animationDuration: '3s'}}>✨</div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-40 animate-pulse" style={{animationDuration: '4s'}}>🌟</div>
        
        <h1 className="text-5xl font-black text-center text-[#ff6b8b] mb-12 drop-shadow-sm z-10">Choose Your Path</h1>
        
        <div className="flex flex-col md:flex-row gap-8 z-10 w-full max-w-4xl justify-center items-stretch">
          
          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('INSTRUCTIONS_PVP')}
            className="flex-1 bg-white p-8 rounded-[3rem] border-[8px] border-[#3ecf8e] shadow-[0_16px_0_#3ecf8e] cursor-pointer flex flex-col items-center text-center transition-all group"
          >
            <div className="text-7xl mb-6 group-hover:animate-bounce">⚔️</div>
            <h2 className="text-3xl font-black text-[#2bae74] mb-4">PVP Arena</h2>
            <p className="text-[#a49a9c] font-medium text-lg leading-relaxed">Battle against other wizards online in real-time math duels! Test your reflexes and calculation speed.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (localStorage.getItem('hasSeenPVEInstructions')) {
                setGameState('CAMPAIGN');
              } else {
                setGameState('INSTRUCTIONS_PVE');
              }
            }}
            className="flex-1 bg-white p-8 rounded-[3rem] border-[8px] border-[#8b5cf6] shadow-[0_16px_0_#8b5cf6] cursor-pointer flex flex-col items-center text-center transition-all group"
          >
            <div className="text-7xl mb-6 group-hover:animate-bounce">🗺️</div>
            <h2 className="text-3xl font-black text-[#6d28d9] mb-4">Story Campaign</h2>
            <p className="text-[#a49a9c] font-medium text-lg leading-relaxed">Explore the magical world, complete quests, and battle math monsters in an epic RPG adventure!</p>
          </motion.div>

        </div>
        
        <button 
          onClick={() => setGameState('CUSTOMIZE')}
          className="mt-12 text-[#ff6b8b] font-bold text-xl hover:text-[#ff9eb5] transition-colors z-10"
        >
          &larr; Back to Customization
        </button>
      </div>
    );
  }

  if (gameState === 'INSTRUCTIONS_PVP') {
    return (
      <div className="w-full min-h-[100dvh] bg-[#ffd6e0] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
        <div className="bg-white max-w-2xl w-full p-8 md:p-12 rounded-[2rem] border-[6px] border-[#3ecf8e] shadow-[0_16px_0_#3ecf8e] relative text-center">
           <h2 className="text-4xl md:text-5xl font-black text-[#2bae74] mb-6 uppercase tracking-tighter">PVP Rules</h2>
           <ul className="text-left space-y-4 text-xl text-[#334155] font-bold bg-[#f1f5f9] p-6 rounded-2xl border-2 border-[#e2e8f0] mb-8">
              <li className="flex items-center gap-3"><Sword className="w-6 h-6 text-[#fb7185]" /> <span className="flex-1">Attack deals normal damage. Defeats Magic.</span></li>
              <li className="flex items-center gap-3"><Wand2 className="w-6 h-6 text-[#a78bfa]" /> <span className="flex-1">Magic pierces Defense. Defeats Defend.</span></li>
              <li className="flex items-center gap-3"><Shield className="w-6 h-6 text-[#34d399]" /> <span className="flex-1">Defend mitigates damage. Defeats Attack.</span></li>
              <li className="flex items-center gap-3"><Heart className="w-6 h-6 text-[#fb923c]" /> <span className="flex-1">Heal restores HP, but is punished heavily by Attack.</span></li>
              <li className="flex items-center gap-3"><Sparkles className="w-6 h-6 text-[#f59e0b]" /> <span className="flex-1">Answer 3 questions correctly to unlock your Ultimate skill.</span></li>
           </ul>
           <div className="flex gap-4 w-full">
             <button 
               onClick={() => setGameState('MODE_SELECT')}
               className="flex-1 bg-[#ff6b8b] text-white font-black text-xl py-4 rounded-xl border-b-[6px] border-[#fb7185] active:border-b-[0px] active:translate-y-[6px] transition-all"
             >
               Back
             </button>
             <button 
               onClick={handleJoin}
               className="flex-[2] bg-[#3ecf8e] text-white font-black text-xl py-4 rounded-xl border-b-[6px] border-[#2bae74] active:border-b-[0px] active:translate-y-[6px] transition-all"
             >
               Find Match!
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (gameState === 'INSTRUCTIONS_PVE') {
    return (
      <div className="w-full min-h-[100dvh] bg-[#ffd6e0] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
        <div className="bg-white max-w-2xl w-full p-8 md:p-12 rounded-[2rem] border-[6px] border-[#8b5cf6] shadow-[0_16px_0_#8b5cf6] relative text-center">
           <h2 className="text-4xl md:text-5xl font-black text-[#7c3aed] mb-6 uppercase tracking-tighter">Campaign Overview</h2>
           <div className="text-left space-y-4 text-xl text-[#334155] font-bold bg-[#f5f3ff] p-6 rounded-2xl border-2 border-[#ede9fe] mb-8">
              <p>Welcome to the CalcQuest Campaign!</p>
              <ul className="list-disc pl-6 space-y-2 text-[#4f46e5]">
                 <li>Explore the world map and engage in mathematical combat with rogue guardians.</li>
                 <li>Defeat enemies to collect <strong>Fragments</strong>.</li>
                 <li>Unlock new paths and gain powerful <strong>Buffs</strong> increasing your HP and Damage.</li>
                 <li>Defeat all the required bosses to conquer the region!</li>
              </ul>
              <div className="mt-6 flex justify-center gap-4 border-t-2 border-[#ede9fe] pt-4">
                 <Sword className="w-6 h-6 text-[#fb7185]" />
                 <Wand2 className="w-6 h-6 text-[#a78bfa]" />
                 <Shield className="w-6 h-6 text-[#34d399]" />
                 <Heart className="w-6 h-6 text-[#fb923c]" />
              </div>
              <p className="mt-2 text-sm text-[#8b5cf6] italic text-center">* Battles here use the same RPS logic as PVP *</p>
           </div>
           
           <button 
             onClick={() => {
               localStorage.setItem('hasSeenPVEInstructions', 'true');
               setGameState('CAMPAIGN');
             }}
             className="w-full bg-[#8b5cf6] text-white font-black text-xl py-4 rounded-xl border-b-[6px] border-[#7c3aed] active:border-b-[0px] active:translate-y-[6px] transition-all shadow-sm"
           >
             Start Adventure
           </button>
        </div>
      </div>
    );
  }

  if (gameState === 'CAMPAIGN') {
    return (
      <Suspense fallback={<div className="w-full h-[100dvh] bg-[#ffd6e0] flex items-center justify-center font-black text-2xl text-[#ff6b8b] animate-pulse">Loading World...</div>}>
        <CampaignWorld 
          name={name} 
          avatar={AVATARS[avatarIndex]} 
          onBack={() => setGameState('MODE_SELECT')} 
          onStartBattle={startPVEBattle}
        />
      </Suspense>
    );
  }

  if (gameState === 'MATCHMAKING' || gameState === 'MATCH_FOUND') {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden font-sans relative transition-colors duration-700" style={{ backgroundColor: selectedBgColor }}>
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        
        {/* Animated background stripes for high energy when match is found */}
        {opponent && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <motion.div 
              animate={{ x: [-1000, 1000] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute top-0 left-0 w-[400%] h-32 bg-white -rotate-12 blur-3xl"
            />
            <motion.div 
              animate={{ x: [1000, -1000] }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute bottom-0 right-0 w-[400%] h-32 bg-white -rotate-12 blur-3xl"
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!opponent ? (
            <motion.div 
              key="searching"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [-10, 10, -10] 
              }}
              exit={{ opacity: 0, scale: 1.2, x: -500 }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }}
              className="bg-white p-12 rounded-[3rem] border-[6px] border-[#ff9eb5] shadow-[0_16px_0_#ff9eb5] flex flex-col items-center z-10"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-6 shadow-sm drop-shadow-xl"
              >
                🔮
              </motion.div>
              <h2 className="text-3xl font-black text-[#ff6b8b] mb-3 uppercase tracking-tighter">Scrying the globe...</h2>
              <p className="text-[#a49a9c] font-medium text-lg text-center max-w-xs">Looking for a worthy rival to test your calculus spells.</p>
              <div className="mt-8 flex gap-2">
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-4 h-4 rounded-full bg-[#ff9eb5]"></motion.div>
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-4 h-4 rounded-full bg-[#ff9eb5]"></motion.div>
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-4 h-4 rounded-full bg-[#ff9eb5]"></motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="found"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-5xl px-4 flex flex-col items-center z-10"
            >
              <motion.h2 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-black text-[#ff6b8b] mb-12 uppercase tracking-tighter drop-shadow-md text-center"
              >
                Match Found!
              </motion.h2>

              <div className="flex flex-row items-center justify-center gap-4 md:gap-16 w-full">
                {/* My Side */}
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#3ecf8e] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-32 h-32 md:w-56 md:h-56 bg-white rounded-[2rem] md:rounded-[3rem] border-[6px] border-[#3ecf8e] shadow-[0_12px_0_#3ecf8e] overflow-hidden flex items-center justify-center">
                      <img src={AVATARS[avatarIndex]} alt="Me" className="w-[120%] h-[120%] object-cover mt-6" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="mt-6 bg-[#3ecf8e] text-white px-6 py-2 rounded-full font-black text-xl shadow-lg"
                  >
                    {name || "Wizard"}
                  </motion.div>
                </motion.div>

                {/* VS Element */}
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.8, delay: 0.8 }}
                  className="relative z-20 flex items-center justify-center"
                >
                  <div className="text-5xl md:text-8xl font-black text-white italic drop-shadow-[0_8px_0_#ff6b8b] tracking-tighter">
                    VS
                  </div>
                </motion.div>

                {/* Opponent Side */}
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#ff6b8b] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-32 h-32 md:w-56 md:h-56 bg-white rounded-[2rem] md:rounded-[3rem] border-[6px] border-[#ff6b8b] shadow-[0_12px_0_#ff6b8b] overflow-hidden flex items-center justify-center">
                      <img src={opponent?.avatar || AVATARS[1]} alt="Opponent" className="w-[120%] h-[120%] object-cover mt-6" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                    className="mt-6 bg-[#ff6b8b] text-white px-6 py-2 rounded-full font-black text-xl shadow-lg"
                  >
                    {opponent?.name || "Rival"}
                  </motion.div>
                </motion.div>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-16 text-[#ff6b8b] font-black text-2xl animate-pulse"
              >
                BATTLE STARTING...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const getOpponentId = () => {
    if (!roomState) return null;
    return Object.keys(roomState.players).find(id => id !== myId);
  };

  const oppId = getOpponentId();

  return (
    <div className="w-full min-h-[100dvh] relative font-sans flex flex-col overflow-hidden select-none">
      {/* Dynamic Background */}
      {roomState ? (
        <DynamicBackground 
          myHp={roomState.players[myId]?.hp || 100} 
          oppHp={(oppId ? roomState.players[oppId]?.hp : 100) || 100}
          overrideMode={debugBg === 'normal' ? undefined : debugBg} 
          selectedBgColor={selectedBgColor}
        />
      ) : (
        <DynamicBackground 
          myHp={100} 
          oppHp={100} 
          overrideMode={debugBg === 'normal' ? undefined : debugBg}
          selectedBgColor={selectedBgColor}
        />
      )}

      {/* Energy Particles Layer */}
      <EnergyParticles />
      
      {/* Aesthetic simple pattern overlay */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      
      {/* Floating clouds for that cute vibe */}
      <div className="absolute top-20 left-10 text-6xl opacity-40 animate-[bounce_6s_infinite]" >☁️</div>
      <div className="absolute bottom-40 right-10 text-8xl opacity-30 animate-[bounce_8s_infinite]" >☁️</div>

      {/* Battle Scene Header */}
      <BattleLog roundResult={roundResult} myId={myId} />
      
      {/* Emote Overlay Display */}
      <AnimatePresence>
        {activeEmotes[myId] && (
          <motion.div 
            initial={{ scale: 0, y: 100, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], y: 0, opacity: 1 }}
            exit={{ scale: 0, y: 50, opacity: 0 }}
            className="fixed bottom-32 left-10 text-[10rem] pointer-events-none z-50 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {activeEmotes[myId].emote}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {oppId && activeEmotes[oppId] && (
          <motion.div 
            initial={{ scale: 0, y: 100, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], y: 0, opacity: 1 }}
            exit={{ scale: 0, y: 50, opacity: 0 }}
            className="fixed bottom-32 right-10 text-[10rem] pointer-events-none z-50 drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {activeEmotes[oppId].emote}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emote Picker */}
      {roomState && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border-4 border-white/50 shadow-lg flex gap-4">
          {['😎', '🤔', '🔥', '😭', '🎉', '😡', '😱', '🧙‍♂️'].map(emote => (
            <button 
              key={emote}
              onClick={() => sendEmote(emote)}
              className="text-2xl hover:scale-125 hover:-rotate-12 active:scale-95 transition-all cursor-pointer"
            >
              {emote}
            </button>
          ))}
        </div>
      )}
      <div className="w-full flex justify-between items-center p-4 md:p-8 z-10">
        {/* Player Stats HUD */}
        {roomState && (
          <div className="flex flex-col items-start bg-black/60 backdrop-blur-md p-5 rounded-xl border-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-400 to-transparent opacity-80" />
             <div className="flex items-center gap-4 mb-3">
               <div className="relative">
                  <img src={AVATARS[avatarIndex]} alt="Me" className="w-16 h-16 rounded-full border-[3px] border-sky-400 bg-sky-900/40 shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-sky-500 rounded-sm flex items-center justify-center text-xs font-black text-black transform rotate-45 border-2 border-white shadow-md">
                      <span className="transform -rotate-45">P1</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-black uppercase tracking-widest text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{name}</span>
                  <span className="text-sky-300 text-xs uppercase font-black tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Combatant</span>
               </div>
             </div>
             
             <div className="w-56 md:w-72 mt-2">
               <div className="flex justify-between items-end mb-2">
                  <span className="text-yellow-400 text-sm uppercase font-black tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Integrity</span>
                  <span className="text-yellow-400 font-black text-base font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{roomState?.players[myId]?.hp || 0} / {roomState?.players[myId]?.maxHp || 100}</span>
               </div>
               <div className="h-4 w-full bg-black/80 rounded-md border-2 border-yellow-500/80 p-[2px] shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                 <div className="bg-gradient-to-r from-sky-500 to-sky-300 h-full rounded-sm transition-all duration-500 ease-out shadow-[0_0_10px_#38bdf8]" style={{ width: `${Math.min(100, Math.max(0, ((roomState?.players[myId]?.hp || 0) / (roomState?.players[myId]?.maxHp || 100)) * 100))}%` }} />
               </div>
             </div>

             {/* Energy HUD */}
             <div className="mt-4 flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/10">
                <span className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none drop-shadow-md">Super</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 border-2 border-white/40 transform rotate-45 transition-all duration-300 ${i <= (roomState?.players[myId]?.correctAnswers || 0) ? 'bg-[#fbbf24] border-[#fbbf24] shadow-[0_0_12px_#f59e0b]' : 'bg-black/50'}`}
                    />
                  ))}
                </div>
             </div>
          </div>
        )}

        <div className="text-4xl md:text-6xl font-black text-sky-400 italic tracking-tighter drop-shadow-[0_0_20px_rgba(56,189,248,0.6)] px-6 relative" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.2)' }}>
          <span className="absolute inset-0 blur-md text-white/40">VS</span>
          <span className="relative">VS</span>
        </div>

        {/* Opponent Stats HUD */}
        {roomState && oppId && opponent && (
          <div className="flex flex-col items-end bg-black/60 backdrop-blur-md p-5 rounded-xl border-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden text-right">
             <div className="absolute top-0 right-0 w-full h-[3px] bg-gradient-to-l from-rose-400 to-transparent opacity-80" />
             <div className="flex items-center gap-4 mb-3 flex-row-reverse">
               <div className="relative">
                  <img src={opponent.avatar} alt="Opponent" className="w-16 h-16 rounded-full border-[3px] border-rose-400 bg-rose-900/40 shadow-[0_0_15px_rgba(251,113,133,0.4)]" />
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-rose-500 rounded-sm flex items-center justify-center text-xs font-black text-black transform rotate-45 border-2 border-white shadow-md">
                      <span className="transform -rotate-45">P2</span>
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-black uppercase tracking-widest text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{opponent.name}</span>
                  <span className="text-rose-300 text-xs uppercase font-black tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Adversary</span>
               </div>
             </div>
             
             <div className="w-56 md:w-72 mt-2">
               <div className="flex justify-between items-end mb-2 flex-row-reverse">
                  <span className="text-yellow-400 text-sm uppercase font-black tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Integrity</span>
                  <span className="text-yellow-400 font-black text-base font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{(oppId ? roomState?.players[oppId]?.hp : 0) || 0} / {(oppId ? roomState?.players[oppId]?.maxHp : 100) || 100}</span>
               </div>
               <div className="h-4 w-full bg-black/80 rounded-md border-2 border-yellow-500/80 p-[2px] shadow-[0_0_12px_rgba(234,179,8,0.4)] flex justify-end">
                 <div className="bg-gradient-to-l from-rose-500 to-rose-300 h-full rounded-sm transition-all duration-500 ease-out shadow-[0_0_10px_#fb7185]" style={{ width: `${Math.min(100, Math.max(0, (((oppId ? roomState?.players[oppId]?.hp : 0) || 0) / ((oppId ? roomState?.players[oppId]?.maxHp : 100) || 100)) * 100))}%` }} />
               </div>
             </div>

             {/* Energy HUD */}
             <div className="mt-4 flex items-center gap-3 flex-row-reverse bg-black/40 p-2 rounded-lg border border-white/10">
                <span className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-none drop-shadow-md">Super</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 border-2 border-white/40 transform rotate-45 transition-all duration-300 ${i <= ((oppId ? roomState?.players[oppId]?.correctAnswers : 0) || 0) ? 'bg-orange-400 border-[#f59e0b] shadow-[0_0_12px_#f59e0b]' : 'bg-black/50'}`}
                    />
                  ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Play Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center pb-32 px-4 z-10">
        <AnimatePresence mode="wait">
          {gameState === 'BATTLE_SELECT_STANCE' && (
            <motion.div 
              key="stance"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -50 }}
              className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4"
            >
              <div className="text-center mb-10 flex flex-col items-center">
                 <h2 className="text-3xl md:text-5xl font-black text-sky-400 uppercase tracking-[0.2em] mb-2" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.1)' }}>Battle Initialization</h2>
                 <div className="h-1 w-48 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
              </div>
              {roomState?.players[myId]?.stance !== 'SELECTED' ? (
                <div className="flex flex-col items-center w-full gap-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <button 
                      onClick={() => handleSelectStance('ATTACK')}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-yellow-500/40 hover:border-yellow-400 p-4 transition-all flex flex-col items-center cursor-pointer relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] rounded-lg"
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/60" />
                      
                      <div className="w-16 h-16 mb-3 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-center group-hover:from-yellow-500/30 transition-colors rounded-xl border border-yellow-500/30">
                        <Sword className="text-yellow-100 group-hover:text-white w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-black text-yellow-50 group-hover:text-white text-lg tracking-[0.1em] mb-1 uppercase drop-shadow-md">Attack</span>
                      <span className="text-yellow-200/60 text-[10px] text-center uppercase tracking-wider">High Utility</span>
                    </button>

                    <button 
                      onClick={() => handleSelectStance('MAGIC')}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-yellow-500/40 hover:border-yellow-400 p-4 transition-all flex flex-col items-center cursor-pointer relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] rounded-lg"
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/60" />

                      <div className="w-16 h-16 mb-3 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-center group-hover:from-yellow-500/30 transition-colors rounded-xl border border-yellow-500/30">
                        <Wand2 className="text-yellow-100 group-hover:text-white w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-black text-yellow-50 group-hover:text-white text-lg tracking-[0.1em] mb-1 uppercase drop-shadow-md">Magic</span>
                      <span className="text-yellow-200/60 text-[10px] text-center uppercase tracking-wider">Shield Pierce</span>
                    </button>

                    <button 
                      onClick={() => handleSelectStance('DEFEND')}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-yellow-500/40 hover:border-yellow-400 p-4 transition-all flex flex-col items-center cursor-pointer relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] rounded-lg"
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/60" />

                      <div className="w-16 h-16 mb-3 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-center group-hover:from-yellow-500/30 transition-colors rounded-xl border border-yellow-500/30">
                        <Shield className="text-yellow-100 group-hover:text-white w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-black text-yellow-50 group-hover:text-white text-lg tracking-[0.1em] mb-1 uppercase drop-shadow-md">Defend</span>
                      <span className="text-yellow-200/60 text-[10px] text-center uppercase tracking-wider">Mitigation</span>
                    </button>

                    <button 
                      onClick={() => handleSelectStance('HEAL')}
                      className="group bg-black/60 backdrop-blur-sm border-2 border-yellow-500/40 hover:border-yellow-400 p-4 transition-all flex flex-col items-center cursor-pointer relative overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] rounded-lg"
                    >
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400/60" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400/60" />

                      <div className="w-16 h-16 mb-3 bg-gradient-to-br from-yellow-500/10 to-transparent flex items-center justify-center group-hover:from-yellow-500/30 transition-colors rounded-xl border border-yellow-500/30">
                        <Heart className="text-yellow-100 group-hover:text-white w-8 h-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" strokeWidth={1.5} />
                      </div>
                      <span className="font-black text-yellow-50 group-hover:text-white text-lg tracking-[0.1em] mb-1 uppercase drop-shadow-md">Heal</span>
                      <span className="text-yellow-200/60 text-[10px] text-center uppercase tracking-wider">Recovery</span>
                    </button>
                  </div>
                  
                  {/* Super Mechanics */}
                  {roomState?.players[myId]?.correctAnswers >= 3 && (
                    <div className="w-full mt-4 flex flex-col items-center relative z-20">
                        <div className="absolute inset-0 bg-yellow-400/20 blur-[50px] pointer-events-none"></div>
                        <h3 className="text-xl font-bold text-yellow-500 mb-4 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse">Ultimate Available</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                           <button 
                             onClick={() => handleSelectStance('SUPER_DOMAIN_EXPANSION')}
                             className="bg-black/60 backdrop-blur-md p-4 rounded-xl border-2 border-white/20 shadow-[0_0_20px_rgba(129,140,248,0.3)] hover:border-[#818cf8] hover:shadow-[0_0_30px_rgba(129,140,248,0.5)] active:scale-95 transition-all text-white flex flex-col items-center group overflow-hidden relative"
                           >
                              <div className="absolute inset-0 bg-gradient-to-t from-[#818cf8]/20 to-transparent group-hover:from-[#818cf8]/40 transition-colors" />
                              <div className="flex items-center justify-center w-12 h-12 mb-2 relative z-10 bg-black/40 rounded-full border border-white/20">
                                <Sparkles className="text-white w-6 h-6" />
                              </div>
                              <span className="font-black text-sm text-white mb-1 tracking-widest uppercase relative z-10">DOMAIN EXPANSION</span>
                              <span className="text-[10px] text-gray-300 tracking-tighter uppercase relative z-10">Deal 35 Unblockable DMG</span>
                           </button>
                           
                           <button 
                             onClick={() => handleSelectStance('SUPER_BANKAI')}
                             className="bg-black/60 backdrop-blur-md p-4 rounded-xl border-2 border-white/20 shadow-[0_0_20px_rgba(248,113,113,0.3)] hover:border-[#f87171] hover:shadow-[0_0_30px_rgba(248,113,113,0.5)] active:scale-95 transition-all text-white flex flex-col items-center group overflow-hidden relative"
                           >
                              <div className="absolute inset-0 bg-gradient-to-t from-[#f87171]/20 to-transparent group-hover:from-[#f87171]/40 transition-colors" />
                              <div className="flex items-center justify-center w-12 h-12 mb-2 relative z-10 bg-black/40 rounded-full border border-white/20">
                                <Skull className="text-white w-6 h-6" />
                              </div>
                              <span className="font-black text-sm text-white mb-1 tracking-widest uppercase relative z-10">BANKAI</span>
                              <span className="text-[10px] text-gray-300 tracking-tighter uppercase relative z-10">Heal 25 &amp; Deal 25 DMG</span>
                           </button>
                           
                           <button 
                             onClick={() => handleSelectStance('SUPER_HOLLOW_PURPLE')}
                             className="bg-black/60 backdrop-blur-md p-4 rounded-xl border-2 border-white/20 shadow-[0_0_20px_rgba(192,132,252,0.3)] hover:border-[#c084fc] hover:shadow-[0_0_30px_rgba(192,132,252,0.5)] active:scale-95 transition-all text-white flex flex-col items-center group overflow-hidden relative"
                           >
                              <div className="absolute inset-0 bg-gradient-to-t from-[#c084fc]/20 to-transparent group-hover:from-[#c084fc]/40 transition-colors" />
                              <div className="flex items-center justify-center w-12 h-12 mb-2 relative z-10 bg-black/40 rounded-full border border-white/20">
                                <Zap className="text-white w-6 h-6" />
                              </div>
                              <span className="font-black text-sm text-white mb-1 tracking-widest uppercase relative z-10">HOLLOW PURPLE</span>
                              <span className="text-[10px] text-gray-300 tracking-tighter uppercase relative z-10">Deal 45 Normal DMG</span>
                           </button>
                        </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-2xl mx-auto bg-black/60 backdrop-blur-xl border border-white/10 p-12 rounded-2xl flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50" />
                  <div className="relative mb-8">
                     <div className="absolute inset-0 bg-sky-400 blur-2xl opacity-20" />
                     <div className="text-6xl animate-pulse relative z-10">📡</div>
                  </div>
                  <h3 className="text-3xl text-white font-black uppercase tracking-[0.2em] mb-4">Transmission Sent</h3>
                  <div className="flex items-center gap-4 text-sky-400 font-bold text-xl tracking-[0.1em]">
                    <span className="w-12 h-[2px] bg-sky-400/30" />
                    Awaiting Uplink from {opponent?.name}
                    <span className="w-12 h-[2px] bg-sky-400/30" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'BATTLE_ANSWER_QUESTION' && question && (
            <motion.div 
              key="question"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl mx-auto bg-white border-[6px] border-[#fcd34d] rounded-[3rem] p-8 md:p-10 shadow-[0_16px_0_#fcd34d] relative mt-10"
            >
              <Timer endTime={questionEndTime} />
              
              {isPVE && (
                <button 
                  onClick={() => {
                    setRoomState((prev: any) => {
                      const next = JSON.parse(JSON.stringify(prev));
                      next.players[botOpponent.id].hp = 0;
                      return next;
                    });
                    setRoundResult({
                      player1: { stance: 'ATTACK', damageDealt: 999, correct: true },
                      [botOpponent.id]: { stance: 'IDLE', damageDealt: 0, correct: false }
                    });
                    setShowAnimation(true);
                    setTimeout(() => {
                      setShowAnimation(false);
                      setWinnerId('player1');
                      setGameState('GAME_OVER');
                    }, 3500);
                  }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500/20 hover:bg-red-500/40 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full border border-red-500/30 transition-all active:scale-95 cursor-pointer z-50 whitespace-nowrap"
                >
                  Demo: Instakill Guardian
                </button>
              )}
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#fbbf24] text-white font-black px-8 py-3 rounded-full text-xl md:text-2xl border-4 border-[#f59e0b] shadow-[0_6px_0_#f59e0b] z-20 whitespace-nowrap">
                CAST YOUR SPELL! ✨
              </div>

              <div className="text-xl md:text-3xl leading-snug font-bold my-8 text-center text-[#451a03] min-h-[120px] flex items-center justify-center bg-[#fef3c7] p-8 rounded-3xl border-4 border-[#fde68a]">
                <MathText text={question.text} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {question.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="p-6 text-xl md:text-2xl rounded-2xl border-4 border-[#e2e8f0] bg-white hover:bg-[#f8fafc] hover:border-[#38bdf8] active:translate-y-2 active:border-b-4 hover:shadow-[0_8px_0_#38bdf8] shadow-[0_8px_0_#e2e8f0] cursor-pointer transition-all flex items-center justify-center min-h-[100px] text-[#334155] font-bold"
                  >
                    <MathText text={opt} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {(showAnimation && roundResult) && (
            <motion.div key="battle-animation" className="absolute inset-0 z-50">
              <BattleAnimation 
                myResult={roundResult['me'] || (myId ? roundResult[myId] : null)} 
                oppResult={roundResult['opp'] || (oppId ? roundResult[oppId] : null)} 
                myAvatar={AVATARS[avatarIndex]} 
                oppAvatar={opponent?.avatar || AVATARS[1]} 
              />
            </motion.div>
          )}

          {gameState === 'BATTLE_RESOLVE' && !showAnimation && (
            <motion.div 
              key="resolve"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl mx-auto bg-white border-[6px] border-[#c4b5fd] rounded-[3rem] p-6 md:p-10 shadow-[0_16px_0_#c4b5fd] text-center mt-10"
            >
              {roundResult ? (
                <div>
                  <h2 className="text-4xl font-black text-[#8b5cf6] mb-8 uppercase tracking-wider drop-shadow-sm">Round Results</h2>
                  
                  {(() => {
                    const fallback = { stance: 'IDLE', correct: false, damageDealt: 0 };
                    const myData = roundResult[myId] || roundResult['me'] || fallback;
                    const oppData = (oppId ? roundResult[oppId] : null) || roundResult['opp'] || fallback;
                    
                    return (
                      <div className="flex flex-col md:flex-row justify-between items-center bg-[#f5f3ff] rounded-3xl p-4 md:p-8 shadow-inner gap-8 border-4 border-[#ede9fe]">
                        {/* My Result */}
                        <div className="flex-1 w-full text-center shrink-0">
                          <div className="text-sm font-black text-[#a78bfa] mb-2 uppercase tracking-widest">You</div>
                          <div className="text-6xl mb-4 drop-shadow-md">{getStanceIcon(myData.stance)}</div>
                          <div className={`font-black text-xl mb-2 px-4 py-2 inline-block rounded-full border-4 ${myData.correct ? 'bg-[#d1fae5] text-[#059669] border-[#6ee7b7]' : 'bg-[#ffe4e6] text-[#e11d48] border-[#fda4af]'}`}>
                            {myData.correct ? 'Correct! 🎯' : 'Missed! ❌'}
                          </div>
                          <div className="h-10 mt-4">
                            {myData.damageDealt > 0 && (
                              <div className="text-[#f59e0b] font-black text-2xl animate-bounce drop-shadow-sm">
                                Dealt {myData.damageDealt} DMG
                              </div>
                            )}
                            {myData.heal > 0 && (
                              <div className="text-[#10b981] font-black text-2xl animate-bounce drop-shadow-sm">
                                Healed {myData.heal} HP
                              </div>
                            )}
                            {myData.stance === 'DEFEND' && myData.correct && (
                              <div className="text-[#059669] font-black text-2xl">
                                Blocked! 🛡️
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-5xl font-black text-[#ddd6fe] shrink-0 select-none hidden md:block px-4">VS</div>
                        
                        {/* Opponent Result */}
                        <div className="flex-1 w-full text-center shrink-0">
                          <div className="text-sm font-black text-[#a78bfa] mb-2 uppercase tracking-widest truncate">{opponent?.name || 'Opponent'}</div>
                          <div className="text-6xl mb-4 drop-shadow-md">{getStanceIcon(oppData.stance)}</div>
                          <div className={`font-black text-xl mb-2 px-4 py-2 inline-block rounded-full border-4 ${oppData.correct ? 'bg-[#d1fae5] text-[#059669] border-[#6ee7b7]' : 'bg-[#ffe4e6] text-[#e11d48] border-[#fda4af]'}`}>
                            {oppData.correct ? 'Correct! 🎯' : 'Missed! ❌'}
                          </div>
                          <div className="h-10 mt-4">
                            {oppData.damageDealt > 0 && (
                              <div className="text-[#f59e0b] font-black text-2xl animate-bounce drop-shadow-sm">
                                Dealt {oppData.damageDealt} DMG
                              </div>
                            )}
                            {oppData.heal > 0 && (
                              <div className="text-[#10b981] font-black text-2xl animate-bounce drop-shadow-sm">
                                Healed {oppData.heal} HP
                              </div>
                            )}
                            {oppData.stance === 'DEFEND' && oppData.correct && (
                              <div className="text-[#059669] font-black text-2xl">
                                Blocked! 🛡️
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="mt-8 text-[#8b5cf6] font-bold text-xl">
                    {((roomState?.players[myId]?.hp || 0) <= 0 || (oppId && (roomState?.players[oppId]?.hp || 0) <= 0)) ? (
                      <span className="animate-pulse">The battle concludes...</span>
                    ) : (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Next round starting...
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <div className="text-6xl mb-6 animate-bounce">🔮</div>
                  <div className="text-3xl text-[#8b5cf6] font-black mb-2">Spell Cast!</div>
                  <div className="text-[#a78bfa] text-xl font-bold">Waiting for your opponent...</div>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && (
            <motion.div 
              key="gameover"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full h-full absolute inset-0 flex flex-col items-center justify-center z-[150] p-4 text-center ${winnerId === myId ? 'bg-[#d1fae5]/90' : winnerId === 'DRAW' ? 'bg-[#f1f5f9]/90' : 'bg-[#ffe4e6]/90'} backdrop-blur-md`}
            >
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white p-12 rounded-[3rem] border-[8px] shadow-[0_16px_0_rgba(0,0,0,0.1)] max-w-2xl w-full"
                style={{
                  borderColor: winnerId === myId ? '#34d399' : winnerId === 'DRAW' ? '#cbd5e1' : '#fb7185'
                }}
              >
                <div className="text-9xl mb-6 drop-shadow-md">
                  {winnerId === myId ? '🏆' : winnerId === 'DRAW' ? '🤝' : '💀'}
                </div>
                <h1 className={`text-6xl md:text-8xl font-black mb-6 drop-shadow-sm ${winnerId === myId ? 'text-[#059669]' : winnerId === 'DRAW' ? 'text-[#64748b]' : 'text-[#e11d48]'}`}>
                  {winnerId === myId ? 'VICTORY!' : winnerId === 'DRAW' ? 'DRAW!' : 'DEFEAT!'}
                </h1>
                
                <div className="text-xl md:text-2xl text-[#334155] mb-12 font-medium">
                  {isPVE && winnerId === 'player1' && botOpponent?.deathDialog ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 italic text-slate-600 relative">
                       <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-black text-slate-400 uppercase tracking-widest">Final Words</span>
                       {botOpponent.deathDialog[Math.min(deathDialogIndex, botOpponent.deathDialog.length - 1)]}
                    </div>
                  ) : (
                    winnerId === myId 
                      ? "Your calculus knowledge is superior. You have defeated your opponent!" 
                      : winnerId === 'DRAW'
                      ? "Both wizards mutually destroyed each other in a burst of calculus energy."
                      : "Your opponent's calculus mastery proved too overwhelming this time."
                  )}
                </div>
                
                <button 
                  onClick={restartGame}
                  className={`px-12 py-5 text-white rounded-full font-black text-xl md:text-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_0_rgba(0,0,0,0.2)] active:translate-y-2 active:shadow-[0_0px_0_rgba(0,0,0,0.2)] transition-all cursor-pointer ${
                    winnerId === myId ? 'bg-[#10b981]' : winnerId === 'DRAW' ? 'bg-[#94a3b8]' : 'bg-[#f43f5e]'
                  }`}
                >
                  {isPVE && winnerId === 'player1' && botOpponent?.deathDialog && deathDialogIndex < botOpponent.deathDialog.length - 1 
                    ? "Listen..." 
                    : isPVE && winnerId === 'player1' 
                    ? "Collect Fragment" 
                    : "Play Again"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Debug Panel Toggle */}
      <button 
        onClick={() => setIsDebugOpen(!isDebugOpen)}
        className="fixed bottom-4 right-4 z-[100] bg-black/80 text-white p-3 rounded-full text-xs font-bold border-2 border-white/20 hover:scale-110 active:scale-95 transition-all shadow-xl"
      >
        {isDebugOpen ? 'Close Test' : 'Test Tools'}
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {isDebugOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-20 right-4 z-[100] bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] shadow-2xl border-4 border-[#3ecf8e] w-80 max-h-[70vh] overflow-y-auto"
          >
            <h3 className="text-xl font-black text-[#2bae74] mb-4 flex items-center gap-2">
              🧪 Lab Tools
            </h3>

            <div className="space-y-6">
              {/* Background Theme Section */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Environment Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'normal', icon: '🌤️' },
                    { id: 'winning', icon: '🔥' },
                    { id: 'losing', icon: '🌊' },
                    { id: 'intense', icon: '🌌' }
                  ].map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setDebugBg(bg.id as any)}
                      className={`p-3 rounded-2xl text-xs font-bold border-4 transition-all flex items-center gap-2 ${debugBg === bg.id ? 'bg-[#3ecf8e] text-white border-green-500 scale-105' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {bg.icon} {bg.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Test Section */}
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Trigger Animation</p>
                <div className="space-y-2">
                  {[
                    { id: 'SUPER_HOLLOW_PURPLE', label: 'Hollow Purple (Me)', isMe: true },
                    { id: 'SUPER_HOLLOW_PURPLE', label: 'Hollow Purple (Opp)', isMe: false },
                    { id: 'SUPER_BANKAI', label: 'Bankai Swords (Me)', isMe: true },
                    { id: 'SUPER_BANKAI', label: 'Bankai Swords (Opp)', isMe: false },
                    { id: 'SUPER_DOMAIN_EXPANSION', label: 'Domain Expansion (Me)', isMe: true },
                    { id: 'SUPER_DOMAIN_EXPANSION', label: 'Domain Expansion (Opp)', isMe: false },
                    { id: 'ATTACK', label: 'Basic Attack', isMe: true },
                  ].map((anim, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const mockResult = {
                          'me': { stance: anim.isMe ? anim.id : 'DEFEND', correct: true, damageDealt: anim.isMe ? 50 : 0 },
                          'opp': { stance: !anim.isMe ? anim.id : 'DEFEND', correct: true, damageDealt: !anim.isMe ? 50 : 0 }
                        };
                        setRoundResult(mockResult);
                        setShowAnimation(true);
                        setTimeout(() => setShowAnimation(false), 10500);
                      }}
                      className="w-full p-4 rounded-3xl bg-gray-100 border-4 border-gray-200 hover:bg-white hover:border-[#3ecf8e] transition-all text-sm font-black text-gray-700 flex justify-between items-center group"
                    >
                      {anim.label}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">⚡</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-gray-400 text-center font-bold">
              Test animations last ~10s.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getStanceIcon(stance: string) {
  if (stance === 'ATTACK') return <Sword className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'DEFEND') return <Shield className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'MAGIC') return <Wand2 className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'HEAL') return <Heart className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'SUPER_DOMAIN_EXPANSION') return <Sparkles className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'SUPER_BANKAI') return <Skull className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  if (stance === 'SUPER_HOLLOW_PURPLE') return <Zap className="w-16 h-16 inline-block" strokeWidth={1.5} />;
  return '❓';
}

function Timer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className={`absolute top-6 right-6 font-mono font-black text-2xl md:text-3xl px-6 py-3 rounded-2xl border-4 shadow-[0_6px_0_rgba(0,0,0,0.1)] z-20 flex items-center justify-center min-w-[100px] ${timeLeft <= 5 ? 'bg-[#ffe4e6] text-[#e11d48] border-[#fb7185] animate-bounce' : 'bg-white text-[#334155] border-[#cbd5e1]'}`}>
      {timeLeft}s
    </div>
  );
}

function BattleAnimation({ myResult, oppResult, myAvatar, oppAvatar }: { myResult: any, oppResult: any, myAvatar: string, oppAvatar: string }) {
  const [step, setStep] = useState<'my_turn' | 'opp_turn'>('my_turn');

  useEffect(() => {
    // Determine duration based on stance - significantly faster for high tempo
    const getDuration = (stance: string) => {
      if (!stance) return 800;
      if (stance.includes('DOMAIN')) return 2500;
      if (stance.includes('PURPLE')) return 2000;
      if (stance.includes('BANKAI')) return 2000;
      return 1200;
    };
    
    const myStanceDuration = getDuration(myResult?.stance);
    const t = setTimeout(() => setStep('opp_turn'), myStanceDuration); 
    return () => clearTimeout(t);
  }, [myResult]);

  const fallback = { stance: 'IDLE', correct: false, damageDealt: 0 };
  const safeMyResult = myResult || fallback;
  const safeOppResult = oppResult || fallback;

  const currentResult = step === 'my_turn' ? safeMyResult : safeOppResult;
  const isDomain = currentResult?.stance === 'SUPER_DOMAIN_EXPANSION' && currentResult?.correct;
  const isPurple = currentResult?.stance === 'SUPER_HOLLOW_PURPLE' && currentResult?.correct;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none overflow-hidden">
       {/* Normal backdrop */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="absolute inset-0 bg-black/60 backdrop-blur-md z-0"
       />

       {/* Domain Expansion Backdrop */}
       <AnimatePresence>
         {isDomain && (
            <motion.div
               key={`domain-${step}`}
               initial={{ opacity: 0, scale: 0 }}
               animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 4] }}
               transition={{ duration: 3.5, times: [0, 0.1, 0.8, 1], ease: "easeInOut" }}
               className="absolute inset-0 z-10 flex items-center justify-center"
            >
                <div className="w-[200vmax] h-[200vmax] bg-black rounded-full shadow-[inset_0_0_100px_rgba(255,255,255,0.2)]" />
            </motion.div>
         )}
       </AnimatePresence>

       {/* Hollow Purple Backdrop */}
       {isPurple && (
           <div key={`purple-${step}`} className="absolute inset-0 z-10 flex items-center justify-center">
              <motion.div
                 initial={{ x: -400, opacity: 0 }}
                 animate={{ x: 0, opacity: [0, 1, 1, 0], scale: [0.5, 2, 0] }}
                 transition={{ duration: 1 }}
                 className="absolute w-64 h-64 rounded-full bg-[#3b82f6] blur-[60px] mix-blend-screen"
              />
              <motion.div
                 initial={{ x: 400, opacity: 0 }}
                 animate={{ x: 0, opacity: [0, 1, 1, 0], scale: [0.5, 2, 0] }}
                 transition={{ duration: 1 }}
                 className="absolute w-64 h-64 rounded-full bg-[#ef4444] blur-[60px] mix-blend-screen"
              />
              <motion.div
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: [0, 0, 1, 1, 0], scale: [0, 0, 20, 50, 100] }}
                 transition={{ duration: 2.5, times: [0, 0.4, 0.45, 0.8, 1] }}
                 className="absolute w-64 h-64 rounded-full bg-[#a855f7] mix-blend-screen blur-[40px]"
              />
           </div>
       )}

       <div className="w-full max-w-6xl relative h-[600px] flex justify-between items-center px-10 md:px-24 z-20">
           <PlayerAnimation 
             result={safeMyResult} 
             avatar={myAvatar} 
             isMe={true} 
             active={step === 'my_turn'} 
             damageTaken={step === 'opp_turn' ? (safeOppResult.damageDealt || 0) : 0}
           />
           <div className="flex-1" />
           <PlayerAnimation 
             result={safeOppResult} 
             avatar={oppAvatar} 
             isMe={false} 
             active={step === 'opp_turn'} 
             damageTaken={step === 'my_turn' ? (safeMyResult.damageDealt || 0) : 0}
           />
       </div>
    </div>
  );
}

function EnergyParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: '110%', 
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: '-10%', 
            opacity: [0, 0.2, 0],
            rotate: 360
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            delay: i * 1,
            ease: "linear"
          }}
          className="absolute w-24 h-24 border border-blue-400/10 rounded-full"
        />
      ))}
    </div>
  );
}

function BattleLog({ roundResult, myId }: { roundResult: any, myId: string }) {
  if (!roundResult) return null;
  const oppId = Object.keys(roundResult).find(id => id !== myId && id !== 'me' && id !== 'opp') || 'opp';
  const myData = roundResult[myId] || roundResult['me'];
  const oppData = roundResult[oppId] || roundResult['opp'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 w-48 space-y-3 z-30 hidden lg:block"
    >
      <div className="bg-white/40 backdrop-blur-md rounded-3xl p-4 border-2 border-white/50 shadow-lg">
        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 px-1">Battle Feed</h4>
        <div className="space-y-2">
          {myData?.stance && (
            <div className="text-xs font-bold text-slate-700">
              <span className="text-blue-600">You</span> used <span className="text-indigo-500">{myData.stance.replace('SUPER_', '')}</span>
              {myData.correct ? <span className="text-green-500 ml-1">✓</span> : <span className="text-red-400 ml-1">✗</span>}
            </div>
          )}
          {oppData?.stance && (
            <div className="text-xs font-bold text-slate-700">
              <span className="text-red-400">Opponent</span> used <span className="text-orange-500">{oppData.stance.replace('SUPER_', '')}</span>
              {oppData.correct ? <span className="text-green-500 ml-1">✓</span> : <span className="text-red-400 ml-1">✗</span>}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-indigo-500/10 border-2 border-indigo-500/20 rounded-2xl p-3 backdrop-blur-sm">
        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Current Phase</p>
        <p className="text-xs font-black text-indigo-600">IN BATTLE</p>
      </div>
    </motion.div>
  );
}

function DynamicBackground({ myHp, oppHp, overrideMode, selectedBgColor }: { myHp: number, oppHp: number, overrideMode?: 'winning' | 'losing' | 'intense', selectedBgColor: string }) {
  const isWinning = overrideMode === 'winning' || (!overrideMode && oppHp < 40 && myHp >= 40);
  const isLosing = overrideMode === 'losing' || (!overrideMode && myHp < 40 && oppHp >= 40);
  const isIntense = overrideMode === 'intense' || (!overrideMode && myHp < 40 && oppHp < 40);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 overflow-hidden">
      {/* User Selected Base Color */}
      <motion.div 
        animate={{ 
          backgroundColor: overrideMode === 'winning' ? '#fff7ed' : overrideMode === 'losing' ? '#f0f9ff' : overrideMode === 'intense' ? '#1e1b4b' : myHp < 40 && oppHp < 40 ? '#1e1b4b' : (selectedBgColor || '#1e1b4b')
        }}
        className="absolute inset-0"
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Winning - Fiery Aura */}
      <AnimatePresence>
        {isWinning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-orange-500/30 via-red-500/10 to-transparent" />
            <motion.div 
              animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"
            />
            {/* Fire sparks */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '100%', x: `${Math.random() * 100}%`, opacity: 0 }}
                animate={{ y: '-20%', opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: i * 0.3 }}
                className="absolute w-2 h-2 bg-orange-400 rounded-full blur-[1px]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Losing - Danger Aura */}
      <AnimatePresence>
        {isLosing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1] }} 
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 border-[40px] border-blue-500/10 blur-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intense - Purple Void */}
      <AnimatePresence>
        {isIntense && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ rotate: { repeat: Infinity, duration: 20, ease: "linear" }, scale: { repeat: Infinity, duration: 5 } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-conic from-purple-900/40 via-transparent to-purple-900/40 opacity-30 blur-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PlayerAnimation({ result, avatar, isMe, active, damageTaken }: { result: any, avatar: string, isMe: boolean, active: boolean, damageTaken: number }) {
    if (!result) return null;
    const isAttack = active && result.stance === 'ATTACK' && result.correct;
    const isMagic = active && result.stance === 'MAGIC' && result.correct;
    const isDefend = active && result.stance === 'DEFEND' && result.correct;
    const isHeal = active && result.stance === 'HEAL' && result.correct;
    const isDomain = active && result.stance === 'SUPER_DOMAIN_EXPANSION' && result.correct;
    const isBankai = active && result.stance === 'SUPER_BANKAI' && result.correct;
    const isPurple = active && result.stance === 'SUPER_HOLLOW_PURPLE' && result.correct;
    const isMiss = active && !result.correct;
    const dmg = damageTaken;

    return (
        <motion.div 
            initial={{ x: isMe ? -200 : 200, opacity: 0 }}
            animate={{ 
                x: 0,
                opacity: 1,
                y: active ? [0, -10, 0] : (damageTaken > 0 ? [0, 10, -10, 0] : 0),
                scale: isDefend ? [1, 1.1, 1] : (damageTaken > 0 ? [1, 0.95, 1] : 1)
            }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col items-center relative z-20`}
        >
            <div className="relative">
                {/* Aura Glow */}
                <AnimatePresence>
                  {active && result.correct && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className={`absolute inset-0 rounded-full blur-2xl z-0 ${
                        isMe ? 'bg-emerald-400/40' : 'bg-rose-400/40'
                      }`}
                    />
                  )}
                </AnimatePresence>

                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className={`w-32 h-32 md:w-56 md:h-56 rounded-full border-[10px] bg-white drop-shadow-2xl relative z-10 ${
                    isMe ? 'border-[#3ecf8e]' : 'border-[#ff6b8b]'
                  } ${active && !result.correct ? 'grayscale contrast-125' : ''}`} 
                />
                
                {/* Visual Effects */}
                
                {/* 1. Basic Attack: Crescent Slash */}
                <AnimatePresence>
                  {isAttack && (
                    <motion.div 
                      key="attack-slash"
                      className={`absolute top-1/2 ${isMe ? 'left-full ml-8' : 'right-full mr-8'} -translate-y-1/2 w-64 h-64 z-30 pointer-events-none`}
                    >
                      <svg viewBox="0 0 200 200" className={`w-full h-full overflow-visible ${!isMe ? 'scale-x-[-1]' : ''}`}>
                        <motion.path
                          d="M 20 180 Q 100 100 180 20"
                          fill="none"
                          stroke="white"
                          strokeWidth="20"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="drop-shadow-[0_0_15px_white]"
                        />
                        <motion.path
                          d="M 20 180 Q 100 100 180 20"
                          fill="none"
                          stroke={isMe ? "#3ecf8e" : "#ff6b8b"}
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Magic: Glowing Energy Orb */}
                <AnimatePresence>
                  {isMagic && (
                    <motion.div 
                      key="magic-orb"
                      initial={{ opacity: 0, x: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        x: isMe ? [0, 400, 500] : [0, -400, -500],
                        scale: [0.5, 2, 2.5, 0],
                        rotate: 360
                      }}
                      transition={{ duration: 1.2, ease: "anticipate" }}
                      className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-24 h-24 rounded-full z-20 mix-blend-screen blur-sm shadow-[0_0_40px_rgba(255,255,255,0.8)] ${
                        isMe ? 'bg-gradient-to-br from-indigo-400 to-purple-600' : 'bg-gradient-to-br from-orange-400 to-red-600'
                      }`}
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-white/30 border-dashed animate-spin" />
                      <div className="absolute inset-2 rounded-full bg-white/20 blur-md" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Defend: Hexagonal Forcefield */}
                <AnimatePresence>
                  {isDefend && (
                    <motion.div 
                      key="defend-shield"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 1.4] }}
                      transition={{ duration: 1.5 }}
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 z-20 flex items-center justify-center`}
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_#34d399]">
                        <motion.path
                          d="M 50 5 L 90 25 L 90 75 L 50 95 L 10 75 L 10 25 Z"
                          fill="rgba(52, 211, 153, 0.1)"
                          stroke="#34d399"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        <path
                          d="M 50 15 L 80 30 L 80 70 L 50 85 L 20 70 L 20 30 Z"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                          className="animate-pulse"
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* HEAL: Green Aura */}
                <AnimatePresence>
                  {isHeal && (
                    <motion.div 
                      key="heal-effect"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [1, 2, 2.5] }}
                      transition={{ duration: 1.2 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-56 md:h-56 z-20"
                    >
                       <div className="absolute inset-0 rounded-full border-[10px] border-[#10b981] opacity-50 blur-lg" />
                       <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-md">➕</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 4. Domain Expansion: Inverted Sphere Void */}
                <AnimatePresence>
                  {isDomain && (
                    <motion.div 
                      key="domain-void"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        scale: [0, 8, 12, 15],
                      }}
                      transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full z-40 bg-black shadow-[0_0_50px_black] border-4 border-white/10`}
                    >
                       <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[-20%] rounded-full border-2 border-white/5 border-dashed" 
                       />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 5. Bankai: Rain of Metallic Swords */}
                <AnimatePresence>
                  {isBankai && (
                    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 z-30 pointer-events-none w-0 h-0 flex items-center justify-center">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            opacity: 0, 
                            y: -600 + (Math.random() - 0.5) * 200,
                            x: isMe ? (i * 40 - 400) : (400 - i * 40),
                            rotate: isMe ? 135 : -135
                          }}
                          animate={{ 
                            opacity: [0, 1, 1, 0],
                            y: 600,
                            x: isMe ? (i * 40 + 200) : (-i * 40 - 200)
                          }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: "easeIn" }}
                          className="absolute w-8 h-32"
                        >
                           <svg viewBox="0 0 40 160" className="w-full h-full drop-shadow-xl">
                              <defs>
                                <linearGradient id={`blade-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#cbd5e1" />
                                  <stop offset="50%" stopColor="white" />
                                  <stop offset="100%" stopColor="#64748b" />
                                </linearGradient>
                              </defs>
                              <path d="M 20 0 L 35 25 L 30 130 L 20 145 L 10 130 L 5 25 Z" fill={`url(#blade-${i})`} stroke="#334155" strokeWidth="1" />
                              <rect x="5" y="130" width="30" height="8" rx="2" fill="#1e293b" />
                              <rect x="15" y="138" width="10" height="20" rx="1" fill="#0f172a" />
                           </svg>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                {/* 6. Hollow Purple: Spatial Distortion Beam */}
                <AnimatePresence>
                  {isPurple && (
                    <motion.div 
                      key="hollow-purple"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 2.5, 3, 0],
                        opacity: [0, 1, 1, 0],
                        x: isMe ? [0, 600, 800] : [0, -600, -800]
                      }}
                      transition={{ duration: 2, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
                      className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-48 h-48 rounded-full z-40 blur-xl mix-blend-screen bg-purple-600 shadow-[0_0_100px_purple]`}
                    >
                       <div className="absolute inset-0 rounded-full bg-white opacity-20 blur-md animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 7. Miss/Failure Indicator */}
                <AnimatePresence>
                  {isMiss && (
                    <motion.div 
                      initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -150, scale: [0.8, 1.2, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap"
                    >
                       <span className="bg-rose-600 text-white font-black px-8 py-3 rounded-2xl border-[6px] border-rose-200 shadow-2xl text-3xl tracking-widest uppercase italic">
                          Missed!
                       </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 8. Damage Text: Premium Gradient Effects */}
                <AnimatePresence>
                  {dmg > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -200, scale: [0.5, 2, 2, 1.5] }}
                      transition={{ duration: 1, delay: 0, ease: "backOut" }}
                      className={`absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none`}
                    >
                      <span 
                        className="text-7xl font-black italic tracking-tighter filter drop-shadow-[0_8px_0_rgba(0,0,0,0.8)]"
                        style={{
                          WebkitTextStroke: '3px #451a03',
                          background: 'linear-gradient(to bottom, #fde68a 0%, #f59e0b 50%, #b45309 100%)',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        -{dmg} HP
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

