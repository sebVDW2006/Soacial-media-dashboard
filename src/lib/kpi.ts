export type KpiGroup = {
  groupKey: string;
  label: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  follows: number;
  dms_or_leads: number;
  engagement_rate: number;
};

export function aggregateKpis<
  T extends {
    groupKey: string;
    label: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    follows: number;
    dms_or_leads: number;
  },
>(rows: T[]): KpiGroup[] {
  const grouped = new Map<string, KpiGroup>();

  for (const row of rows) {
    const current = grouped.get(row.groupKey) ?? {
      groupKey: row.groupKey,
      label: row.label,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      follows: 0,
      dms_or_leads: 0,
      engagement_rate: 0,
    };

    current.impressions += row.impressions;
    current.likes += row.likes;
    current.comments += row.comments;
    current.shares += row.shares;
    current.follows += row.follows;
    current.dms_or_leads += row.dms_or_leads;

    grouped.set(row.groupKey, current);
  }

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      engagement_rate: row.impressions
        ? (row.likes + row.comments + row.shares) / row.impressions
        : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

