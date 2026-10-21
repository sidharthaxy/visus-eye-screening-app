// Saved on the phone with AsyncStorage, so these stores survive an app restart.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const phoneStorage = createJSONStorage(() => AsyncStorage);
