import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// === MAP DEFINITION ===
// 0: Parametric Plains (Grass)
// 1: Path (Dirt/Sand)
// 2: Polar Kingdom (Water/Ice)
// 3: Derivative Mountains (Stone)
// 4: Valley of Area (Purple Flora)
// 5: Rift Between (Dark Void)
// 6: Wall (Impassable Rock/Edge)
// 7: Foliage (Trees/Bushes - impassable but decorative)
// 8: Water Obstacle (Impassable water)
const MAP_WIDTH = 30;
const MAP_HEIGHT = 45;
const TILE_SIZE = 64; 

const WORLD_MAP = [
  // --- STARTING AREA: PARAMETRIC PLAINS ---
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,7,7,7,0,7,7,7,0,7,7,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,7,0,0,0,0,0,7,0,0,7,0,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,0,0,0,0,0,0,0,7,0,1,0,0,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,7,7,1,1,1,1,7,7,7,7,0,1,0,0,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,7,7,0,1,0,0,1,1,1,1,1,1,1,0,0,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,3,3,3,3,3,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  
  // --- CHOKEPOINT 1: THE TWIN PATH ---
  [6,6,6,6,6,6,6,6,6,6,3,1,1,1,3,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,3,1,0,1,3,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
  [6,3,3,3,3,3,3,3,3,3,3,1,0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6],
  
  // --- ZONE 2: POLAR KINGDOM (Sinuous Paths) ---
  [6,3,2,2,2,2,2,2,2,2,2,1,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,6],
  [6,3,2,2,8,8,8,8,8,8,2,1,1,1,2,8,8,8,8,8,8,8,8,8,8,8,2,2,3,6],
  [6,3,2,2,8,2,2,2,2,8,2,2,2,2,2,8,2,2,2,2,2,2,2,2,2,8,2,2,3,6],
  [6,3,2,2,8,2,1,1,2,8,8,8,8,8,8,8,2,1,1,1,1,1,1,1,2,8,2,2,3,6],
  [6,3,2,2,8,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,8,2,2,3,6],
  [6,3,2,2,8,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,1,2,8,2,2,3,6],
  [6,3,2,2,8,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,8,2,2,3,6],
  [6,3,2,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,1,2,8,2,2,3,6],
  [6,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,3,6],
  
  // --- CHOKEPOINT 2: SPIRAL PASS ---
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,3,3,3,1,1,3,3,3,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,3,2,2,1,2,2,3,3,6,6,6],
  [6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,1,2,2,3,3,6,6,6],
  
  // --- ZONE 3: DERIVATIVE MOUNTAINS ---
  [6,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,6,6,6],
  [6,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,6,6,6],
  [6,3,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,6,6,6],
  [6,3,1,1,1,1,1,1,1,3,3,3,3,3,3,1,1,1,1,1,1,3,3,3,1,3,3,6,6,6],
  [6,3,3,3,3,3,3,3,1,3,3,3,3,3,3,1,3,3,3,3,1,3,3,3,1,3,3,6,6,6],
  [6,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,3,3,3,3,1,1,1,1,1,3,3,6,6,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,3,3,3,3,3,3,3,3,3,3,6,6,6,6,6],

  // --- ZONE 4: VALLEY OF AREA (Open Purple Meadows) ---
  [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],
  [6,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,6],
  [6,1,4,7,7,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,1,6],
  [6,1,4,7,7,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,7,7,4,4,4,4,4,1,6],
  [6,1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1,6],
  [6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6],

  // --- FINAL ZONE: THE RIFT ---
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6],
  [6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6],
  [6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1,1,5,5,5,5,5,5,5,5,5,5,5,6],
  [6,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1,5,1,1,5,5,5,5,5,5,5,5,5,5,6],
  [6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,1,1,1,5,5,5,5,5,5,5,5,5,5,5,6],
  [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
];

