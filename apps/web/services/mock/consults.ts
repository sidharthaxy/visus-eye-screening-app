// Mock remote-consult world (NEXT_PUBLIC_USE_MOCK=1), kept in localStorage. Seeded relative to the
// first visit so there is always a consult to join in a few minutes, one later today, upcoming
// ones, a completed one with a prescription and a missed one. Shaped exactly like the shared types.
import type { ConsultDetail, ConsultPrescription, ConsultSummary, Doctor, DoctorAccount, DoctorClinic, Language, PatientFile, SessionSummary } from "@visus/shared";
import { CONSULT_MINUTES } from "@visus/shared";

import { delay, load, save, uid } from "./store";

const WORLD_KEY = "consults-v1";

export type MockConsult = Omit<ConsultSummary, "doctor" | "calendar" | "hasPrescription">;
type World = { consults: MockConsult[]; prescriptions: ConsultPrescription[]; links: DoctorClinic[] };

export const CLINICS = {
  c1: { id: "c1", name: "Clear View Opticals", address: "Janpath, Unit 3", city: "Bhubaneswar" },
  c2: { id: "c2", name: "Netra Care Clinic", address: "College Square", city: "Cuttack" },
};

export const PATIENTS = {
  asha: { profileId: "pf-asha", name: "Asha Sharma", age: 46 },
  ravi: { profileId: "pf-ravi", name: "Ravi Patnaik", age: 62 },
  sunita: { profileId: "pf-sunita", name: "Sunita Das", age: 38 },
  arjun: { profileId: "pf-arjun", name: "Arjun Mohanty", age: 12 },
};

const DEMO_DOCTOR: DoctorAccount = {
  id: "doc-demo",
  visusId: "VIS-D-7K3Q",
  name: "Dr Meera Nayak",
  specialty: "Ophthalmologist",
  registrationNo: "OMC-2014-1123",
  languages: ["en", "hi", "or"],
  identifier: "meera@example.com",
};

/** The logged-in doctor: the one registered in this browser, else the demo doctor. */
export const doctorAccount = () => load<DoctorAccount>("doctor", DEMO_DOCTOR);
export const doctorPublic = (): Doctor => {
  const d = doctorAccount();
  return { id: d.id, visusId: d.visusId, name: d.name, specialty: d.specialty, registrationNo: d.registrationNo, languages: d.languages };
};

