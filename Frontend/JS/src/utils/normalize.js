export const toBool = (v) => v === true || v === "true";

export const normalizeHouse = (d) => ({
  ...d,
  h_no: Number(d.h_no),
  h_electricity: toBool(d.h_electricity),
  h_refrigerator: toBool(d.h_refrigerator),
  h_washing_machine: toBool(d.h_washing_machine),
  h_toilet: toBool(d.h_toilet),
  h_agriculture: toBool(d.h_agriculture),
  h_livestock: toBool(d.h_livestock),
});

export const normalizeMember = (d) => ({
  ...d,
  h_no: Number(d.h_no),            // required by backend
  m_age: Number(d.m_age),
  job_status: toBool(d.job_status),
  election_id: toBool(d.election_id),
  m_disability: toBool(d.m_disability),
  m_pension: toBool(d.m_pension),
  m_ration_card: toBool(d.m_ration_card),
  m_health_insurance: toBool(d.m_health_insurance),
});