// Determine if a tile is walkable
const isWalkable = (x: number, y: number) => {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  const tile = WORLD_MAP[y][x];
  return tile !== 6 && tile !== 7 && tile !== 8; // Can't walk on walls, foliage, or deep water
};

// NPCs
const INITIAL_NPCS = [
  { 
    id: 'elder', 
    x: 2, 
    y: 2, 
    name: 'The Elder', 
    type: 'friendly', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=elder',
    dialog: [
      "Axiom... You've awakened.", 
      "The Fracture has broken our world. The Infinite Core is shattered.", 
      "The five great regions are corrupted by the Fragment Guardians.",
      "You were marked by the Core. Only you can retrieve the fragments.",
      "Seek the Twin Path Guardian in the Parametric Choke to the East.",
      "The gate to the Polar Kingdom will open once the first fragment is yours."
    ] 
  },
  { 
    id: 'parametric', 
    x: 12, 
    y: 13, 
    name: 'Twin Path Guardian', 
    topic: 'Parametric',
    type: 'enemy', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=twin',
    dialog: ["I am the intersection...", "You cannot trace my path!", "Let the parametric forces crush you!"], 
    deathDialog: ["The lines... they're straightening...", "My paths... diverge...", "The fragment... is yours..."],
    isBattle: true, 
    hp: 150 
  },
  { 
    id: 'spiral', 
    x: 23, 
    y: 23, 
    name: 'Spiral King', 
    topic: 'Polar Graphing',
    type: 'enemy', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=spiral',
    dialog: ["Everything spirals inward...", "You will become part of my curve.", "There is no escape from the center!"], 
    deathDialog: ["The spiral... breaks...", "I am... unravelling...", "Return... to the... origin..."],
    isBattle: true, 
    hp: 200 
  },
  { 
    id: 'change', 
    x: 12, 
    y: 31, 
    name: 'Lord of Change', 
    topic: 'Polar Derivatives',
    type: 'enemy', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=change',
    dialog: ["A static point is a dead point.", "I am the slope. I am the shift.", "Perish in the tangent!"], 
    deathDialog: ["The rate of change... hit zero...", "I have... reached... my limit...", "The slope... is gone..."],
    isBattle: true, 
    hp: 250 
  },
  { 
    id: 'collector', 
    x: 15, 
    y: 36, 
    name: 'The Collector', 
    topic: 'Polar Area',
    type: 'enemy', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=collector',
    dialog: ["So much empty space...", "I must fill the area. I must integrate it all.", "Give me your bounds!"], 
    deathDialog: ["The area... is empty...", "My bounds... have failed...", "Calculated... to nothing..."],
    isBattle: true, 
    hp: 350 
  },
  { 
    id: 'divergence', 
    x: 16, 
    y: 41, 
    name: 'Divergence Entity', 
    topic: 'Nightmare',
    type: 'enemy', 
    sprite: 'https://api.dicebear.com/7.x/bottts/svg?seed=divergence',
    dialog: ["......", "INF1N1TE ERR0R", "R1FT EXPAND1NG..."], 
    deathDialog: ["ERR0R... NOT... FOUND...", "D1V3RGENC3... ST0PPED...", "C0R3... R3UN1T1NG..."],
    isBattle: true, 
    hp: 600 
  },
];

export interface BotOpponent {
  id: string;
  name: string;
  avatar: string;
  hp: number;
  topic?: string;
  deathDialog?: string[];
}

interface CampaignWorldProps {
  name: string;
  avatar: string;
  onBack: () => void;
  onStartBattle: (bot: BotOpponent) => void;
}

class CampaignStore {
  playerPos = { x: 3, y: 3 };
  npcs = INITIAL_NPCS;
  defeatedIds: string[] = [];
  isCompleted = false;
  hasTalkedToElder = false;

