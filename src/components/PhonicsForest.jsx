import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ANIMALS = [
    { emoji: '🐊', name: 'Alligator', letter: 'A' },
    { emoji: '🐰', name: 'Bunny', letter: 'B' },
    { emoji: '🐱', name: 'Cat', letter: 'C' },
    { emoji: '🐘', name: 'Elephant', letter: 'E' },
    { emoji: '🦊', name: 'Fox', letter: 'F' },
    { emoji: '🦒', name: 'Giraffe', letter: 'G' },
    { emoji: '🦁', name: 'Lion', letter: 'L' },
    { emoji: '🐼', name: 'Panda', letter: 'P' },
    { emoji: '🦄', name: 'Unicorn', letter: 'U' },
    { emoji: '🦓', name: 'Zebra', letter: 'Z' },
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const PhonicsForest = () => {
    const [targetIdx, setTargetIdx] = useState(0);
    const [bubbles, setBubbles] = useState([]);
    const [spellIdx, setSpellIdx] = useState(0);
    const [isWiggling, setIsWiggling] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const containerRef = useRef(null);
    const audioCtxRef = useRef(null);

    const target = ANIMALS[targetIdx];
    const targetWord = target.name.toUpperCase();
    const currentLetterNeeded = targetWord[spellIdx];
    const difficultyMultiplier = 1 + (targetIdx * 0.2);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        setGameStarted(true);
    };

    const playPopSound = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const spawnBubble = useCallback(() => {
        if (!containerRef.current || isWiggling || !gameStarted) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const isTarget = Math.random() > 0.7;
        const isFutureLetter = !isTarget && Math.random() > 0.6;

        let letter;
        if (isTarget) {
            letter = currentLetterNeeded;
        } else if (isFutureLetter && spellIdx < targetWord.length - 1) {
            letter = targetWord[spellIdx + 1];
        } else {
            const distractors = {
                'B': ['P', 'D', 'R'],
                'P': ['B', 'D', 'R'],
                'A': ['V', 'O', 'E'],
                'E': ['F', 'L', 'H'],
                'F': ['E', 'L', 'H'],
                'L': ['I', 'T', 'E'],
            };
            const possibleDistractors = distractors[currentLetterNeeded] || LETTERS;
            letter = possibleDistractors[Math.floor(Math.random() * possibleDistractors.length)];
        }

        const colors = ['#F43F5E', '#3B82F6', '#FBBF24', '#A855F7', '#EC4899', '#8B5CF6'];
        const balloonColor = colors[Math.floor(Math.random() * colors.length)];

        const newBubble = {
            id: Math.random().toString(36).substr(2, 9),
            letter,
            color: balloonColor,
            isTarget: letter === currentLetterNeeded,
            x: Math.random() * (width - 100),
            y: height + 150,
            size: Math.max(80, Math.min(140, width * 0.15)),
            baseSpeed: (1.2 + Math.random() * 1.8) * difficultyMultiplier,
            speed: (1.2 + Math.random() * 1.8) * difficultyMultiplier,
            // Multi-layered movement parameters
            wave1: { freq: 0.001 + Math.random() * 0.002, amp: 30 + Math.random() * 40 },
            wave2: { freq: 0.004 + Math.random() * 0.006, amp: 10 + Math.random() * 15 },
            drift: (Math.random() - 0.5) * 150 * difficultyMultiplier, // Increased drift
            speedPhase: Math.random() * Math.PI * 2,
            startTime: Date.now()
        };

        setBubbles(prev => [...prev, newBubble]);
    }, [currentLetterNeeded, difficultyMultiplier, isWiggling, spellIdx, targetWord, gameStarted]);

    useEffect(() => {
        const interval = setInterval(spawnBubble, 1300 / difficultyMultiplier);
        return () => clearInterval(interval);
    }, [spawnBubble, difficultyMultiplier]);

    useEffect(() => {
        let animationFrameId;
        const animate = () => {
            const now = Date.now();
            setBubbles(prev => prev
                .map(b => {
                    const elapsed = now - b.startTime;

                    // Chaotic horizontal movement: combining two sine waves
                    const sway1 = Math.sin(elapsed * b.wave1.freq) * b.wave1.amp;
                    const sway2 = Math.sin(elapsed * b.wave2.freq) * b.wave2.amp;

                    // Vertical speed variability (bursts)
                    const speedVariation = Math.sin((elapsed * 0.002) + b.speedPhase) * 0.5;
                    const currentSpeed = b.baseSpeed * (1 + speedVariation);

                    return {
                        ...b,
                        y: b.y - currentSpeed,
                        x: b.x + (sway1 + sway2 + (b.drift * (elapsed / 5000))) * 0.02
                    };
                })
                .filter(b => b.y > -300)
            );
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const handlePop = (bubble) => {
        playPopSound();
        if (bubble.letter === currentLetterNeeded) {
            setBubbles(prev => prev.filter(b => b.id !== bubble.id));
            if (spellIdx + 1 >= targetWord.length) {
                setSpellIdx(0);
                setTargetIdx(prev => (prev + 1) % ANIMALS.length);
                setBubbles([]);
            } else {
                setSpellIdx(prev => prev + 1);
            }
        } else {
            setIsWiggling(true);
            setTimeout(() => setIsWiggling(false), 500);
            setBubbles(prev => prev.filter(b => b.id !== bubble.id));
        }
    };

    return (
        <div className="game-canvas" ref={containerRef}>
            {!gameStarted && (
                <div className="start-overlay">
                    <button className="btn-start" onClick={initAudio}>
                        Tap to Start Play! 🎈
                    </button>
                    <div className="absolute bottom-10 text-white opacity-60 text-center">
                        <p>Turn up your volume for pop sounds!</p>
                    </div>
                </div>
            )}

            <div className="ui-overlay">
                <h1 className="text-4xl drop-shadow-lg" style={{ fontSize: '2.5rem', fontWeight: 900 }}>Phonics Forest</h1>
                <div className="score-badge mb-2">Animals Found: {targetIdx}</div>

                <div className="spelling-bar flex gap-2 p-4 glass-box rounded-2xl">
                    {targetWord.split('').map((char, i) => (
                        <motion.div
                            key={i}
                            className={`spelling-slot ${i === spellIdx ? 'active' : ''} ${i < spellIdx ? 'done' : ''}`}
                            animate={i === spellIdx ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            {i < spellIdx ? char : (i === spellIdx ? '?' : '')}
                        </motion.div>
                    ))}
                </div>

                <div className="target-panel mt-4">
                    Catch the letter: <span style={{ fontSize: '2.5rem', color: '#064E3B' }}>{currentLetterNeeded}</span>
                </div>
            </div>

            <AnimatePresence>
                {bubbles.map(bubble => (
                    <motion.div
                        key={bubble.id}
                        className="balloon"
                        style={{
                            left: bubble.x,
                            top: bubble.y,
                            width: bubble.size * 0.8,
                            height: bubble.size,
                            backgroundColor: bubble.color,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
                        onClick={() => handlePop(bubble)}
                    >
                        <div className="balloon-tie" style={{ borderBottomColor: bubble.color }} />
                        <span className="balloon-letter" style={{ fontSize: bubble.size * 0.4 }}>
                            {bubble.letter}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>

            <div className="character-area">
                <motion.div
                    className={`animal-avatar ${isWiggling ? 'shake' : ''}`}
                    animate={{
                        y: [0, -20, 0],
                        rotate: spellIdx === 0 && targetIdx > 0 ? [0, 360] : 0
                    }}
                    transition={{
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 0.5 }
                    }}
                >
                    {target.emoji}
                </motion.div>
                <div className="glass-box text-center p-4">
                    <p className="text-lg font-extrabold" style={{ color: '#FDE047' }}>Spell {target.name.toUpperCase()}!</p>
                </div>
            </div>

            <div className="decorations fixed inset-0 pointer-events-none opacity-20 text-6xl">
                <div className="absolute top-10 left-10">🌲</div>
                <div className="absolute top-60 right-20">🍃</div>
                <div className="absolute bottom-40 left-20">🌿</div>
                <div className="absolute bottom-10 right-10">🍄</div>
            </div>
        </div>
    );
};

export default PhonicsForest;
