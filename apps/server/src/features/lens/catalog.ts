// ZEISS lens products and coatings used in suggestions (names as on zeiss.co.in).
export const LENSES = {
  smartLifeSv: { product: 'ZEISS SmartLife Single Vision', lensType: 'Single vision lens' },
  smartLifeProgressive: { product: 'ZEISS SmartLife Progressive', lensType: 'Progressive lens' },
  smartLifeDigital: { product: 'ZEISS SmartLife Digital', lensType: 'Single vision lens with near support' },
  smartLifeYoung: { product: 'ZEISS SmartLife Young', lensType: 'Single vision lens for children' },
  driveSafeSv: { product: 'ZEISS DriveSafe Single Vision', lensType: 'Single vision lens' },
  driveSafeProgressive: { product: 'ZEISS DriveSafe Progressive', lensType: 'Progressive lens' },
  myoCare: { product: 'ZEISS MyoCare', lensType: 'Myopia management lens for children' },
  photoFusionX: { product: 'ZEISS PhotoFusion X', lensType: 'Self-tinting (photochromic) lens' },
} as const;

export const COATINGS = {
  platinum: { name: 'ZEISS DuraVision Platinum UV', reason: 'Fewer reflections, easy to clean, resists scratches' },
  driveSafe: { name: 'ZEISS DuraVision DriveSafe UV', reason: 'Cuts glare from headlights and wet roads' },
  blueGuard: { name: 'ZEISS BlueGuard', reason: 'Filters part of the blue-violet light from screens' },
  blueProtect: { name: 'ZEISS DuraVision BlueProtect UV', reason: 'Reflects part of the blue light from screens' },
} as const;

export type LensKey = keyof typeof LENSES;
