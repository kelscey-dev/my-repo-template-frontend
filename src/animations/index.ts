export const fadeIn = {
  enter: {
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
  exit: {
    opacity: 0,
  },
};

export const fadeInSlideUp = {
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
  exit: {
    y: 20,
    opacity: 0,
  },
};

export const fadeInSlideDown = {
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
  exit: {
    y: -20,
    opacity: 0,
  },
};

export const fadeInSlideLeft = {
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
  exit: {
    x: 20,
    opacity: 0,
  },
};

export const fadeInSlideRight = {
  enter: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.5,
    },
  },
  exit: {
    x: -20,
    opacity: 0,
  },
};

// when: "beforeChildren",
// staggerChildren: 0.5,
