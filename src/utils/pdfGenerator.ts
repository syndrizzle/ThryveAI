import jsPDF from 'jspdf';

interface GeneratePDFProps {
  userName: string;
  userEmail: string;
  healthReport: {
    detected_disease: string;
    diet_plan: string;
    preventive_measures: string;
  } | null;
  callAnalysis: {
    call_summary: string;
    user_sentiment: string;
  } | null;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error('Error loading image:', e);
      reject(e);
    };

    // For profile pictures from Supabase storage
    if (url.includes('supabase')) {
      img.src = url;
    } 
    // For local assets
    else if (!url.startsWith('http')) {
      img.src = `${window.location.origin}${url}`;
    }
    // For other URLs
    else {
      img.src = url;
    }
  });
};

export const generatePDF = async ({
  userName,
  userEmail,
  healthReport,
  callAnalysis
}: GeneratePDFProps) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Set dark theme colors
  doc.setFillColor(18, 18, 18);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(255, 255, 255);

  try {
    // Add ThryveAI Logo and Text
    const logoImg = await loadImage('/logo.png');
    const logoSize = 15;
    doc.addImage(
      logoImg,
      'PNG',
      pageWidth - margin - logoSize - 40,
      margin,
      logoSize,
      logoSize,
      'logo',
      'FAST'
    );

    // Add ThryveAI text and tagline
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("ThryveAI", pageWidth - margin - 35, margin + 10);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text("Your AI Health Companion", pageWidth - margin - 35, margin + 18);

    // Add user info
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(userName, margin, margin + 10);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(userEmail, margin, margin + 20);

    // Add separator line
    doc.setDrawColor(50, 50, 50);
    doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

    // Content sections
    let yPos = margin + 50;
    const contentMargin = margin + 5;

    // Helper function for sections
    const addSection = (title: string, content: string) => {
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setTextColor(200, 200, 200);
      doc.setFont("helvetica", "normal");
      
      const lines = doc.splitTextToSize(content, pageWidth - (2 * contentMargin));
      doc.text(lines, contentMargin, yPos);
      yPos += (lines.length * 7) + 15;
    };

    // Add sections
    if (healthReport?.detected_disease) {
      addSection("Detected Conditions", healthReport.detected_disease);
    }
    
    if (callAnalysis?.user_sentiment) {
      addSection("Overall Sentiment", callAnalysis.user_sentiment);
    }
    
    if (healthReport?.preventive_measures) {
      addSection("Preventive Measures", healthReport.preventive_measures);
    }
    
    if (healthReport?.diet_plan) {
      addSection("Diet Plan", healthReport.diet_plan);
    }
    
    if (callAnalysis?.call_summary) {
      addSection("Conversation Summary", callAnalysis.call_summary);
    }

    // Add disclaimer at bottom
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "DISCLAIMER: This is an AI-generated health assessment and should not be considered as professional medical advice. Please consult with qualified healthcare professionals for medical diagnosis and treatment decisions.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - (2 * margin));
    doc.text(disclaimerLines, margin, pageHeight - margin - (disclaimerLines.length * 5));

    // Save the PDF
    doc.save(`ThryveAI-Assessment-${userName.replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Continue with PDF generation without images
  }
};
