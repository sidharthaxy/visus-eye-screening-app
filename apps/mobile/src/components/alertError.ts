// A failed button action (save, start a check): a short native alert with the server's message.
// Pages that fail to load show the Error state (LoadState / ErrorState) instead.
import { Alert } from 'react-native';

export function alertError(e: unknown, title = "Couldn't do that") {
  const message = e instanceof Error && e.message ? e.message : 'Check your internet connection and try again.';
  Alert.alert(title, message);
}
