export interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  updates: string;
  highlights: string[];
}

export interface BusinessAnalytics {
  totalRevenue: number;
  activeOrdersCount: number;
  conversionRate: number;
  avgOrderValue: number;
  totalPcsProduced: number;
}

export const monthlySalesDatabase: MonthlySalesData[] = [
  {
    month: 'August 2026',
    sales: 12,
    orders: 14,
    revenue: 333735,
    cogs: 142850,
    expenses: 42100,
    netProfit: 148785,
    updates: 'August has seen strong demand driven by collegiate festivals and RWA pre-festive orders. Product margins remained healthy.',
    highlights: ['TechFest IIT Bombay order acquired', 'New oversized heavy blank launched', 'Delhivery logistics contract signed']
  },
  {
    month: 'July 2026',
    sales: 18,
    orders: 22,
    revenue: 412500,
    cogs: 185620,
    expenses: 51200,
    netProfit: 175680,
    updates: 'July logistics efficiency increased by 12% due to bulk sorting. Corporate orders contributed 55% of the total revenue.',
    highlights: ['ZettaScale order delivered successfully', 'E-Way bill automation finalized', 'Completed audit for monsoon fabric storage']
  },
  {
    month: 'June 2026',
    sales: 15,
    orders: 17,
    revenue: 352000,
    cogs: 158400,
    expenses: 48500,
    netProfit: 145100,
    updates: 'June was steady with school and summer camps orders. Print cost optimization reduced scrap rate to 1.8%.',
    highlights: ['School sportswear season kick-off', 'Upgraded printing bed heater', 'Onboarded 2 senior editors']
  }
];

export const getBusinessAnalytics = (): BusinessAnalytics => {
  return {
    totalRevenue: 1098235,
    activeOrdersCount: 6,
    conversionRate: 4.8,
    avgOrderValue: 24350,
    totalPcsProduced: 2850,
  };
};
