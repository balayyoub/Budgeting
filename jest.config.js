module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(@realm|@react-native|react-native|react-navigation|@react-navigation|@react-native-community|@react-native-firebase)/)'
  ],
  setupFiles: ['./jest.setup.js'],
};
