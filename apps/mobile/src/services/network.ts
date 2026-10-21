// Is the phone online? Used for the Offline state (54) and to send answers kept offline.
import * as Network from 'expo-network';

const online = (s: Network.NetworkState) => s.isConnected !== false && s.isInternetReachable !== false;

/** Live online state for screens. Unknown counts as online. */
export function useOnline() {
  return online(Network.useNetworkState());
}

export async function isOnline() {
  try {
    return online(await Network.getNetworkStateAsync());
  } catch {
    return true;
  }
}
