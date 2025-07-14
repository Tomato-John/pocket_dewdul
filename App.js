import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [250, 0, 0, 0],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const App = () => {
  const webViewRef = useRef(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    registerForPushNotifications().then(token => setExpoPushToken(token));
  }, []);

  const sendTokenToWebView = () => {
    if (webViewRef.current && expoPushToken) {
      const script = `window.expoPushToken = '${expoPushToken}';`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={{ height: Constants.statusBarHeight, backgroundColor: '#011526' }} />
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://dewdul.com' }}
          onLoadEnd={sendTokenToWebView}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011526',
  },
});

export default App;