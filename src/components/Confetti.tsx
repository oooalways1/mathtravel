import { motion } from 'framer-motion';

const Confetti = () => {
  const confettiPieces = Array.from({ length: 50 });
  const emojis = ['🎉', '⭐', '✨', '🌟', '💫', '🎊'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((_, i) => {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 2;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`,
              y: -20,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              y: '110vh',
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'linear',
            }}
            className="absolute text-3xl"
          >
            {randomEmoji}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Confetti;


