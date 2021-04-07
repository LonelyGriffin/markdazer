/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {createRef, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  NativeModules,
} from 'react-native';
import SoftwareKeyboardService from './nativeModules/SoftwareKeyboardService';
import Editor from './src/editor';

declare const global: {HermesInternal: null | {}};

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar />
      <Editor />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
});

export default App;
