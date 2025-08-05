import { ToolData } from "@/data/dashboardData";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export async function downloadPDF(filename: string = "dashboard-report") {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tool Cost Dashboard Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Date
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    // Capture each chart section
    const sections = [
      { id: 'kpi-cards', title: 'Key Performance Indicators' },
      { id: 'budget-alerts', title: 'Budget Alerts' },
      { id: 'cost-by-tool-chart', title: 'Monthly Cost by Tool' },
      { id: 'cost-by-person-chart', title: 'Cost Distribution by Person' },
      { id: 'need-vs-want-chart', title: 'Need vs Want Analysis' },
      { id: 'guna-honesty-trend', title: 'Guna Honesty Meter Trend' },
      { id: 'tools-table', title: 'Detailed Tools Analysis' }
    ];

    for (const section of sections) {
      const element = document.querySelector(`[data-export-id="${section.id}"]`);
      if (element) {
        // Add section title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        
        // Check if we need a new page
        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.text(section.title, 20, currentY);
        currentY += 10;

        try {
          const canvas = await html2canvas(element as HTMLElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image fits on current page
          if (currentY + imgHeight > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }

          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 20;
        } catch (error) {
          console.warn(`Failed to capture ${section.title}:`, error);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'italic');
          pdf.text('(Chart could not be captured)', 20, currentY);
          currentY += 15;
        }
      }
    }

    // Save the PDF
    pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}