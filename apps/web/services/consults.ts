import type { ConsultDetail, PatientFile } from "@visus/shared";

import { api, USE_MOCK } from "./api";
import * as mock from "./mock/consults";

export type { ConsultDetail, PatientFile };

/** GET /consults/:id: the consult, with `role` = how the caller takes part (doctor, patient, clinic). */
export async function getConsult(id: string): Promise<ConsultDetail> {
  if (USE_MOCK) return mock.detail(id);
  return api<ConsultDetail>(`/consults/${id}`);
}

/** GET /consults/:id/file (doctor): the AI summary first, then the patient's full history. */
export async function getPatientFile(id: string): Promise<PatientFile> {
  if (USE_MOCK) return mock.file(id);
  return api<PatientFile>(`/consults/${id}/file`);
}
