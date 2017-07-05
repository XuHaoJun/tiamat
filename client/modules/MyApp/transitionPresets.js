import spring from "react-motion/lib/spring";

const fadeConfig = {
  stiffness: 200,
  damping: 22
};
const popConfig = {
  stiffness: 360,
  damping: 25
};
const slideConfig = {
  stiffness: 330,
  damping: 30
};

const fade = {
  atEnter: {
    opacity: 0,
    zIndex: 2
  },
  atLeave: {
    opacity: 1,
    zIndex: 0
  },
  atActive: {
    opacity: spring(1, fadeConfig),
    zIndex: 1
  },
  mapStyles: styles => {
    return { opacity: styles.opacity, zIndex: styles.zIndex };
  }
};

const pop = {
  atEnter: {
    scale: 0.8,
    opacity: 0
  },
  atLeave: {
    scale: spring(0.8, popConfig),
    opacity: spring(0, popConfig)
  },
  atActive: {
    scale: spring(1, popConfig),
    opacity: 1
  },
  mapStyles(styles) {
    return { opacity: styles.opacity, transform: `scale(${styles.scale})` };
  }
};

const slideLeft = {
  atEnter: {
    zIndex: 1,
    opacity: 0,
    offset: 100
  },
  atLeave: {},
  atActive: {
    zIndex: 1,
    opacity: spring(1, slideConfig),
    offset: spring(0, slideConfig)
  },
  mapStyles(styles) {
    return {
      zIndex: styles.zIndex,
      opacity: styles.opacity,
      transform: `translateX(${styles.offset}%)`
    };
  }
};

const slideRight = {
  atEnter: {
    zIndex: 1,
    opacity: 0,
    offset: -100
  },
  atLeave: {},
  atActive: {
    zIndex: 1,
    opacity: spring(1, slideConfig),
    offset: spring(0, slideConfig)
  },
  mapStyles(styles) {
    return {
      zIndex: styles.zIndex,
      opacity: styles.opacity,
      transform: `translateX(${styles.offset}%)`
    };
  }
};

export default {
  fade,
  pop,
  slideLeft,
  slideRight
};
