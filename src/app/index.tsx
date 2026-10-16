
import React from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';

import {
  useAuth,
} from '../features/auth/hooks/use-auth';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/inicio" />;
}
