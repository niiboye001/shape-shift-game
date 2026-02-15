import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const BIOMES = [
    {
        id: 'jungle',
        name: 'Jungle',
        animal: '🦁',
        welcome: 'Welcome to the Jungle!',
        levels: {
            easy: ['LION', 'TREE', 'LEAF', 'BIRD', 'FROG', 'APE', 'ANTS', 'FERN', 'VINE', 'MUD'],
            medium: ['MONKEY', 'SNAKE', 'TIGER', 'FRUIT', 'PARROT', 'JUNGLE', 'FLOWER', 'LIZARD', 'SPIDER', 'COCOA'],
            hard: ['GIRAFE', 'PANTHER', 'GORILLA', 'LEOPARD', 'CHEETAH', 'TOUCAN', 'ORCHID', 'BAMBOO', 'CANOPY', 'JAGUAR'],
            insane: ['CHIMPANZEE', 'ORANGUTAN', 'CROCODILE', 'RAINFOREST', 'HIPPOPOTAMUS', 'RHINOCEROS', 'TARANTULA', 'HUMMINGBIRD', 'WATERFALL', 'CARNIVOROUS']
        }
    },
    {
        id: 'ocean',
        name: 'Ocean',
        animal: '🐬',
        welcome: 'Dive in!',
        levels: {
            easy: ['FISH', 'WAVE', 'BOAT', 'BLUE', 'SAND', 'SHIP', 'SALT', 'CRAB', 'KEPL', 'GULL'],
            medium: ['SHARK', 'CORAL', 'SHELL', 'WATER', 'WHALE', 'PILOT', 'COAST', 'BEACH', 'DIVER', 'OCEAN'],
            hard: ['DOLPHIN', 'OCTOPUS', 'ANEMONE', 'TURTLE', 'PENGUIN', 'LOBSTER', 'MANATEE', 'WALRUS', 'ICEBERG', 'TRENCH'],
            insane: ['JELLYFISH', 'SUBMARINE', 'STARFISH', 'ANEMONE', 'PLANKTON', 'CORALREEF', 'ABYSSAL', 'HUMPBACK', 'STINGRAY', 'BARRACUDA']
        }
    },
    {
        id: 'desert',
        name: 'Desert',
        animal: '🐪',
        welcome: 'Hot day!',
        levels: {
            easy: ['SAND', 'HOT', 'SUN', 'DRY', 'HEAT', 'DUST', 'ROCK', 'GOLD', 'WIND', 'FLAT'],
            medium: ['CAMEL', 'CACTUS', 'DUNES', 'OASIS', 'SNAKE', 'NIGHT', 'SCORP', 'ADOBE', 'STORM', 'ARID'],
            hard: ['SCORPION', 'LIZARD', 'MIRAGE', 'DESERT', 'COYOTE', 'CANYON', 'PLATEAU', 'VULTURE', 'NOMAD', 'SPORE'],
            insane: ['RATTLESNAKE', 'TUMBLEWEED', 'QUICKSAND', 'SANDSTORM', 'JERBOA', 'FENNECFOX', 'GILA_MONSTER', 'TARANTULA', 'HABOOB', 'OXY-GEN']
        }
    }
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Utility to shuffle array
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const SpellingSafari = () => {
    const [difficulty, setDifficulty] = useState(null); // easy, medium, hard, insane
    const [biomeIdx, setBiomeIdx] = useState(0);
    const [wordIdx, setWordIdx] = useState(0);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [scrambled, setScrambled] = useState([]);
    const [placed, setPlaced] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [isTalking, setIsTalking] = useState(false);

    const currentBiome = BIOMES[biomeIdx];

    // When difficulty or biome changes, shuffle the word list
    useEffect(() => {
        if (difficulty) {
            const words = currentBiome.levels[difficulty];
            setShuffledWords(shuffleArray(words));
            setWordIdx(0); // Reset word index for the new set
        }
    }, [difficulty, currentBiome, biomeIdx]);

    const targetWord = (shuffledWords.length > 0 && wordIdx < shuffledWords.length)
        ? shuffledWords[wordIdx].toUpperCase()
        : '';

    // Web Speech API
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsTalking(true);
        utterance.onend = () => setIsTalking(false);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const playMistakeSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    };

    const setupRound = useCallback(() => {
        if (!difficulty || !targetWord) return;
        const wordArr = targetWord.split('').map((char, i) => ({
            id: `char-${i}-${Math.random()}`,
            char,
            isCorrect: true,
            correctIdx: i
        }));

        // Add distractors based on difficulty
        const distractorCount = {
            easy: 0,
            medium: 2,
            hard: 5,
            insane: 10
        }[difficulty];

        const distractors = [];
        for (let i = 0; i < distractorCount; i++) {
            distractors.push({
                id: `distractor-${i}-${Math.random()}`,
                char: LETTERS[Math.floor(Math.random() * LETTERS.length)],
                isCorrect: false
            });
        }

        const allChoices = [...wordArr, ...distractors].sort(() => Math.random() - 0.5);
        setScrambled(allChoices);
        setPlaced(new Array(targetWord.length).fill(null));
        speak(`Can you spell ${targetWord}?`);
    }, [targetWord, difficulty]);

    useEffect(() => {
        if (gameStarted && targetWord) setupRound();
    }, [gameStarted, targetWord, setupRound]);

    const handleDrop = (letter, targetIdx) => {
        if (letter.char === targetWord[targetIdx]) {
            const newPlaced = [...placed];
            newPlaced[targetIdx] = letter;
            setPlaced(newPlaced);
            setScrambled(prev => prev.filter(l => l.id !== letter.id));
            speak(letter.char);

            // Check Win
            if (newPlaced.every(l => l !== null)) {
                setTimeout(() => {
                    speak(`Fantastic! ${targetWord}!`);
                    if (wordIdx + 1 >= shuffledWords.length) {
                        setBiomeIdx(prev => (prev + 1) % BIOMES.length);
                        // useEffect will handle shuffling the next biome's words
                    } else {
                        setWordIdx(prev => prev + 1);
                    }
                }, 1000);
            }
        } else {
            playMistakeSound();
            speak("Try again!");
        }
    };

    const selectDifficulty = (level) => {
        setDifficulty(level);
    };

    const startGame = () => {
        if (difficulty) setGameStarted(true);
    };

    return (
        <div className={`safari-canvas biome-${currentBiome.id}`}>
            {!gameStarted && (
                <div className="safari-overlay">
                    <div className="difficulty-container">
                        <div className="difficulty-label">
                            <span role="img" aria-label="brain">🧠</span> DIFFICULTY
                        </div>
                        <div className="segmented-control">
                            {['easy', 'medium', 'hard', 'insane'].map((level) => (
                                <button
                                    key={level}
                                    className={`segment-btn ${difficulty === level ? 'active' : ''}`}
                                    onClick={() => selectDifficulty(level)}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                        <button
                            className={`start-action-btn ${difficulty ? 'ready' : ''}`}
                            onClick={startGame}
                            disabled={!difficulty}
                        >
                            Start Safari! 🦁
                        </button>
                    </div>
                </div>
            )}

            <header className="safari-header">
                <h1>Spelling Safari</h1>
                <div className="flex gap-4 justify-center mt-2">
                    <span className="badge">Biome: {currentBiome.name}</span>
                    <span className="badge">Mode: {difficulty?.toUpperCase()}</span>
                </div>
            </header>

            <main className="puzzle-board">
                <motion.div
                    className="safari-animal"
                    animate={isTalking ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ repeat: isTalking ? Infinity : 0, duration: 0.4 }}
                    onClick={() => speak(currentBiome.welcome)}
                >
                    {currentBiome.animal}
                </motion.div>

                <div className="drop-container">
                    {targetWord.split('').map((_, i) => (
                        <div key={i} className={`drop-slot ${placed[i] ? 'correct' : 'active'}`}>
                            {placed[i] ? placed[i].char : ''}
                        </div>
                    ))}
                </div>

                <div className="tiles-container">
                    <AnimatePresence>
                        {scrambled.map((letter) => (
                            <motion.div
                                key={letter.id}
                                className="letter-tile"
                                drag
                                dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                                dragElastic={0.8}
                                onDragEnd={(_, info) => {
                                    const dropSlots = document.querySelectorAll('.drop-slot');
                                    dropSlots.forEach((slot, idx) => {
                                        if (placed[idx]) return;
                                        const rect = slot.getBoundingClientRect();
                                        if (info.point.x > rect.left && info.point.x < rect.right &&
                                            info.point.y > rect.top && info.point.y < rect.bottom) {
                                            handleDrop(letter, idx);
                                        }
                                    });
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileDrag={{ scale: 1.2, zIndex: 50 }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                            >
                                {letter.char}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            <div className="decorations fixed inset-0 pointer-events-none opacity-20 text-6xl">
                {currentBiome.id === 'ocean' && <div className="absolute top-10 right-10">🌊</div>}
                {currentBiome.id === 'desert' && <div className="absolute bottom-10 left-10">🌵</div>}
                {currentBiome.id === 'jungle' && <div className="absolute top-60 left-20">🍃</div>}
            </div>
        </div>
    );
};

export default SpellingSafari;
