// Data structure for Tool Cost Dashboard - PRD Compliant
export interface ToolData {
  id: string;
  name: string; // Tool Name (required)
  monthlyCost: number; // Monthly Cost (required)
  accounts: number; // Accounts (required)  
  assignedPerson: string; // Person (required)
  renewalDate: string | null; // Renewal Date (optional)
  notes?: string; // Additional notes (optional)
  isOverBudget?: boolean; // Calculated field
}

// NO SAMPLE DATA - PRD requires clean "no data" state

// Calculate KPIs - PRD Compliant (only 2 required KPIs)
export const calculateKPIs = (data: ToolData[]) => {
  const totalMonthly = data.reduce((sum, tool) => sum + tool.monthlyCost, 0);
  const totalYearly = totalMonthly * 12; // Simple yearly calculation
  const overBudgetCount = data.filter(tool => tool.isOverBudget).length;

  return {
    totalMonthly,
    totalYearly,
    overBudgetCount,
    totalTools: data.length
  };
};

// Group data for charts - PRD Compliant (only 2 required charts)
export const getChartData = (data: ToolData[]) => {
  // Chart 1: Monthly Cost by Tool (Bar Chart)
  const costByTool = data
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .map(tool => ({
      name: tool.name,
      cost: tool.monthlyCost
    }));

  // Chart 2: Cost Distribution by Person (Bar Chart)
  const costByPersonMap = data.reduce((acc, tool) => {
    const person = tool.assignedPerson;
    acc[person] = (acc[person] || 0) + tool.monthlyCost;
    return acc;
  }, {} as Record<string, number>);

  const costByPerson = Object.entries(costByPersonMap).map(([person, cost]) => ({
    person,
    cost: Math.round(cost * 100) / 100
  }));

  return {
    costByTool,
    costByPerson
  };
};