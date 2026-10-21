/**
 * Face-to-screen distance in cm from the front camera, or null when unknown.
 * Build sprint: measure with @mediapipe/tasks-vision. Until then the run screen never
 * shows the distance warning.
 */
export function useDistance(): number | null {
  return null;
}

export const DISTANCE_OK = { min: 35, max: 45 };