const minutesFromNow = (m: number) => {
  const d = new Date(Date.now() + m * 60_000);
  d.setSeconds(0, 0);
  return d.toISOString();
};
const dayAt = (days: number, h: number, m: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const dateOnly = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function seed(): World {
  const clinic = (c: (typeof CLINICS)["c1"]) => ({ id: c.id, name: c.name, city: c.city });
  const base = { minutes: CONSULT_MINUTES };
  const consults: MockConsult[] = [
    { ...base, id: "cs-now", startsAt: minutesFromNow(5), status: "scheduled", kind: "first", joinFrom: "home", reason: "Blurry reading for three months; the Amsler grid showed a small change in the left eye.", language: "hi", patient: PATIENTS.asha, clinic: clinic(CLINICS.c1) },
    { ...base, id: "cs-later", startsAt: minutesFromNow(180), status: "scheduled", kind: "follow_up", joinFrom: "clinic", reason: "Follow-up: new reading glasses and dry eyes.", language: "hi", patient: PATIENTS.ravi, clinic: clinic(CLINICS.c1) },
    { ...base, id: "cs-tomorrow", startsAt: dayAt(1, 16, 15), status: "scheduled", kind: "first", joinFrom: "home", reason: "Headaches after long screen work; eye strain score was high.", language: "en", patient: PATIENTS.sunita, clinic: clinic(CLINICS.c1) },
    { ...base, id: "cs-week", startsAt: dayAt(3, 16, 30), status: "scheduled", kind: "first", joinFrom: "clinic", reason: "School screening: distance vision lower in the right eye.", language: "or", patient: PATIENTS.arjun, clinic: clinic(CLINICS.c1) },
    { ...base, id: "cs-done", startsAt: dayAt(-2, 16, 0), status: "completed", kind: "first", joinFrom: "clinic", reason: "Trouble reading small print and glare while driving at night.", language: "hi", patient: PATIENTS.ravi, clinic: clinic(CLINICS.c1) },
    { ...base, id: "cs-missed", startsAt: dayAt(-5, 17, 0), status: "scheduled", kind: "first", joinFrom: "home", reason: "Red, itchy eyes for a week.", language: "en", patient: PATIENTS.sunita, clinic: clinic(CLINICS.c1) },
  ];
  const doctor = doctorPublic();
  const prescriptions: ConsultPrescription[] = [
    {
      id: "rx-done",
      consultId: "cs-done",
      date: consults[4].startsAt,
      status: "final",
      kind: "first",
      symptoms: "Difficulty reading small print for six months, and glare from headlights when driving at night.",
      observations: "Near vision N10 in both eyes on the Visus test; Amsler grid normal. Reading glasses advised.",
      glasses: { right: { sph: 0.5, cyl: -0.5, axis: 90, add: 2 }, left: { sph: 0.75, cyl: 0, axis: 0, add: 2 }, pd: 63 },
      medicines: [{ name: "Carboxymethylcellulose 0.5% eye drops", dose: "1 drop", frequency: "3 times a day", days: 30 }],
      remedies: ["Take a 20-second break every 20 minutes of reading", "Wear sunglasses outdoors"],
      followUpDate: dateOnly(consults[1].startsAt),
      doctor,
      clinic: consults[4].clinic,
      patient: PATIENTS.ravi,
      followUpConsultId: "cs-later",
      translated: {
        language: "hi",
        symptoms: "छह महीने से छोटे अक्षर पढ़ने में कठिनाई, और रात में गाड़ी चलाते समय हेडलाइट की चकाचौंध।",
        observations: "Visus टेस्ट में दोनों आँखों में पास की दृष्टि N10; एम्सलर ग्रिड सामान्य। पढ़ने का चश्मा सलाह दिया गया।",
        remedies: ["पढ़ते समय हर 20 मिनट पर 20 सेकंड का ब्रेक लें", "बाहर धूप का चश्मा पहनें"],
      },
    },
  ];
  const links: DoctorClinic[] = [
    {
      linkId: "l1",
      clinic: CLINICS.c1,
      status: "active",
      hours: [
        { day: 1, start: "16:00", end: "18:00" },
        { day: 3, start: "16:00", end: "18:00" },
        { day: 5, start: "10:00", end: "12:00" },
      ],
      createdAt: dayAt(-30, 10, 0),
    },
    { linkId: "l2", clinic: CLINICS.c2, status: "pending", hours: [], createdAt: dayAt(-1, 11, 20) },
  ];
  return { consults, prescriptions, links };
}

export function world(): World {
  const w = load<World | null>(WORLD_KEY, null);
  if (w) return w;
  const fresh = seed();
  save(WORLD_KEY, fresh);
  return fresh;
}

export const saveWorld = (w: World) => save(WORLD_KEY, w);

/** Start the mock world again from fresh dates (e.g. after the demo consult passed). */
export const resetWorld = () => saveWorld(seed());

// ---------- Reading consults the way the server shows them ----------

/** "missed" is worked out on read: nobody joined by 15 minutes after the start. */
function statusNow(c: MockConsult): MockConsult["status"] {
  if (c.status === "scheduled" && Date.now() > Date.parse(c.startsAt) + CONSULT_MINUTES * 60_000) return "missed";
  return c.status;
}

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Google Calendar link and an .ics file (as a data: URL), with alarms 1 h and 10 min before. */
function calendar(c: MockConsult, doctorName: string): ConsultSummary["calendar"] {
  const end = new Date(Date.parse(c.startsAt) + c.minutes * 60_000).toISOString();
  const title = `Eye consult: ${c.patient.name} with ${doctorName}`;
  const details = `${c.reason}\n\nJoin from Visus. ${c.joinFrom === "clinic" ? `At ${c.clinic.name}.` : "From home."}`;
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(c.startsAt)}/${stamp(end)}&details=${encodeURIComponent(details)}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Visus//Consult//EN",
    "BEGIN:VEVENT",
    `UID:${c.id}@visus`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(c.startsAt)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details.replace(/\n/g, "\\n")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Eye consult in 1 hour",
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Eye consult in 10 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return { googleUrl, icsUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}

export function summary(c: MockConsult, w = world()): ConsultSummary {
  const doctor = doctorPublic();
  return {
    ...c,
    status: statusNow(c),
    doctor,
    hasPrescription: w.prescriptions.some((p) => p.consultId === c.id && p.status === "final"),
    calendar: calendar(c, doctor.name),
  };
}

export type When = "today" | "upcoming" | "past";

/** Today and upcoming soonest first, past newest first (as the server lists them). */
export function listConsults(when: When, keep: (c: MockConsult) => boolean = () => true): ConsultSummary[] {
  const w = world();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = start.getTime() + 86_400_000;
  const at = (c: MockConsult) => Date.parse(c.startsAt);
  const pick = (c: MockConsult) => (when === "today" ? at(c) >= start.getTime() && at(c) < end : when === "upcoming" ? at(c) >= end : at(c) < start.getTime());
  const list = w.consults.filter((c) => keep(c) && pick(c)).sort((a, b) => at(a) - at(b));
  return (when === "past" ? list.reverse() : list).map((c) => summary(c, w));
}

export const newId = (prefix: string) => `${prefix}-${uid()}`;
export type { Language };

// ---------- One consult, and the doctor's patient file ----------

/** How the signed-in mock account takes part: doctor, clinic (shop account) or patient. */
const myRole = (): ConsultDetail["role"] => {
  const role = load<{ role?: string } | null>("user", null)?.role;
  return role === "doctor" ? "doctor" : role === "shop" ? "clinic" : "patient";
};

export async function detail(id: string): Promise<ConsultDetail> {
  await delay(150);
  const c = world().consults.find((x) => x.id === id);
  if (!c) throw new Error("Consult not found");
  return { ...summary(c), role: myRole() };
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

type FileExtras = Pick<PatientFile, "summary"> & { patient: Omit<PatientFile["patient"], "profileId" | "name" | "age">; sessions: SessionSummary[] };

const shopName = CLINICS.c1.name;
const FILES: Record<string, FileExtras> = {
  "pf-asha": {
    patient: {
      gender: "Female",
      wearsGlasses: true,
      healthConditions: ["Diabetes"],
      glasses: { right: { sph: -1.25, cyl: -0.5, axis: 180 }, left: { sph: -1, cyl: -0.25, axis: 170 }, updatedAt: daysAgo(400) },
    },
    summary: {
      text: "Asha reports blurry reading for three months. Her latest Visus check found near vision at N12 and a small change on the Amsler grid in the left eye; distance vision was good with her glasses. She has diabetes, so the Amsler change is worth a closer look.",
      points: ["Amsler grid: small change near the centre, left eye (see a doctor)", "Near vision N12 in both eyes (mild change)", "Distance vision 20/25 right, 20/30 left with glasses (looks good)", "Glasses last updated over a year ago"],
      ai: true,
      generatedAt: daysAgo(0),
    },
    sessions: [
      { id: "chk-asha-2", profileId: "pf-asha", date: daysAgo(3), mode: "full", headline: "One thing to follow up with a doctor", status: "see_doctor", tests: ["tumbling_e", "near_reading", "amsler", "contrast"], scores: { tumbling_e: 84, near_reading: 62, amsler: 40, contrast: 76 }, shopName },
      { id: "chk-asha-1", profileId: "pf-asha", date: daysAgo(70), mode: "quick", headline: "Your eyes look healthy", status: "good", tests: ["tumbling_e", "amsler", "clock_dial"], scores: { tumbling_e: 86, amsler: 100, clock_dial: 92 } },
    ],
  },
  "pf-ravi": {
    patient: { gender: "Male", wearsGlasses: true, healthConditions: ["High blood pressure"], glasses: null },
    summary: {
      text: "Ravi had a first consult two days ago for trouble reading and night glare; reading glasses (+2.00 add) and lubricating drops were prescribed. His last check showed near vision at N10 and normal Amsler grids.",
      points: ["Near vision N10 in both eyes (mild change)", "Glare at night: moderate on the questionnaire", "Amsler grid normal in both eyes"],
      ai: true,
      generatedAt: daysAgo(0),
    },
    sessions: [{ id: "chk-ravi-1", profileId: "pf-ravi", date: daysAgo(4), mode: "full", headline: "Reading print needs a closer look", status: "mild", tests: ["near_reading", "glare_night", "amsler"], scores: { near_reading: 68, glare_night: 55, amsler: 100 }, shopName }],
  },
};

/** Rule fallback, as the server writes it when the AI is unavailable. */
const NO_AI: FileExtras = {
  patient: { wearsGlasses: false, healthConditions: [], glasses: null },
  summary: { text: "No Visus checks on record yet. Ask about the reason for this consult, and send a test during the call if it helps.", points: [], ai: false, generatedAt: daysAgo(0) },
  sessions: [],
};

export async function file(id: string): Promise<PatientFile> {
  await delay(400);
  const w = world();
  const c = w.consults.find((x) => x.id === id);
  if (!c) throw new Error("Consult not found");
  const extras = FILES[c.patient.profileId] ?? NO_AI;
  return {
    patient: { ...c.patient, ...extras.patient },
    summary: extras.summary,
    sessions: extras.sessions,
    prescriptions: w.prescriptions.filter((p) => p.patient.profileId === c.patient.profileId && p.status === "final"),
    consults: w.consults.filter((x) => x.patient.profileId === c.patient.profileId && x.id !== id).map((x) => summary(x, w)),
  };
}
