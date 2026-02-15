import { motion } from 'framer-motion';
import Shape from './Shape';

const Gate = ({ type, progress, size = 200, isColliding = false, isPassed = false }) => {
    // progress goes from 0 to 1
    // 0 is far away, 1 is right at the player

    const scale = 0.5 + progress * 1.5;
    const opacity = progress > 0.8 ? 1 - (progress - 0.8) * 5 : progress * 2;
    const zIndex = 100 - Math.floor(progress * 100);

    return (
        <motion.div
            className="gate-container"
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                scale,
                opacity,
                zIndex,
                width: size,
                height: size,
                pointerEvents: 'none',
            }}
        >
            <div className={`gate-frame ${isColliding ? 'colliding' : ''} ${isPassed ? 'passed' : ''}`}>
                <div className="gate-cutout">
                    <Shape type={type} size={size * 0.6} className="gate-shape-cutout" />
                </div>
            </div>
        </motion.div>
    );
};

export default Gate;
