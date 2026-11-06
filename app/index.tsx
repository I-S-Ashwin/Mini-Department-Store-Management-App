import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/AuthContext';

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/login" />;
}
