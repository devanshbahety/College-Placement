export type Placement = {
  id: string;
  date: string;
  subject: string;
  from: string;
  company: string;
  role: string;
  ctc: string;
  location: string;
  importantDates: string;
  eligibility: string;
  link: string;
  attachments: { filename: string; contentType: string; size: number }[];
  snippet: string;
};

export async function getPlacements(days = 7): Promise<Placement[]> {
  const res = await fetch(`/api/placements?days=${days}`); // 👈 relative URL
  const json = await res.json();
  if (!json.ok) return [];
  return json.data as Placement[];
}
