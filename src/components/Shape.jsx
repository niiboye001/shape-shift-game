import { motion } from 'framer-motion';

const shapes = {
    circle: "M 50, 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0",
    square: "M 10, 10 H 90 V 90 H 10 Z",
    triangle: "M 50, 10 L 90, 85 L 10, 85 Z"
};

const colors = {
    circle: "var(--neon-pink)",
    square: "var(--neon-blue)",
    triangle: "var(--neon-green)"
};

const shadows = {
    circle: "var(--sh-pink)",
    square: "var(--sh-blue)",
    triangle: "var(--sh-green)"
};

const Shape = ({ type, size = 100, isPlayer = false, className = "" }) => {
    return (
        <div
            className={`shape-container ${className}`}
            style={{ width: size, height: size, position: 'relative' }}
        >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <motion.path
                    d={shapes[type] || shapes.circle}
                    fill="none"
                    stroke={colors[type] || colors.circle}
                    strokeWidth="4"
                    initial={false}
                    animate={{
                        d: shapes[type],
                        stroke: colors[type],
                        filter: `drop-shadow(${shadows[type]})`
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        duration: 0.3
                    }}
                />
                {isPlayer && (
                    <motion.path
                        d={shapes[type] || shapes.circle}
                        fill={colors[type]}
                        fillOpacity="0.2"
                        animate={{ d: shapes[type], fill: colors[type] }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                )}
            </svg>
        </div>
    );
};

export default Shape;
