import html2pdf from 'html2pdf.js';
import type { FieldType } from '../data/field';
import { billHtml } from '../data/bill';

interface UsePdfGeneratorProps {
  customerName: string;
  priceFields: FieldType[];
  wireFields: FieldType[];
}

export const usePdfGenerator = ({
  customerName,
  priceFields,
  wireFields,
}: UsePdfGeneratorProps) => {
  const generatePdf = async (action: 'download' | 'share' = 'download') => {
    const element = document.createElement("div");
    element.innerHTML = billHtml({
      priceFields,
      wireFields,
    });

    const opt = {
      margin: 1,
      filename: `patel-electric-${customerName || "invoice"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    try {
      if (action === 'share') {
        // Generate PDF blob for sharing
        const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

        // Create a File object from the blob
        const file = new File(
          [pdfBlob],
          `patel-electric-${customerName || "invoice"}.pdf`,
          {
            type: "application/pdf",
          }
        );

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: "Patel Electric Invoice",
            text: `Invoice for ${customerName || "Customer"}`,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          const url = URL.createObjectURL(pdfBlob);
          window.open(url, "_blank");
        }
      } else {
        // Download PDF
        await html2pdf().set(opt).from(element).save();
      }
      return { success: true };
    } catch (error) {
      console.error("Error generating PDF:", error);
      return { 
        success: false, 
        error: "Failed to generate PDF. Please try again." 
      };
    }
  };

  return {
    generatePdf,
  };
}; 