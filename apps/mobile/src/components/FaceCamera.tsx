// Front camera + ML Kit face detection → distance from the screen to the eyes, in cm.
// Development build only (VisionCamera, Nitro): load it through DistanceCamera, never directly.
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera, type Face } from 'react-native-vision-camera-face-detector';

export type FaceCameraProps = {
  /** Smoothed distance in cm, or null when no face is seen. */
  onDistance: (cm: number | null) => void;
  /** Show the camera image (Distance setup) or run invisibly (during a test). */
  preview?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Distance between the pupils. 63 mm for adults, about 54 mm for children. */
  ipdMm?: number;
};

/** Typical front camera when the phone doesn't report its focal length (35 mm equivalent). */
const DEFAULT_FOCAL_35MM = 26;
/** Diagonal of 35 mm film, which "35 mm equivalent" focal lengths refer to. */
const FILM_DIAGONAL_MM = 43.27;

/** Pinhole camera: distance = real eye spacing × focal length in pixels ÷ eye spacing in pixels. */
function distanceCm(face: Face, focal35: number | undefined, ipdMm: number) {
  const focalPx = ((focal35 && focal35 > 10 ? focal35 : DEFAULT_FOCAL_35MM) / FILM_DIAGONAL_MM) * Math.hypot(face.frameWidth, face.frameHeight);
  const left = face.landmarks?.LEFT_EYE;
  const right = face.landmarks?.RIGHT_EYE;
  // Eyes are about 42% of the face width apart when landmarks are missing.
  let eyesPx = left && right ? Math.hypot(left.x - right.x, left.y - right.y) : face.bounds.width * 0.42;
  // A turned head makes the eyes look closer together.
  eyesPx /= Math.max(0.5, Math.cos((Math.abs(face.yawAngle) * Math.PI) / 180));
  if (eyesPx < 4) return null;
  return (ipdMm * focalPx) / eyesPx / 10;
}

export default function FaceCamera({ onDistance, preview = false, style, ipdMm = 63 }: FaceCameraProps) {
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const smooth = useRef<number | null>(null);
  const lastFace = useRef(0);

  useEffect(() => {
    if (!hasPermission) void requestPermission();
  }, [hasPermission, requestPermission]);

  const onFaces = useCallback(
    (faces: Face[]) => {
      const face = faces.reduce<Face | null>((big, f) => (!big || f.bounds.width > big.bounds.width ? f : big), null);
      const cm = face ? distanceCm(face, device?.focalLength, ipdMm) : null;
      if (cm === null) {
        // Brief misses (a blink, a hand) keep the last value for a second.
        if (Date.now() - lastFace.current > 1000) {
          smooth.current = null;
          onDistance(null);
        }
        return;
      }
      lastFace.current = Date.now();
      smooth.current = smooth.current === null ? cm : smooth.current * 0.7 + cm * 0.3;
      onDistance(Math.round(smooth.current));
    },
    [device?.focalLength, ipdMm, onDistance],
  );

  if (!device || !hasPermission) return <View style={preview ? style : styles.hidden} />;
  return (
    <Camera
      device={device}
      isActive
      style={preview ? style : styles.hidden}
      resizeMode="cover"
      performanceMode="fast"
      runLandmarks
      autoMode={false}
      onFacesDetected={onFaces}
      onError={() => onDistance(null)}
    />
  );
}

const styles = StyleSheet.create({
  // Still runs the camera, just not visible.
  hidden: { position: 'absolute', width: 2, height: 2, opacity: 0, left: 0, top: 0 },
});
