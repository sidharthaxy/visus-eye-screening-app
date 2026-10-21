import type { Profile } from "@visus/shared";

import { api, USE_MOCK } from "./api";
import * as mock from "./mock/profiles";

export type Prescription = { rS: string; rC: string; rA: string; lS: string; lC: string; lA: string; updatedAt: string };

/**
 * Profile plus the fields the design shows that the shared `Profile` type doesn't have yet
 * (relation, glasses type, past eye test, prescription). Asked for in progress/sidhartha.md.
 */
export type ProfileDetails = Profile & {
  relation?: string;
  specs?: string;
  pastEyeTest?: string;
  screenTime?: string;
  prescription?: Prescription | null;
};

export type NewProfile = Omit<ProfileDetails, "id">;

export async function listProfiles(): Promise<ProfileDetails[]> {
  if (USE_MOCK) return mock.list();
  return api<ProfileDetails[]>("/profiles");
}

export async function createProfile(input: NewProfile): Promise<ProfileDetails> {
  if (USE_MOCK) return mock.create(input);
  return api<ProfileDetails>("/profiles", { body: input });
}

export async function updateProfile(id: string, patch: Partial<NewProfile>): Promise<ProfileDetails> {
  if (USE_MOCK) return mock.update(id, patch);
  return api<ProfileDetails>(`/profiles/${id}`, { method: "PATCH", body: patch });
}

/** Screen-time answer from onboarding → hours per day for the shared Profile. */
export const SCREEN_TIME_OPTIONS = ["Under 2 hours", "2–4 hours", "4–6 hours", "6–8 hours", "More than 8 hours"];
export const screenHours = (label: string | null | undefined) => {
  const i = SCREEN_TIME_OPTIONS.indexOf(label ?? "");
  return i < 0 ? 0 : [1, 3, 5, 7, 9][i];
};

export const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Prefer not to say"];
export const SPECS_OPTIONS = ["Glasses", "Contact lenses", "Both", "Neither"];
export const PAST_OPTIONS = ["Yes", "No", "Not sure"];
export const CONDITION_OPTIONS = ["Diabetes", "High blood pressure", "Thyroid", "Migraines", "Dry eyes", "Allergies", "Other", "None of these"];

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join("");
