module.exports = {
  setupFiles: ['jest-date-mock'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { rootMode: 'upward' }],
  },
};
