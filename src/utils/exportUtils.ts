import { ToolData } from "@/data/dashboardData";

export function downloadCSV(data: ToolData[], filename: string = "tool-data") {
  const headers = [
    "Tool Name",
    "Accounts", 
    "Monthly Cost",
    "Yearly Cost",
    "Assigned Person",
    "Category",
    "Guna Honesty Meter",
    "Renewal Date",
    "Notes"
  ];

  const csvContent = [
    headers.join(","),
    ...data.map(tool => [
      `"${tool.name}"`,
      tool.accounts,
      tool.monthlyCost,
      tool.monthlyCost * 12,
      `"${tool.assignedPerson}"`,
      `"${tool.category}"`,
      tool.gunaHonestyMeter,
      `"${tool.renewalDate}"`,
      `"${tool.notes}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(data: ToolData[], filename: string = "tool-data") {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}