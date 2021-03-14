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

declare const global: {HermesInternal: null | {}};

const App = () => {
  useEffect(() => {
    return SoftwareKeyboardService.subscribe((event) => {
      console.log(event);
    });
  });
  const onChange = () => {
    SoftwareKeyboardService.dispatch({
      type: 'change',
      text: 'text',
      cursor: 1,
    });
  };
  const onOpen = () => {
    SoftwareKeyboardService.dispatch({
      type: 'open',
    });
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <Button title="change" onPress={onChange} />
        <Button title="open" onPress={onOpen} />
      </SafeAreaView>
    </>
  );
};

export default App;