  save(pos: {x:number, y:number}, npcs: any[]) {
    this.playerPos = pos;
    this.npcs = npcs;
  }
  markDefeated(id: string) {
    this.npcs = this.npcs.filter(n => n.id !== id);
    if (!this.defeatedIds.includes(id)) {
      this.defeatedIds.push(id);
    }
    if (id === 'divergence') {
      this.isCompleted = true;
    }
  }

  getNextObjective() {
    if (this.isCompleted) return null;
    
    // Sequence logic for the arrow guide
    const sequence = ['elder', 'parametric', 'spiral', 'change', 'collector', 'divergence'];
    for (const id of sequence) {
      if (id === 'elder' && (this.defeatedIds.length > 0 || this.hasTalkedToElder)) continue;
      if (!this.defeatedIds.includes(id)) {
        const npc = INITIAL_NPCS.find(n => n.id === id);
        if (npc) return { x: npc.x, y: npc.y, id: npc.id };
      }
    }
    return null;
  }

  getBuffs() {
    return {
      hpBonus: this.defeatedIds.length * 25,
      dmgBonus: this.defeatedIds.length * 10,
      superBonus: this.defeatedIds.includes('collector') ? 50 : 0
    };
  }
}
export const campaignStore = new CampaignStore();

export default function CampaignWorld({ name, avatar, onBack, onStartBattle }: CampaignWorldProps) {
  // Player state
  const [playerPos, setPlayerPos] = useState(campaignStore.playerPos);
  const [facing, setFacing] = useState<'down'|'up'|'left'|'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);
  const keysPressed = React.useRef<Set<string>>(new Set());
  
  // World State
  const [npcs, setNpcs] = useState(campaignStore.npcs);
  const [activeDialog, setActiveDialog] = useState<null | { npcId: string, textLines: string[], currentLineIndex: number }>(null);

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("");

  // Save pos on unmount
  useEffect(() => {
    return () => {
      campaignStore.save(playerPos, npcs);
    };
  }, [playerPos, npcs]);

  useEffect(() => {
    if (campaignStore.isCompleted) {
      setShowConclusion(true);
    }
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (isMoving || activeDialog) return;

    let dx = 0;
    let dy = 0;
    if (direction === 'up') dy = -1;
    if (direction === 'down') dy = 1;
    if (direction === 'left') dx = -1;
    if (direction === 'right') dx = 1;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    setFacing(direction);

    if (isWalkable(newX, newY) && !npcs.some(n => n.x === newX && n.y === newY)) {
      setIsMoving(true);
      setPlayerPos({ x: newX, y: newY });
      setTimeout(() => setIsMoving(false), 150); // Faster movement reset for fluidity
    }
  }, [playerPos, isMoving, activeDialog, npcs]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key.toLowerCase());

    if (activeDialog) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e') {
        // Advance dialog
        if (activeDialog.currentLineIndex < activeDialog.textLines.length - 1) {
          setActiveDialog({ ...activeDialog, currentLineIndex: activeDialog.currentLineIndex + 1 });
        } else {
          setActiveDialog(null);
          if (activeDialog.npcId === 'elder') {
            campaignStore.hasTalkedToElder = true;
          }
          const npc = npcs.find(n => n.id === activeDialog.npcId);
          if (npc && npc.isBattle) {
            onStartBattle({ 
              id: npc.id, 
              name: npc.name, 
              avatar: npc.sprite, 
              hp: npc.hp!, 
              topic: npc.topic,
              deathDialog: npc.deathDialog
            });
          }
        }
      }
      return; 
    }

    // Check Interaction (triggered on key down instead of loop)
    if (e.key === 'e' || e.key === 'Enter' || e.key === ' ') {
      let checkX = playerPos.x;
      let checkY = playerPos.y;
      if (facing === 'up') checkY--;
      if (facing === 'down') checkY++;
      if (facing === 'left') checkX--;
      if (facing === 'right') checkX++;

      const npc = npcs.find(n => n.x === checkX && n.y === checkY);
      if (npc) {
        setActiveDialog({ npcId: npc.id, textLines: npc.dialog, currentLineIndex: 0 });
      }
    }
  }, [playerPos, facing, activeDialog, npcs, onStartBattle]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase());
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Movement Loop for holding keys
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMoving || activeDialog) return;

      const keys = keysPressed.current;
      if (keys.has('w') || keys.has('arrowup')) move('up');
      else if (keys.has('s') || keys.has('arrowdown')) move('down');
      else if (keys.has('a') || keys.has('arrowleft')) move('left');
      else if (keys.has('d') || keys.has('arrowright')) move('right');
    }, 50); // Frequent checks for immediate responsiveness

    return () => clearInterval(interval);
  }, [isMoving, activeDialog, move]);

  // Typewriter effect
  useEffect(() => {
    if (activeDialog) {
      setDisplayedText("");
      const fullText = activeDialog.textLines[activeDialog.currentLineIndex];
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText(fullText.substring(0, i + 1));
        i++;
        if (i >= fullText.length) {
          clearInterval(intervalId);
        }
      }, 30);
      return () => clearInterval(intervalId);
    }
  }, [activeDialog, activeDialog?.currentLineIndex]);


  // Rendering Map
  const renderTile = (x: number, y: number, tileType: number) => {
    let bg = '';
    let content: React.ReactNode = null;

    switch (tileType) {
      case 0: // Grass
        bg = (x + y) % 3 === 0 ? 'bg-[#a7f3d0]' : 'bg-[#6ee7b7]'; // Varied green
        if ((x * y) % 7 === 0) content = '🌱';
        break;
      case 1: // Path
        bg = 'bg-[#fef3c7]'; // pastel path
        if ((x + y) % 8 === 0) content = '🪨';
        break;
      case 2: // Polar Kingdom Water
        bg = 'bg-[#bae6fd]'; // pastel blue
        if ((x * y) % 5 === 0) content = '❄️';
        break;
      case 3: // Mountains
        bg = 'bg-[#94a3b8]'; // slate gray
        content = '⛰️';
        break;
      case 4: // Valley of Area
        bg = 'bg-[#ddd6fe]'; // pastel purple
        if ((x + y) % 6 === 0) content = '🌸';
        break;
      case 5: // Rift Between
        bg = 'bg-[#0f172a]'; // deep navy/black
        if ((x * y) % 4 === 0) content = <motion.span animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>✨</motion.span>;
        break;
      case 6: // Edge Wall
        bg = 'bg-[#1e293b]';
        break;
      case 7: // Foliage
        bg = 'bg-[#065f46]';
        content = (x + y) % 2 === 0 ? '🌲' : '🌳';
        break;
      case 8: // Deep Water Obstacle
        bg = 'bg-[#0369a1]';
        content = '🌊';
        break;
      default:
        bg = 'bg-black';
    }

    return (
      <div 
        key={`${x}-${y}`} 
        className={`absolute flex items-center justify-center text-3xl select-none ${bg} shadow-sm border-b-2 border-black/5`}
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          left: x * TILE_SIZE,
          top: y * TILE_SIZE,
        }}
      >
        <span className="opacity-70 text-2xl">{content}</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#020617] overflow-hidden font-sans relative">
      
      {/* Top HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl px-6 py-3 border-4 border-[#3ecf8e] shadow-[0_4px_0_#2bae74] flex items-center gap-4 pointer-events-auto">
          <img src={avatar} alt="Avatar" className="w-12 h-12 bg-[#d1fae5] rounded-full border-2 border-[#10b981]" />
          <div>
            <h2 className="font-black text-[#10b981] text-xl leading-tight">{name}</h2>
            <div className="flex items-center gap-2">
               <p className="text-slate-500 font-bold text-sm">Fragments: {campaignStore.defeatedIds.length}/5</p>
               <div className="flex gap-1">
                 {campaignStore.defeatedIds.map(id => (
                   <span key={id} className="text-xs filter drop-shadow-sm" title={id}>💎</span>
                 ))}
               </div>
            </div>
            {campaignStore.defeatedIds.length > 0 && (
              <p className="text-[#10b981] text-[10px] font-black uppercase tracking-widest mt-0.5">
                Power Level +{campaignStore.getBuffs().dmgBonus} ATK
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={onBack}
          className="bg-white text-[#f43f5e] px-6 py-3 font-black rounded-2xl border-b-[6px] border-[#fb7185] active:translate-y-[6px] active:border-b-0 shadow-lg pointer-events-auto transition-all"
        >
          Exit Map
        </button>
      </div>

      {/* Main Camera Viewport */}
      {/* 
        We center the map based on player pos 
        Camera center is (windowWidth / 2, windowHeight / 2)
        Player is at (playerPos.x * TILE_SIZE, playerPos.y * TILE_SIZE)
      */}
      <motion.div 
        className="absolute top-1/2 left-1/2"
        animate={{
          x: -(playerPos.x * TILE_SIZE) - (TILE_SIZE / 2),
          y: -(playerPos.y * TILE_SIZE) - (TILE_SIZE / 2),
        }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
      >
        <div 
          className="relative"
          style={{ width: MAP_WIDTH * TILE_SIZE, height: MAP_HEIGHT * TILE_SIZE }}
        >
          {/* Render Tiles */}
          {WORLD_MAP.map((row, y) => row.map((tile, x) => renderTile(x, y, tile)))}

          {/* Render NPCs */}
          {npcs.map(npc => (
            <div 
              key={npc.id}
              className="absolute flex flex-col items-center justify-center z-10"
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                left: npc.x * TILE_SIZE,
                top: npc.y * TILE_SIZE,
              }}
            >
              <div className={`w-[120%] h-[120%] mb-4 filter drop-shadow-md pb-4 animate-bounce ${npc.type === 'enemy' ? 'bg-red-900/40 rounded-full border border-red-500/50' : ''}`} style={{animationDuration: npc.isBattle ? '1.5s' : '2.5s'}}>
                <img src={npc.sprite} alt={npc.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200 whitespace-nowrap">
                {npc.name}
              </div>
              {npc.isBattle && (
                <div className="absolute -top-4 text-red-500 font-black text-2xl animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">!</div>
              )}
            </div>
          ))}

          {/* Render Player */}
          <motion.div
            className="absolute z-20 flex items-center justify-center"
            initial={false}
            animate={{
              left: playerPos.x * TILE_SIZE,
              top: (playerPos.y * TILE_SIZE) - 16, // offset slightly up for 3d effect
            }}
            transition={{ type: "spring", damping: 25, stiffness: 150 }}
            style={{ width: TILE_SIZE, height: TILE_SIZE }}
          >
            <div className="relative w-[120%] h-[120%] bg-white rounded-full shadow-[0_8px_0_rgba(0,0,0,0.1)] border-4 border-[#3ecf8e] flex items-center justify-center overflow-hidden">
               <img 
                 src={avatar} 
                 alt="Player" 
                 style={{ 
                   transform: `scaleX(${facing === 'right' ? -1 : 1})`,
                   transition: 'transform 0.1s'
                 }}
                 className="w-[120%] h-[120%] object-cover mt-4" 
               />
            </div>

            {/* Guide Arrow */}
            {!activeDialog && !showConclusion && campaignStore.getNextObjective() && (
              <QuestArrow 
                playerPos={playerPos} 
                targetPos={campaignStore.getNextObjective()!} 
              />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Conclusion Overlay */}
      <AnimatePresence>
        {showConclusion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center p-8 text-center overflow-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl py-12"
            >
              <div className="text-8xl mb-8 animate-pulse">✨💎✨</div>
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none">CORE RESTORED</h1>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                The divergent rifts have collapsed. The Parametric, Polar, and Calculus constants have been realigned into their perfect geometric harmony. 
                You have collected all fragments and saved the mathematical fabric of our reality.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="text-xs font-black text-[#3ecf8e] uppercase tracking-[0.2em] mb-1">Legacy Status</div>
                  <div className="text-2xl font-black text-white">Infinite Wizard</div>
                </div>
                <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="text-xs font-black text-[#3ecf8e] uppercase tracking-[0.2em] mb-1">Regional Fragments</div>
                  <div className="text-2xl font-black text-white">5 / 5 Collected</div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="bg-[#3ecf8e] text-[#064e3b] font-black px-12 py-6 rounded-3xl text-2xl shadow-[0_8px_0_#059669] hover:shadow-[0_4px_0_#059669] transition-all cursor-pointer"
              >
                RETURN HOME
              </motion.button>
              
              <div className="mt-12 text-slate-600 font-bold uppercase tracking-widest text-xs">
                A New Legend has Begun
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls HUD for Hint */}
      {!activeDialog && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-slate-200 shadow-lg font-bold text-slate-600 flex gap-4 text-center items-center select-none pointer-events-none z-40">
          <span>Move: <kbd className="bg-slate-100/80 rounded px-2 py-1 mx-1 border border-slate-300">W</kbd><kbd className="bg-slate-100/80 rounded px-2 py-1 mx-1 border border-slate-300">A</kbd><kbd className="bg-slate-100/80 rounded px-2 py-1 mx-1 border border-slate-300">S</kbd><kbd className="bg-slate-100/80 rounded px-2 py-1 mx-1 border border-slate-300">D</kbd></span>
          <span className="w-px h-6 bg-slate-300"></span>
          <span>Interact: <kbd className="bg-slate-100/80 rounded px-2 py-1 mx-1 border border-slate-300">E</kbd></span>
        </div>
      )}

      {/* Dialogue Overlay */}
      <AnimatePresence>
        {activeDialog && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50 pointer-events-auto"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-[2rem] border-[6px] border-[#3ecf8e] shadow-[0_12px_0_#2bae74] p-8 relative flex gap-8 items-start">
              
              <div className={`w-32 h-32 rounded-3xl border-4 flex items-center justify-center shrink-0 shadow-inner overflow-hidden ${npcs.find(n => n.id === activeDialog.npcId)?.type === 'enemy' ? 'bg-red-100 border-red-400' : 'bg-emerald-100 border-emerald-400'}`}>
                <img src={npcs.find(n => n.id === activeDialog.npcId)?.sprite} alt="NPC" className="w-[120%] h-[120%] object-cover mt-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-2xl font-black mb-3 uppercase tracking-tight ${npcs.find(n => n.id === activeDialog.npcId)?.type === 'enemy' ? 'text-red-500' : 'text-[#2bae74]'}`}>
                  {npcs.find(n => n.id === activeDialog.npcId)?.name}
                </h3>
                <p className="text-xl text-slate-700 font-medium leading-relaxed min-h-[80px]">
                  {displayedText}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-slate-400 font-bold animate-pulse text-sm">
                    Press (E) or (Enter) to continue
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function QuestArrow({ playerPos, targetPos }: { playerPos: {x:number, y:number}, targetPos: {x:number, y:number} }) {
  const dx = targetPos.x - playerPos.x;
  const dy = targetPos.y - playerPos.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 pointer-events-none z-50 origin-center"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.6, 1, 0.6],
        rotate: angle,
        x: Math.cos(angle * Math.PI / 180) * 80 - 16,
        y: Math.sin(angle * Math.PI / 180) * 80 - 16,
        scale: [1, 1.2, 1]
      }}
      transition={{ 
        rotate: { duration: 0.1 }, 
        opacity: { repeat: Infinity, duration: 1.5 },
        scale: { repeat: Infinity, duration: 1 }
      }}
    >
       <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] text-amber-400 font-bold select-none">
         ➜
       </div>
    </motion.div>
  );
}

