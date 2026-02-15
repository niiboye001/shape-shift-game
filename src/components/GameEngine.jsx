import React, { useState, useEffect, useRef, useCallback } from 'react';
import Shape from './Shape';
import Gate from './Gate';

const SHAPES = ['circle', 'square', 'triangle'];
const INITIAL_SPEED = 0.005;
const SPAWN_INTERVAL = 2000;

export const GameEngine = ({ onGameOver, onScoreUpdate }) => {
    const [gameState, setGameState] = useState('READY'); // READY, PLAYING, GAMEOVER
    const [playerShape, setPlayerShape] = useState('circle');
    const [gates, setGates] = useState([]);
    const [score, setScore] = useState(0);
    const [flash, setFlash] = useState(null); // 'success', 'fail'
    const [isShaking, setIsShaking] = useState(false);

    const lastSpawnTime = useRef(0);
    const requestRef = useRef();
    const speedRef = useRef(INITIAL_SPEED);

    const spawnGate = useCallback((time) => {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const newGate = {
            id: Date.now(),
            type: randomShape,
            progress: 0,
            isPassed: false
        };
        setGates(prev => [...prev, newGate]);
        lastSpawnTime.current = time;
    }, []);

    const update = useCallback((time) => {
        if (gameState !== 'PLAYING') return;

        if (time - lastSpawnTime.current > SPAWN_INTERVAL / (1 + score * 0.05)) {
            spawnGate(time);
        }

        setGates(prevGates => {
            const nextGates = prevGates.map(gate => ({
                ...gate,
                progress: gate.progress + speedRef.current * (1 + score * 0.02)
            }));

            // Check collision/pass
            const collisionGate = nextGates.find(g => g.progress >= 0.8 && g.progress < 0.9 && !g.isPassed);
            if (collisionGate) {
                if (collisionGate.type !== playerShape) {
                    setGameState('GAMEOVER');
                    setFlash('fail');
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 500);
                    onGameOver(score);
                    return nextGates;
                } else {
                    // Success!
                    collisionGate.isPassed = true;
                    setFlash('success');
                    setTimeout(() => setFlash(null), 200);
                    setScore(s => {
                        const nextScore = s + 1;
                        onScoreUpdate(nextScore);
                        return nextScore;
                    });
                }
            }

            // Remove gates that are well past
            return nextGates.filter(g => g.progress < 1.2);
        });

        requestRef.current = requestAnimationFrame(update);
    }, [gameState, playerShape, score, spawnGate, onGameOver, onScoreUpdate]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, update]);

    const startGame = () => {
        setScore(0);
        setGates([]);
        setGameState('PLAYING');
        speedRef.current = INITIAL_SPEED;
    };

    const handleKeyDown = useCallback((e) => {
        if (gameState !== 'PLAYING') return;

        if (e.key === 'a' || e.key === 'ArrowLeft') {
            setPlayerShape(prev => {
                const idx = SHAPES.indexOf(prev);
                return SHAPES[(idx - 1 + SHAPES.length) % SHAPES.length];
            });
        } else if (e.key === 'd' || e.key === 'ArrowRight') {
            setPlayerShape(prev => {
                const idx = SHAPES.indexOf(prev);
                return SHAPES[(idx + 1) % SHAPES.length];
            });
        }
    }, [gameState]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className={`game-container ${isShaking ? 'shake' : ''} ${flash ? `flash-${flash}` : ''}`}>
            {gameState === 'READY' && (
                <div className="overlay glass">
                    <h1>SHAPE-SHIFT</h1>
                    <p>Match the oncoming shapes</p>
                    <div className="controls-hint">
                        <p>Use <b>A/D</b> or <b>Arrow Keys</b> to shift</p>
                    </div>
                    <button onClick={startGame} className="start-btn neon-border-blue">Start Journey</button>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="overlay glass">
                    <h1 className="neon-text-pink">GAME OVER</h1>
                    <p>Score: {score}</p>
                    <button onClick={startGame} className="start-btn neon-border-pink">Try Again</button>
                </div>
            )}

            {gates.map(gate => (
                <Gate
                    key={gate.id}
                    type={gate.type}
                    progress={gate.progress}
                    isPassed={gate.isPassed}
                />
            ))}

            <div className="player-container">
                <Shape type={playerShape} size={100} isPlayer={true} />
            </div>

            <div className="score-display glass">
                <span>SCORE: {score}</span>
            </div>
        </div>
    );
};
