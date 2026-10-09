
import React from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import {
  Redirect,
  Slot,
} from 'expo-router';

import {
  useAuth,
} from '../../features/auth/hooks/use-auth';

export default function AuthLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/inicio" />;
  }

  return <Slot />;
}
