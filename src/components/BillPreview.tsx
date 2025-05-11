import React from "react";
import { billHtml } from "../data/bill";
import type { FieldType } from "../data/field";

interface BillPreviewProps {
  priceFields: FieldType[];
  wireFields: FieldType[];
}

const BillPreview: React.FC<BillPreviewProps> = ({ priceFields, wireFields }) => {
  const html = billHtml({ priceFields, wireFields });
  return (
    <div className="w-full h-[70vh] bg-white rounded-xl shadow-inner overflow-auto border border-gray-200">
      <div
        style={{ minWidth: 320 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default BillPreview; 