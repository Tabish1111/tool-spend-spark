// Sample data structure for Tool Cost Dashboard
export interface ToolData {
  id: string;
  name: string;
  monthlyCost: number;
  yearlySchedule: 'monthly' | 'yearly';
  actualYearlyCost: number;
  accounts: number;
  assignedPerson: 'Rudyculous' | 'Rudraksh' | 'Both';
  category: 'Need' | 'Want';
  gunaHonestyMeter: number; // 1-10 scale
  renewalDate: string;
  notes: string;
  isOverBudget?: boolean;
}

export const sampleToolData: ToolData[] = [
  {
    id: '1',
    name: 'Figma Pro',
    monthlyCost: 45,
    yearlySchedule: 'monthly',
    actualYearlyCost: 540,
    accounts: 2,
    assignedPerson: 'Both',
    category: 'Need',
    gunaHonestyMeter: 9,
    renewalDate: '2024-03-15',
    notes: 'Essential for design work'
  },
  {
    id: '2',
    name: 'ChatGPT Plus',
    monthlyCost: 20,
    yearlySchedule: 'monthly',
    actualYearlyCost: 240,
    accounts: 1,
    assignedPerson: 'Rudyculous',
    category: 'Need',
    gunaHonestyMeter: 8,
    renewalDate: '2024-02-20',
    notes: 'AI assistance for content creation'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    monthlyCost: 79.99,
    yearlySchedule: 'monthly',
    actualYearlyCost: 959.88,
    accounts: 1,
    assignedPerson: 'Rudraksh',
    category: 'Need',
    gunaHonestyMeter: 7,
    renewalDate: '2024-04-10',
    notes: 'Video editing and graphics',
    isOverBudget: true
  },
  {
    id: '4',
    name: 'Notion Team',
    monthlyCost: 16,
    yearlySchedule: 'monthly',
    actualYearlyCost: 192,
    accounts: 3,
    assignedPerson: 'Both',
    category: 'Need',
    gunaHonestyMeter: 9,
    renewalDate: '2024-01-30',
    notes: 'Project management and documentation'
  },
  {
    id: '5',
    name: 'Spotify Premium',
    monthlyCost: 9.99,
    yearlySchedule: 'monthly',
    actualYearlyCost: 119.88,
    accounts: 2,
    assignedPerson: 'Both',
    category: 'Want',
    gunaHonestyMeter: 3,
    renewalDate: '2024-05-12',
    notes: 'Background music while working'
  },
  {
    id: '6',
    name: 'GitHub Pro',
    monthlyCost: 4,
    yearlySchedule: 'monthly',
    actualYearlyCost: 48,
    accounts: 2,
    assignedPerson: 'Both',
    category: 'Need',
    gunaHonestyMeter: 8,
    renewalDate: '2024-06-01',
    notes: 'Code repository and collaboration'
  },
  {
    id: '7',
    name: 'Canva Pro',
    monthlyCost: 14.99,
    yearlySchedule: 'yearly',
    actualYearlyCost: 179.88,
    accounts: 1,
    assignedPerson: 'Rudyculous',
    category: 'Want',
    gunaHonestyMeter: 5,
    renewalDate: '2024-12-15',
    notes: 'Quick graphics and social media content'
  },
  {
    id: '8',
    name: 'Linear',
    monthlyCost: 8,
    yearlySchedule: 'monthly',
    actualYearlyCost: 96,
    accounts: 2,
    assignedPerson: 'Both',
    category: 'Need',
    gunaHonestyMeter: 6,
    renewalDate: '2024-03-22',
    notes: 'Issue tracking and project planning'
  },
  {
    id: '9',
    name: 'Grammarly Premium',
    monthlyCost: 12,
    yearlySchedule: 'monthly',
    actualYearlyCost: 144,
    accounts: 1,
    assignedPerson: 'Rudraksh',
    category: 'Want',
    gunaHonestyMeter: 4,
    renewalDate: '2024-07-08',
    notes: 'Writing enhancement'
  },
  {
    id: '10',
    name: 'Vercel Pro',
    monthlyCost: 20,
    yearlySchedule: 'monthly',
    actualYearlyCost: 240,
    accounts: 1,
    assignedPerson: 'Rudyculous',
    category: 'Need',
    gunaHonestyMeter: 7,
    renewalDate: '2024-04-18',
    notes: 'Hosting and deployment platform'
  }
];

// Calculate KPIs
export const calculateKPIs = (data: ToolData[]) => {
  const totalMonthly = data.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const totalYearly = data.reduce((sum, tool) => sum + tool.actualYearlyCost, 0);
  const averageGunaHonesty = data.reduce((sum, tool) => sum + tool.gunaHonestyMeter, 0) / data.length;
  const needCount = data.filter(tool => tool.category === 'Need').length;
  const wantCount = data.filter(tool => tool.category === 'Want').length;
  const overBudgetCount = data.filter(tool => tool.isOverBudget).length;

  return {
    totalMonthly,
    totalYearly,
    averageGunaHonesty,
    needCount,
    wantCount,
    overBudgetCount,
    totalTools: data.length
  };
};

// Group data for charts
export const getChartData = (data: ToolData[]) => {
  // Cost by tool
  const costByTool = data
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .map(tool => ({
      name: tool.name,
      cost: tool.monthlyCost,
      category: tool.category
    }));

  // Cost by person
  const costByPersonMap = data.reduce((acc, tool) => {
    if (tool.assignedPerson === 'Both') {
      acc.Rudyculous = (acc.Rudyculous || 0) + tool.monthlyCost / 2;
      acc.Rudraksh = (acc.Rudraksh || 0) + tool.monthlyCost / 2;
    } else {
      acc[tool.assignedPerson] = (acc[tool.assignedPerson] || 0) + tool.monthlyCost;
    }
    return acc;
  }, {} as Record<string, number>);

  const costByPerson = Object.entries(costByPersonMap).map(([person, cost]) => ({
    person,
    cost: Math.round(cost * 100) / 100
  }));

  // Need vs Want distribution
  const needVsWant = [
    { name: 'Need', value: data.filter(t => t.category === 'Need').length, cost: data.filter(t => t.category === 'Need').reduce((sum, t) => sum + t.monthlyCost, 0) },
    { name: 'Want', value: data.filter(t => t.category === 'Want').length, cost: data.filter(t => t.category === 'Want').reduce((sum, t) => sum + t.monthlyCost, 0) }
  ];

  return {
    costByTool,
    costByPerson,
    needVsWant
  };
};