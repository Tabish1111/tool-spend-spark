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

export function processCSVData(rawData: any[]): ParseResult {
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
  const nameFields = ['tool name', 'name', 'tool_name', 'toolname', 'Tool Name', 'Name'];
  const costFields = ['monthly cost', 'monthlycost', 'monthly_cost', 'cost', 'price', 'Monthly Cost'];
  const accountFields = ['accounts', 'account', 'users', 'Accounts'];
  const personFields = ['person', 'assigned person', 'assignedperson', 'assigned_person', 'owner', 'Person'];
  const renewalFields = ['renewal date', 'renewaldate', 'renewal_date', 'expiry', 'Renewal Date'];
  const notesFields = ['notes', 'description', 'comment', 'Notes'];

  // Find values using flexible field mapping
  const name = findValue(row, nameFields);
  const rawCost = findValue(row, costFields) || '0';
  // Remove currency symbols and commas before parsing
  const cleanCost = rawCost.replace(/[$,₹]/g, '');
  const monthlyCost = parseFloat(cleanCost);
  const accounts = parseInt(findValue(row, accountFields) || '1');
  const assignedPerson = findValue(row, personFields) || 'Unknown';
  const renewalDate = findValue(row, renewalFields);
  const notes = findValue(row, notesFields) || '';

  if (!name || name.trim() === '') {
    throw new Error('Tool name is required');
  }

  if (isNaN(monthlyCost) || monthlyCost < 0) {
    throw new Error('Invalid monthly cost');
  }

  return {
    id: `imported-${rowNumber}-${Date.now()}`,
    name: name.trim(),
    accounts,
    monthlyCost,
    assignedPerson: assignedPerson.trim(),
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
  });

  return { isValid: errors.length === 0, errors };
}