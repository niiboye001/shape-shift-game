import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 6;
const ANIMALS = ['🐼', '🐰', '🦊', '🐨'];

const LEVELS = [
    { id: 1, source: { x: 0, y: 2, dir: 'right' }, target: { x: 5, y: 2 } },
    { id: 2, source: { x: 0, y: 0, dir: 'right' }, target: { x: 0, y: 5 } },
    { id: 3, source: { x: 0, y: 0, dir: 'right' }, target: { x: 5, y: 5 } },
    { id: 4, source: { x: 5, y: 0, dir: 'left' }, target: { x: 0, y: 5 } },
    { id: 5, source: { x: 2, y: 0, dir: 'down' }, target: { x: 3, y: 5 } },
    { id: 6, source: { x: 0, y: 5, dir: 'up' }, target: { x: 5, y: 0 } },
];

const StarBoard = ({ onLevelComplete }) => {
    const [levelIdx, setLevelIdx] = useState(0);
    const [objects, setObjects] = useState({});
    const [path, setPath] = useState([]);
    const [isWon, setIsWon] = useState(false);

    const level = LEVELS[levelIdx];

    const calculatePath = useCallback(() => {
        let current = { ...level.source };
        const newPath = [{ x: current.x, y: current.y }];
        const visited = new Set();

        while (current.x >= 0 && current.x < GRID_SIZE && current.y >= 0 && current.y < GRID_SIZE) {
            const key = `${current.x},${current.y}`;
            if (visited.has(key + current.dir)) break;
            visited.add(key + current.dir);

            const obj = objects[key];
            if (obj) {
                if (obj.rotation === 0) {
                    if (current.dir === 'right') current.dir = 'down';
                    else if (current.dir === 'down') current.dir = 'right';
                    else if (current.dir === 'left') current.dir = 'up';
                    else if (current.dir === 'up') current.dir = 'left';
                } else {
                    if (current.dir === 'right') current.dir = 'up';
                    else if (current.dir === 'up') current.dir = 'right';
                    else if (current.dir === 'left') current.dir = 'down';
                    else if (current.dir === 'down') current.dir = 'left';
                }
            }

            const next = { ...current };
            if (current.dir === 'right') next.x++;
            else if (current.dir === 'left') next.x--;
            else if (current.dir === 'down') next.y++;
            else if (current.dir === 'up') next.y--;

            newPath.push({ x: next.x, y: next.y });

            if (next.x === level.target.x && next.y === level.target.y) {
                setIsWon(true);
                break;
            }

            current = next;
            if (newPath.length > 50) break;
        }

        if (newPath[newPath.length - 1].x !== level.target.x || newPath[newPath.length - 1].y !== level.target.y) {
            setIsWon(false);
        }
        setPath(newPath);
    }, [level, objects]);

    useEffect(() => {
        calculatePath();
    }, [calculatePath]);

    const handleCellClick = (x, y) => {
        if (isWon) return;
        const key = `${x},${y}`;
        if (x === level.source.x && y === level.source.y) return;
        if (x === level.target.x && y === level.target.y) return;

        setObjects(prev => {
            const existing = prev[key];
            if (!existing) {
                const randomEmoji = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
                return { ...prev, [key]: { type: 'animal', rotation: 0, emoji: randomEmoji } };
            } else if (existing.rotation === 0) {
                return { ...prev, [key]: { ...existing, rotation: 90 } };
            } else {
                const next = { ...prev };
                delete next[key];
                return next;
            }
        });
    };

    const nextLevel = () => {
        if (levelIdx < LEVELS.length - 1) {
            setLevelIdx(prev => prev + 1);
            setObjects({});
            setIsWon(false);
        } else {
            setLevelIdx(0);
            setObjects({});
            setIsWon(false);
        }
    };

    return (
        <div className="game-wrapper flex flex-col items-center gap-6 w-full p-4">
            <div className="header text-center w-full">
                <h1 className="text-4xl text-white drop-shadow-lg mb-2">Star Guide</h1>
                <p className="text-white opacity-90">Level {level.id}: Help the star reach the nest!</p>
            </div>

            <div className="bubbly-card relative p-1">
                <div className="grid-container relative">
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const key = `${x},${y}`;
                        const obj = objects[key];
                        const isSource = x === level.source.x && y === level.source.y;
                        const isTarget = x === level.target.x && y === level.target.y;

                        return (
                            <div key={key} className="grid-cell" onClick={() => handleCellClick(x, y)}>
                                {isSource && <span className="source">🌟</span>}
                                {isTarget && <span className="nest">🪹</span>}
                                {obj && (
                                    <motion.div
                                        className="animal-helper"
                                        animate={{ rotate: obj.rotation }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        {obj.emoji}
                                        <div
                                            className="magic-wand"
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                border: '2px dashed var(--star-yellow)',
                                                borderRadius: '50%',
                                                opacity: 0.5,
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}

                    <svg
                        className="absolute inset-0 pointer-events-none overflow-visible"
                        viewBox={`0 0 ${GRID_SIZE * 100} ${GRID_SIZE * 100}`}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {path.length > 1 && (
                            <>
                                <motion.path
                                    d={`M ${path.map(p => `${p.x * 100 + 50} ${p.y * 100 + 50}`).join(' L ')}`}
                                    fill="none"
                                    stroke="var(--star-yellow)"
                                    strokeWidth="15"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="1, 20"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.text
                                    x={path[0].x * 100 + 50}
                                    y={path[0].y * 100 + 50}
                                    fontSize="60"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    animate={{
                                        x: path.map(p => p.x * 100 + 50),
                                        y: path.map(p => p.y * 100 + 50)
                                    }}
                                    transition={{ duration: path.length * 0.2, repeat: Infinity, ease: "linear" }}
                                >
                                    ⭐
                                </motion.text>
                            </>
                        )}
                    </svg>
                </div>

                <AnimatePresence>
                    {isWon && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-[40px] z-50 p-4"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="text-center p-6 bubbly-card shadow-2xl">
                                <h2 className="text-4xl mb-4 text-pink-500">YAY!</h2>
                                <button className="btn-joy text-lg" onClick={nextLevel}>
                                    {levelIdx < LEVELS.length - 1 ? 'Next!' : 'Play Again'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="controls flex gap-4">
                <button className="btn-joy text-sm py-2 px-4" onClick={() => setObjects({})}>
                    Reset! 🧹
                </button>
                <button
                    className="btn-joy text-sm py-2 px-4"
                    onClick={() => levelIdx > 0 && setLevelIdx(l => l - 1)}
                    disabled={levelIdx === 0}
                >
                    Back ⬅️
                </button>
            </div>

            <div className="instructions text-center glass p-4 rounded-[30px] border-2 border-white/50 max-w-lg">
                <p className="text-lg font-semibold">🌟 Tap squares to get helpers! <br /> 🐼 Tap them again to turn magic! <br /> 🪹 Find the nest!</p>
            </div>

            <div className="decorations fixed inset-0 pointer-events-none opacity-20 text-6xl">
                <div className="absolute top-10 left-10">☁️</div>
                <div className="absolute top-20 right-20">☁️</div>
                <div className="absolute bottom-10 right-10">☁️</div>
                <div className="absolute bottom-20 left-20">☁️</div>
            </div>
        </div>
    );
};

export default StarBoard;
