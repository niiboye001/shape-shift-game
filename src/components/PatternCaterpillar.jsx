import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
    red: '#F43F5E',
    blue: '#3B82F6',
    yellow: '#FBBF24',
    green: '#10B981',
    purple: '#A855F7'
};

const LEVELS = [
    { id: 1, type: 'AB', sequence: ['red', 'blue', 'red', 'blue', 'red', null], goal: 'blue' },
    { id: 2, type: 'AB', sequence: ['yellow', 'green', 'yellow', 'green', null, 'green'], goal: 'yellow' },
    { id: 3, type: 'AAB', sequence: ['red', 'red', 'blue', 'red', 'red', null], goal: 'blue' },
    { id: 4, type: 'ABB', sequence: ['purple', 'yellow', 'yellow', 'purple', null, 'yellow'], goal: 'yellow' },
    { id: 5, type: 'ABC', sequence: ['red', 'blue', 'green', 'red', null, 'green'], goal: 'blue' },
    { id: 6, type: 'ABC', sequence: ['purple', 'yellow', 'blue', null, 'yellow', 'blue'], goal: 'purple' },
];

const PatternCaterpillar = () => {
    const [levelIdx, setLevelIdx] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isWiggling, setIsWiggling] = useState(false);
    const [showButterfly, setShowButterfly] = useState(false);
    const [placedColor, setPlacedColor] = useState(null);

    const level = LEVELS[levelIdx];

    const handleColorClick = (color) => {
        if (isWon || isWiggling) return;

        if (color === level.goal) {
            setPlacedColor(color);
            setIsWon(true);
            setTimeout(() => {
                if (levelIdx === LEVELS.length - 1) {
                    setShowButterfly(true);
                }
            }, 1000);
        } else {
            setIsWiggling(true);
            setTimeout(() => setIsWiggling(false), 800);
        }
    };

    const nextLevel = () => {
        if (levelIdx < LEVELS.length - 1) {
            setLevelIdx(prev => prev + 1);
            setIsWon(false);
            setPlacedColor(null);
        } else {
            // Game Complete
            setLevelIdx(0);
            setIsWon(false);
            setPlacedColor(null);
            setShowButterfly(false);
        }
    };

    return (
        <div className="game-container min-h-screen">
            <div className="header text-center mt-8">
                <h1 className="text-4xl" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🐛 Pattern Caterpillar</h1>
                <p className="status-text">Level {level.id}: What color comes next?</p>
            </div>

            <AnimatePresence mode="wait">
                {!showButterfly ? (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex flex-col items-center w-full"
                    >
                        <div className={`caterpillar-track bubbly-card ${isWiggling ? 'wiggle' : ''} ${isWon ? 'walking' : ''}`}>
                            <div className="caterpillar-head">
                                👀
                                <div className="head-antenna left" />
                                <div className="head-antenna right" />
                            </div>

                            {level.sequence.map((color, idx) => {
                                const isGoalSlot = color === null;
                                const displayColor = isGoalSlot && placedColor ? placedColor : color;

                                return (
                                    <div
                                        key={idx}
                                        className={`segment ${!displayColor ? 'segment-missing' : ''}`}
                                        style={{ backgroundColor: displayColor ? COLORS[displayColor] : 'transparent' }}
                                    >
                                        {isGoalSlot && !placedColor && <span className="opacity-20">?</span>}
                                        {isGoalSlot && placedColor && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-full h-full rounded-full"
                                                style={{ backgroundColor: COLORS[placedColor] }}
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            <div className="berry ml-8 text-6xl">🫐</div>
                        </div>

                        <div className="color-picker scale-100">
                            {Object.keys(COLORS).map(color => (
                                <button
                                    key={color}
                                    className="color-option"
                                    style={{ backgroundColor: COLORS[color] }}
                                    onClick={() => handleColorClick(color)}
                                    disabled={isWon}
                                />
                            ))}
                        </div>

                        {isWon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-12"
                            >
                                <button className="btn-primary" onClick={nextLevel}>
                                    {levelIdx < LEVELS.length - 1 ? "Next Hungry Friend! ➔" : "Look! A Miracle! ✨"}
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="butterfly"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        className="flex flex-col items-center mt-20"
                    >
                        <div className="text-9xl mb-8">🦋</div>
                        <h2 className="text-4xl text-center">You're a Pattern Genius!<br />The Caterpillar is now a Butterfly!</h2>
                        <button className="btn-primary mt-12" onClick={nextLevel}>
                            Play Again! 🔄
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="decorations fixed inset-0 pointer-events-none opacity-30 text-4xl">
                <div className="absolute top-10 left-10">🌸</div>
                <div className="absolute top-40 right-10">🌼</div>
                <div className="absolute bottom-20 left-20">🌻</div>
                <div className="absolute bottom-10 right-40">🪴</div>
            </div>

            <div className="instructions mt-12 glass p-6 rounded-[30px] border-4 border-white text-center max-w-md">
                <p className="text-lg font-semibold">Help the caterpillar reach the blueberry! <br /> Pick the right color to complete the pattern.</p>
            </div>
        </div>
    );
};

export default PatternCaterpillar;
