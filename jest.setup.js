// jest.mock('react-native-gesture-handler', () => {
//   return {
//     GestureHandlerRootView: ({ children }) => children,
//     Swipeable: jest.fn(),
//     DrawerLayout: jest.fn(),
//     State: {},
//     PanGestureHandler: jest.fn(),
//     TapGestureHandler: jest.fn(),
//     FlingGestureHandler: jest.fn(),
//     ForceTouchGestureHandler: jest.fn(),
//     LongPressGestureHandler: jest.fn(),
//     PinchGestureHandler: jest.fn(),
//     RotationGestureHandler: jest.fn(),
//     /* and other gesture handlers if needed */
//   };
// });

// jest.setup.js or similar
jest.mock('react-native-gesture-handler', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
  
    // A forwardRef mock for PanGestureHandler
    const MockPanGestureHandler = React.forwardRef((props, ref) => {
      return <View ref={ref} {...props} />;
    });
  
    return {
      PanGestureHandler: MockPanGestureHandler,
      // ... mock out any other handlers you use if needed
      TapGestureHandler: View,
      LongPressGestureHandler: View,
      RotationGestureHandler: View,
      FlingGestureHandler: View,
      // etc.
    };
  });
  