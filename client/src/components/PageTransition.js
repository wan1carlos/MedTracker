import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

const PageTransition = ({ children, variant = "default" }) => {
  const variants = {
    default: pageVariants,
    slide: {
      initial: { opacity: 0, x: -200 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: 200 }
    },
    fade: {
      initial: { opacity: 0 },
      in: { opacity: 1 },
      out: { opacity: 0 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants[variant]}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 