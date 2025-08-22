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

type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

export async function getPlacements(
  days: number = 30,
  opts?: { signal?: AbortSignal }
): Promise<Placement[]> {
  try {
    const params = new URLSearchParams({ days: String(Math.max(1, days)) });
    const res = await fetch(`/api/placements?${params.toString()}`, {
      method: "GET",
      signal: opts?.signal,
      headers: { "Accept": "application/json" },
    });

    // If the network call itself failed (non-2xx), just return []
    if (!res.ok) return [];

    const json = (await res.json()) as ApiResponse<Placement[]>;

    if (!json?.ok || !Array.isArray(json.data)) return [];

    // Optional: normalize & sort by date (newest first)
    const items = json.data.map((p) => ({
      ...p,
      attachments: Array.isArray(p.attachments) ? p.attachments : [],
    }));

    items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return items;
  } catch {
    // Swallow errors for a resilient UI: return empty list
    return [];
  }
}
