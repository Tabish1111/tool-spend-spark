import Papa from 'papaparse';
import { ToolData } from "@/data/dashboardData";

export interface ParseResult {
  data: ToolData[];
  errors: string[];
  warnings: string[];
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parseResult = processCSVData(results.data as any[]);
        resolve(parseResult);
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [`Error parsing CSV: ${error.message}`],
          warnings: []
        });
      }
    });
  });
}

function processCSVData(rawData: any[]): ParseResult {
  const data: ToolData[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rawData.forEach((row, index) => {
    try {
      // Try to map common column names
      const toolData = mapRowToToolData(row, index + 1);
      if (toolData) {
        data.push(toolData);
      }
    } catch (error) {
      errors.push(`Row ${index + 1}: ${error}`);
    }
  });

  return { data, errors, warnings };
}

function mapRowToToolData(row: any, rowNumber: number): ToolData | null {
  // Common field mappings - flexible to handle different column names
  const nameFields = ['name', 'tool name', 'tool_name', 'toolname', 'Name', 'Tool Name'];
  const costFields = ['monthly cost', 'monthlycost', 'monthly_cost', 'cost', 'price', 'Monthly Cost'];
  const accountFields = ['accounts', 'account', 'users', 'Accounts'];
  const personFields = ['person', 'assigned person', 'assignedperson', 'assigned_person', 'owner', 'Person', 'Assigned Person'];
  const categoryFields = ['category', 'type', 'Category'];
  const gunaFields = ['guna honesty meter', 'guna', 'honesty', 'rating', 'Guna Honesty Meter'];
  const renewalFields = ['renewal date', 'renewaldate', 'renewal_date', 'expiry', 'Renewal Date'];
  const notesFields = ['notes', 'description', 'comment', 'Notes'];

  // Find values using flexible field mapping
  const name = findValue(row, nameFields);
  const rawCost = findValue(row, costFields) || '0';
  // Remove currency symbols and commas before parsing
  const cleanCost = rawCost.replace(/[$,]/g, '');
  const monthlyCost = parseFloat(cleanCost);
  const accounts = parseInt(findValue(row, accountFields) || '1');
  const rawAssignedPerson = findValue(row, personFields) || 'Rudyculous';
  const assignedPerson = ['Rudyculous', 'Rudraksh', 'Both'].includes(rawAssignedPerson) 
    ? rawAssignedPerson as 'Rudyculous' | 'Rudraksh' | 'Both'
    : 'Rudyculous';
  const category = findValue(row, categoryFields) || 'Need';
  const gunaHonestyMeter = parseInt(findValue(row, gunaFields) || '5');
  const renewalDate = findValue(row, renewalFields) || new Date().toISOString().split('T')[0];
  const notes = findValue(row, notesFields) || '';

  if (!name || name.trim() === '') {
    throw new Error('Tool name is required');
  }

  if (isNaN(monthlyCost) || monthlyCost < 0) {
    throw new Error('Invalid monthly cost');
  }

  // Calculate yearly costs based on monthly cost
  const actualYearlyCost = monthlyCost * 12;

  return {
    id: `imported-${rowNumber}-${Date.now()}`,
    name: name.trim(),
    accounts,
    monthlyCost,
    yearlySchedule: 'monthly' as const,
    actualYearlyCost,
    assignedPerson,
    category: category === 'Want' ? 'Want' : 'Need',
    gunaHonestyMeter: Math.max(0, Math.min(10, gunaHonestyMeter)),
    renewalDate,
    notes: notes.trim(),
    isOverBudget: false // Will be calculated later
  };
}

function findValue(row: any, possibleKeys: string[]): string | null {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return String(row[key]).trim();
    }
    
    // Try case-insensitive matching
    const lowerKey = key.toLowerCase();
    const matchingKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null && row[matchingKey] !== '') {
      return String(row[matchingKey]).trim();
    }
  }
  return null;
}

export function validateToolData(data: ToolData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.length === 0) {
    errors.push('No valid data found in the file');
    return { isValid: false, errors };
  }

  data.forEach((tool, index) => {
    if (!tool.name || tool.name.trim() === '') {
      errors.push(`Row ${index + 1}: Tool name is required`);
    }
    
    if (tool.monthlyCost < 0) {
      errors.push(`Row ${index + 1}: Monthly cost cannot be negative`);
    }
    
    if (tool.accounts < 1) {
      errors.push(`Row ${index + 1}: Must have at least 1 account`);
    }
    
    if (tool.gunaHonestyMeter < 0 || tool.gunaHonestyMeter > 10) {
      errors.push(`Row ${index + 1}: Guna Honesty Meter must be between 0 and 10`);
    }
  });

  return { isValid: errors.length === 0, errors };
}