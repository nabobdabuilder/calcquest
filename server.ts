import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { QUESTIONS, getRandomQuestion } from "./src/game/questions.ts";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // API route for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Socket.io Multiplayer Logic
  
  let waitingPlayer: any = null;
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join_matchmaking", (data) => {
      const playerInfo = {
        id: socket.id,
        name: data.name || "Student",
        avatar: data.avatar || "🧙‍♀️",
        hp: 100,
        mana: 0,
        correctAnswers: 0,
        socket: socket
      };

      if (waitingPlayer && waitingPlayer.id !== socket.id) {
        // Match found!
        const roomId = `room_${Date.now()}_${Math.random()}`;
        const player1 = waitingPlayer;
        const player2 = playerInfo;

        waitingPlayer = null; // Clear queue

        player1.socket.join(roomId);
        player2.socket.join(roomId);

        const roomState = {
          id: roomId,
          players: {
            [player1.id]: { id: player1.id, name: player1.name, avatar: player1.avatar, hp: 100, stance: null, correctAnswers: 0 },
            [player2.id]: { id: player2.id, name: player2.name, avatar: player2.avatar, hp: 100, stance: null, correctAnswers: 0 }
          },
          state: 'SELECT_STANCE', // SELECT_STANCE -> ANSWER_QUESTION -> RESOLVE
          currentQuestion: null,
          playerQuestions: {},
          answers: {} // tracks who answered correctly and how fast
        };

        rooms.set(roomId, roomState);

        io.to(roomId).emit("match_found", {
          room: getClientRoomState(roomState),
          opponent: {
            [player1.id]: { name: player2.name, avatar: player2.avatar },
            [player2.id]: { name: player1.name, avatar: player1.avatar }
          }
        });

        startRound(roomId);
      } else {
        waitingPlayer = playerInfo;
        socket.emit("waiting_for_match");
      }
    });

    socket.on("submit_stance", (data) => {
      // data: { roomId: string, stance: 'ATTACK' | 'DEFEND' | 'MAGIC' }
      const room = rooms.get(data.roomId);
      if (!room || room.state !== 'SELECT_STANCE') return;

      if (room.players[socket.id]) {
        room.players[socket.id].stance = data.stance;
      }

      // Check if both selected
      const p1 = Object.values(room.players)[0] as any;
      const p2 = Object.values(room.players)[1] as any;

      if (p1.stance && p2.stance) {
        // Both selected stance, move to question phase
        room.state = 'ANSWER_QUESTION';
        
        const isSuper = (stance: string) => stance.startsWith('SUPER_');
        
        room.playerQuestions = {};
        if (isSuper(p1.stance)) {
          room.playerQuestions[p1.id] = getRandomQuestion('Nightmare');
        } else {
          room.playerQuestions[p1.id] = getRandomQuestion('Normal');
        }

        if (isSuper(p2.stance)) {
          room.playerQuestions[p2.id] = getRandomQuestion('Nightmare');
        } else {
          // If neither is super, they should get the same question. If one is, the normal gets a normal
          room.playerQuestions[p2.id] = (!isSuper(p1.stance) && !isSuper(p2.stance)) ? room.playerQuestions[p1.id] : getRandomQuestion('Normal');
        }

        room.answers = {};
        
        io.to(p1.id).emit("question_phase", {
          question: room.playerQuestions[p1.id],
          endTime: 0 // No time limit
        });
        io.to(p2.id).emit("question_phase", {
          question: room.playerQuestions[p2.id],
          endTime: 0
        });
      }
    });

    socket.on("submit_answer", (data) => {
      // data: { roomId: string, answerIndex?: number, isCorrect?: boolean }
      const room = rooms.get(data.roomId);
      if (!room || room.state !== 'ANSWER_QUESTION') return;

      if (!room.answers[socket.id]) {
        const question = room.playerQuestions[socket.id];
        let isCorrect = false;
        if (question.isFRQ) {
          isCorrect = data.isCorrect === true;
        } else {
          isCorrect = data.answerIndex === question.correctIndex;
        }
        room.answers[socket.id] = {
          correct: isCorrect,
          time: Date.now()
        };
        if (isCorrect) {
          room.players[socket.id].correctAnswers = (room.players[socket.id].correctAnswers || 0) + 1;
        } else {
          // reset on fail? Let's just say no reset on fail unless it was a super
          if (room.players[socket.id].stance.startsWith('SUPER_')) {
             room.players[socket.id].correctAnswers = 0; // Lost all charge if Failed Super
          }
        }
      }

      // If both answered, resolve
      if (Object.keys(room.answers).length === 2) {
        resolveRound(data.roomId);
      }
    });

    socket.on("check_frq_with_gemini", async (data) => {
      // data: { roomId: string, imageBase64: string, mimeType: string }
      try {
        const room = rooms.get(data.roomId);
        if (!room || room.state !== 'ANSWER_QUESTION') return;
        const question = room.playerQuestions[socket.id];
        
        if (!process.env.GEMINI_API_KEY) {
           socket.emit("gemini_result", { error: "Gemini API Key missing on server." });
           return;
        }

        const prompt = `You are a strict AP Calculus grader.
The student was asked this question:
${question.text}

The correct answer is: ${question.answerKey}

The student has uploaded an image of their work. Analyze their work. 
If they arrived at the correct answer and their work generally supports it, respond with exactly "CORRECT". 
If they did not get the correct answer, or their work is fundamentally flawed, respond with exactly "INCORRECT".
After "CORRECT" or "INCORRECT", provide a very brief 1-2 sentence explanation of your decision.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            prompt,
            { inlineData: { data: data.imageBase64, mimeType: data.mimeType } }
          ]
        });

        const text = response.text || "";
        const isCorrect = text.trim().toUpperCase().startsWith("CORRECT");
        
        socket.emit("gemini_result", { correct: isCorrect, explanation: text });
      } catch (err) {
        console.error("Gemini API Error:", err);
        socket.emit("gemini_result", { error: "Failed to grade image using Gemini API." });
      }
    });

    socket.on("send_emote", (data) => {
      // data: { roomId: string, emote: string }
      const room = rooms.get(data.roomId);
      if (!room) return;
      
      // Broadcast to other player in the room
      socket.to(data.roomId).emit("receive_emote", {
        playerId: socket.id,
        emote: data.emote
      });
    });

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
      if (waitingPlayer && waitingPlayer.id === socket.id) {
        waitingPlayer = null;
      }
      
      // Notify opponent and destroy room
      for (const [roomId, room] of rooms.entries()) {
        if (room.players[socket.id]) {
          io.to(roomId).emit("opponent_disconnected");
          rooms.delete(roomId);
        }
      }
    });
  });

  function startRound(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.state = 'SELECT_STANCE';
    room.playerQuestions = {};
    room.answers = {};
    for (const pid in room.players) {
      if (room.players[pid].stance && room.players[pid].stance.startsWith('SUPER_')) {
        // Spent super
        room.players[pid].correctAnswers = 0;
      }
      room.players[pid].stance = null;
    }

    io.to(roomId).emit("round_start", {
      room: getClientRoomState(room)
    });
  }

  function resolveRound(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const pArray = Object.values(room.players) as any[];
    const p1 = pArray[0];
    const p2 = pArray[1];

    const ans1 = room.answers[p1.id] || { correct: false, time: Infinity };
    const ans2 = room.answers[p2.id] || { correct: false, time: Infinity };

    const p1ActionValid = ans1.correct;
    const p2ActionValid = ans2.correct;

    let p1DamageToP2 = 0;
    let p2DamageToP1 = 0;
    
    // Simple Rock Paper Scissors logic for stances:
    // ATTACK beats MAGIC, MAGIC beats DEFEND, DEFEND beats ATTACK
    // If stance valid, calculate effect
    
    const calculateEffect = (attacker: any, defender: any, attackerValid: boolean, defenderValid: boolean) => {
      if (!attackerValid) return 0;
      if (attacker.stance.startsWith('SUPER_')) return 0; // Super damage is handled separately
      
      let dmg = 15; // base damage
      
      if (attacker.stance === 'HEAL') {
          attacker.hp = Math.min(100, attacker.hp + 20);
          return 0; // Heal deals no damage to opponent
      }

      if (defenderValid) {
        // RPS: ATTACK > MAGIC/HEAL > DEFEND > ATTACK
        if (attacker.stance === 'ATTACK') {
          if (defender.stance === 'MAGIC' || defender.stance === 'HEAL') dmg = 25; // Critical hit!
          if (defender.stance === 'DEFEND') dmg = 0; // Blocked!
        } else if (attacker.stance === 'MAGIC') {
          if (defender.stance === 'DEFEND') dmg = 25; // Pierces shield
          if (defender.stance === 'ATTACK') dmg = 10; // Outprioritized
          if (defender.stance === 'HEAL') dmg = 20; // Magic hits hard on focused targets
        } else if (attacker.stance === 'DEFEND') {
          dmg = 0; // Shield doesn't do damage
        }
      } else {
        // Defender failed to answer
        dmg = 25;
      }
      
      return Math.floor(dmg);
    };

    p1DamageToP2 = calculateEffect(p1, p2, p1ActionValid, p2ActionValid);
    p2DamageToP1 = calculateEffect(p2, p1, p2ActionValid, p1ActionValid);
    
    // Ensure DEFEND stances never deal damage (extra safety)
    if (p1.stance === 'DEFEND') p1DamageToP2 = 0;
    if (p2.stance === 'DEFEND') p2DamageToP1 = 0;
    
    // Apply HP
    p1.hp = Math.max(0, p1.hp - p2DamageToP1);
    p2.hp = Math.max(0, p2.hp - p1DamageToP2);

    // Apply Super Effects (NERFED for PVP Balance)
    if (p1.stance.startsWith('SUPER_') && p1ActionValid) {
        if (p1.stance === 'SUPER_DOMAIN_EXPANSION') {
            const superDmg = 35; // Nerfed from 50
            p2.hp = Math.max(0, p2.hp - superDmg);
            p1DamageToP2 += superDmg;
        } else if (p1.stance === 'SUPER_BANKAI') {
            const superVal = 25; // Nerfed from 30
            p2.hp = Math.max(0, p2.hp - superVal);
            p1.hp = Math.min(100, p1.hp + superVal);
            p1DamageToP2 += superVal;
        } else if (p1.stance === 'SUPER_HOLLOW_PURPLE') {
            const superDmg = 45; // Nerfed from 70
            p2.hp = Math.max(0, p2.hp - superDmg);
            p1DamageToP2 += superDmg;
        }
    }
    
    if (p2.stance.startsWith('SUPER_') && p2ActionValid) {
        if (p2.stance === 'SUPER_DOMAIN_EXPANSION') {
            const superDmg = 35; 
            p1.hp = Math.max(0, p1.hp - superDmg);
            p2DamageToP1 += superDmg;
        } else if (p2.stance === 'SUPER_BANKAI') {
            const superVal = 25;
            p1.hp = Math.max(0, p1.hp - superVal);
            p2.hp = Math.min(100, p2.hp + superVal);
            p2DamageToP1 += superVal;
        } else if (p2.stance === 'SUPER_HOLLOW_PURPLE') {
            const superDmg = 45;
            p1.hp = Math.max(0, p1.hp - superDmg);
            p2DamageToP1 += superDmg;
        }
    }

    room.state = 'RESOLVED';

    io.to(roomId).emit("round_resolved", {
      result: {
        [p1.id]: { correct: ans1.correct, damageDealt: p1DamageToP2, stance: p1.stance },
        [p2.id]: { correct: ans2.correct, damageDealt: p2DamageToP1, stance: p2.stance }
      },
      room: getClientRoomState(room)
    });

    if (p1.hp <= 0 || p2.hp <= 0) {
      setTimeout(() => {
        const roomAfter = rooms.get(roomId);
        if (!roomAfter) return; // Already cleaned up

        io.to(roomId).emit("game_over", {
          winnerId: p1.hp > 0 ? p1.id : (p2.hp > 0 ? p2.id : 'DRAW')
        });
        rooms.delete(roomId);
      }, 3500); // Wait for full client animations
    } else {
      setTimeout(() => {
        startRound(roomId);
      }, 7500); // 5s for animation + 2.5s for summary
    }
  }

  function getClientRoomState(room: any) {
    const playerIds = Object.keys(room.players);
    const clientPlayers: any = {};
    
    playerIds.forEach(id => {
      clientPlayers[id] = { 
        hp: room.players[id].hp, 
        stance: room.players[id].stance ? 'SELECTED' : 'WAITING', 
        correctAnswers: room.players[id].correctAnswers || 0 
      };
    });

    return {
      id: room.id,
      state: room.state,
      players: clientPlayers
    };
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: process.cwd(),
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
