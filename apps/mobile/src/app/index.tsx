import { Redirect } from 'expo-router';

// No auth yet: always start at the entry screen.
export default function Index() {
  return <Redirect href="/welcome" />;
}
