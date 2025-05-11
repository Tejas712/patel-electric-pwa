import React from "react";

interface DialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-lg">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full mx-2 p-6 animate-fade-in">
        {title && <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>}
        <div className="text-gray-700 mb-6 whitespace-pre-line">{message}</div>
        <div className="flex justify-end gap-3">
          {showCancel && (
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.18s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default Dialog; 