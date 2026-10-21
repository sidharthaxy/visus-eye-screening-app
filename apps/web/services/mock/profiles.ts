import type { NewProfile, ProfileDetails } from "../profiles";
import { delay, load, save, uid } from "./store";

const SEED: ProfileDetails[] = [
  {
    id: "p1",
    name: "Asha Sharma",
    age: 34,
    gender: "Female",
    isChild: false,
    wearsGlasses: true,
    healthConditions: ["Migraines"],
    screenHoursPerDay: 5,
    relation: "You",
    specs: "Glasses",
    pastEyeTest: "Yes",
    screenTime: "4–6 hours",
    prescription: { rS: "−1.25", rC: "−0.50", rA: "180", lS: "−1.00", lC: "−0.25", lA: "170", updatedAt: "2026-03-12" },
  },
  {
    id: "p2",
    name: "Riya Sharma",
    age: 8,
    gender: "Female",
    isChild: true,
    wearsGlasses: false,
    healthConditions: [],
    screenHoursPerDay: 2,
    relation: "Daughter",
    specs: "Neither",
    prescription: null,
  },
  {
    id: "p3",
    name: "Raj Sharma",
    age: 67,
    gender: "Male",
    isChild: false,
    wearsGlasses: true,
    healthConditions: ["High blood pressure"],
    screenHoursPerDay: 3,
    relation: "Father",
    specs: "Glasses",
    prescription: { rS: "+2.00", rC: "0.00", rA: "0", lS: "+2.25", lC: "0.00", lA: "0", updatedAt: "2026-01-20" },
  },
];

const all = () => load<ProfileDetails[]>("profiles", SEED);

export async function list() {
  await delay(150);
  return all();
}

export async function create(input: NewProfile) {
  await delay();
  const profile = { ...input, id: uid() };
  save("profiles", [...all(), profile]);
  return profile;
}

export async function update(id: string, patch: Partial<NewProfile>) {
  await delay();
  const next = all().map((p) => (p.id === id ? { ...p, ...patch } : p));
  save("profiles", next);
  return next.find((p) => p.id === id)!;
}
