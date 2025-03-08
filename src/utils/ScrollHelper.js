/**
 * Scrolls the window to the top with smooth animation
 * @param {boolean} smooth - Whether to animate the scroll (true) or jump instantly (false)
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

export default scrollToTop; 