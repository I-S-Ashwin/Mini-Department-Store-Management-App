import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { layoutStyles } from '../src/styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={layoutStyles.notFoundContainer}>
        <Text style={layoutStyles.notFoundTitle}>This screen doesn't exist.</Text>
        <Link href="/" style={layoutStyles.notFoundLink}>
          <Text style={layoutStyles.notFoundLinkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
