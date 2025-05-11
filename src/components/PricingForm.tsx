import React, { useState } from "react";
import { priceFields, wiredDetails } from "../data/field";
import {
  FaShare,
  FaDownload,
  FaPlus,
  FaTrash,
  FaRobot,
  FaTimes,
  FaMicrophone,
  FaMicrophoneSlash,
  FaChevronUp,
  FaFile,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { usePricingList, type PricingEntry } from "../hooks/usePricingList";
import { usePdfGenerator } from "../hooks/usePdfGenerator";
import { useAiSuggestions } from "../hooks/useAiSuggestions";

// Add animation keyframes
const pulseAnimation = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes wave {
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

@keyframes ripple {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}
`;

// Add animation to document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const PricingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [newFieldType, setNewFieldType] = useState<"wire" | "price" | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isFabExpanded, setIsFabExpanded] = useState(false);

  // Get edit state from location
  const editState = location.state as { editPricing?: PricingEntry } | null;

  // Initialize pricing list hook
  const {
    customer,
    wiresValues,
    priceValues,
    handleCustomerChange,
    handlePriceInputChange,
    handleWireInputChange,
    handleDeleteField,
    handleAddField: addField,
    saveOrUpdatePricing,
  } = usePricingList({
    editId: editState?.editPricing?.id || null,
    initialCustomer: editState?.editPricing?.customer,
    initialWiresValues: editState?.editPricing?.wiresValues || wiredDetails,
    initialPriceValues: editState?.editPricing?.priceValues || priceFields,
  });

  // Initialize PDF generator
  const { generatePdf } = usePdfGenerator({
    customerName: customer.name,
    priceFields: priceValues,
    wireFields: wiresValues,
  });

  // Initialize AI suggestions
  const {
    isLoading: isAiLoading,
    suggestions: aiPreview,
    generateSuggestions,
    clearSuggestions,
  } = useAiSuggestions({ priceFields: priceValues });

  // Initialize speech recognition
  const {
    isListening,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    onTranscriptChange: setAiPrompt,
  });

  // Helper to determine if a field is custom
  const isCustomField = (id: number, isWireField: boolean) => {
    if (isWireField) return id > wiredDetails.length;
    return id > priceFields.length;
  };

  const handleAiFill = async () => {
    if (!aiPrompt.trim()) return;
    stopListening();
    await generateSuggestions(aiPrompt);
  };

  const applyAiSuggestions = () => {
    if (!aiPreview) return;
    const updatedPriceFields = priceValues.map((field) => {
      const aiField = aiPreview.find((f) => f.label === field.label);
      if (aiField) {
        return {
          ...field,
          value: aiField.value || 0,
        };
      }
      return field;
    });
    priceValues.splice(0, priceValues.length, ...updatedPriceFields);
    setShowAiDialog(false);
    setAiPrompt("");
    clearSuggestions();
  };

  const handleDownloadPDF = async () => {
    const result = await generatePdf('download');
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleShare = async () => {
    const result = await generatePdf('share');
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleSaveOrUpdate = () => {
    const result = saveOrUpdatePricing();
    if (result.success) {
      alert(result.message);
      navigate("/list");
    }
  };

  const handleAddField = () => {
    if (!newFieldType || !newFieldLabel.trim()) return;
    addField(newFieldType, newFieldLabel, newFieldValue);
    setShowAddFieldDialog(false);
    setNewFieldType(null);
    setNewFieldLabel("");
    setNewFieldValue("");
  };

  const resetAiDialog = () => {
    stopListening();
    setShowAiDialog(false);
    setAiPrompt("");
    clearSuggestions();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-1 md:py-8 md:px-2 overflow-auto pb-24">
      {/* Floating Action Buttons - Mobile Only */}
      <div className="fixed bottom-24 right-4 z-40 md:hidden">
        {/* Main FAB */}
        <button
          onClick={() => setIsFabExpanded(!isFabExpanded)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg p-4 transition transform hover:scale-110 active:scale-95"
          title="Actions"
        >
          <FaChevronUp
            size={20}
            className={`transition-transform duration-300 ${
              isFabExpanded ? "rotate-45" : ""
            }`}
          />
        </button>

        {/* Action Buttons */}
        <div
          className={`absolute bottom-16 right-0 flex flex-col gap-2 transition-all duration-300 ${
            isFabExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={() => {
              setShowAiDialog(true);
              setIsFabExpanded(false);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg p-3 transition transform hover:scale-110 active:scale-95"
            title="AI Fill"
          >
            <FaRobot size={18} />
          </button>
          <button
            onClick={() => {
              handleDownloadPDF();
              setIsFabExpanded(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-3 transition transform hover:scale-110 active:scale-95"
            title="Download PDF"
          >
            <FaDownload size={18} />
          </button>
          <button
            onClick={() => {
              handleShare();
              setIsFabExpanded(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-3 transition transform hover:scale-110 active:scale-95"
            title="Share PDF"
          >
            <FaShare size={18} />
          </button>
          <button
            onClick={() => {
              handleSaveOrUpdate();
              setIsFabExpanded(false);
            }}
            className={`${
              editState?.editPricing?.id
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-full shadow-lg p-3 transition transform hover:scale-110 active:scale-95`}
            title={editState?.editPricing?.id ? "Update" : "Save"}
          >
            <FaFile size={18} />
          </button>
        </div>
      </div>

      {/* Add Field Dialog */}
      {showAddFieldDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Field
                </h3>
                <button
                  onClick={() => setShowAddFieldDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Type
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setNewFieldType("wire")}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newFieldType === "wire"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Wire Field
                    </button>
                    <button
                      onClick={() => setNewFieldType("price")}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newFieldType === "price"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Price Field
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Enter field label"
                    className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Value
                  </label>
                  <input
                    type={newFieldType === "price" ? "number" : "text"}
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder={
                      newFieldType === "price" ? "Enter number" : "Enter text"
                    }
                    className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition"
                  />
                </div>

                <button
                  onClick={handleAddField}
                  disabled={!newFieldType || !newFieldLabel.trim()}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow text-sm transition disabled:opacity-50"
                >
                  Add Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Dialog */}
      {showAiDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  AI Price Suggestions
                </h3>
                <button
                  onClick={resetAiDialog}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Fields
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                  {priceValues.map((field) => (
                    <div key={field.id} className="text-sm text-gray-600">
                      • {field.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your requirements
                </label>
                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Example:આ દરજીખાતા મુજબ વિવિધ ઈલેક્ટ્રિકલ કામોની ચાર્જવિહી આપવામાં આવી છે. લાઈટિંગ પોઈન્ટ માટે ભાવ રૂ. 10 છે. મેઈન અને એ.સી. લાઈન (1.5mm) માટે રૂ. 20 નો ખર્ચ આવે છે, જયારે તેનું જ 2.5mm વેરિયન્ટ માટે ભાવ રૂ. 30 છે. ઉપરાંત, પેનલ લાઈટ તથા ફેસી લાઈટ ફિટિંગ ચાર્જ માટે રૂ. 40 નક્કી કરવામાં આવ્યા છે. આ ભાવો વિવિધ ઇલેક્ટ્રિકલ ફિટિંગ્સ અને લાઈટિંગ પોઈન્ટ્સના આધારે ગ્રાહકોને સરળતાથી અંદાજ આપવામાં માટે દર્શાવવામાં આવ્યા છે."
                    className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm transition min-h-[100px] pr-12"
                  />
                  <button
                    onClick={toggleListening}
                    className={`absolute right-3 top-3 p-2 rounded-full transition ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    style={
                      isListening
                        ? {
                            animation:
                              "pulse 1.5s infinite, ripple 2s infinite",
                          }
                        : undefined
                    }
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <div className="relative">
                      {isListening ? (
                        <FaMicrophoneSlash size={16} />
                      ) : (
                        <FaMicrophone size={16} />
                      )}
                      {isListening && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                </div>
                {isListening && (
                  <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span
                        className="w-1 h-3 bg-red-500 rounded-full animate-wave"
                        style={{ animation: "wave 1s infinite" }}
                      />
                      <span
                        className="w-1 h-3 bg-red-500 rounded-full animate-wave"
                        style={{ animation: "wave 1s infinite 0.2s" }}
                      />
                      <span
                        className="w-1 h-3 bg-red-500 rounded-full animate-wave"
                        style={{ animation: "wave 1s infinite 0.4s" }}
                      />
                    </div>
                    Listening...
                  </div>
                )}
              </div>

              <button
                onClick={handleAiFill}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow text-sm transition disabled:opacity-50 mb-4"
              >
                <FaRobot className={isAiLoading ? "animate-spin" : ""} />
                {isAiLoading ? "Generating..." : "Generate Suggestions"}
              </button>

              {aiPreview && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Generated Suggestions
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {aiPreview.map((field) => (
                      <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-700">
                          {field.label}
                        </div>
                        <div className="text-gray-600">
                          {field.value} {field.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={applyAiSuggestions}
                    className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow text-sm transition"
                  >
                    Apply Suggestions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white/50 backdrop-blur-lg border border-white/30 rounded-2xl md:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-8 md:py-12">
        {/* Customer Details */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 justify-center">
            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={customer.name}
              onChange={handleCustomerChange}
              className="rounded-lg px-5 py-3 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
            />
            {/* <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={handleCustomerChange}
              className="rounded-lg px-5 py-3 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleCustomerChange}
              className="rounded-lg px-5 py-3 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
            /> */}
          </div>
        </div>

        {/* Wire Details */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">
              વાયર ડીટેલ્સ
            </h2>
            <button
              onClick={() => setShowAiDialog(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow text-sm transition"
            >
              <FaRobot />
              AI Fill
            </button>
          </div>
          <div className="space-y-3">
            {wiresValues.map((field) => (
              <div
                key={field.id}
                className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1"
              >
                <label className="font-semibold text-gray-700 text-sm mb-1">
                  {field.label}
                </label>
                <div className="flex w-full items-center">
                  <input
                    type="text"
                    className="w-full rounded-lg px-4 py-2 bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                    onChange={(e) =>
                      handleWireInputChange(field.id, e.target.value)
                    }
                    value={String(wiresValues[field.id - 1].value)}
                  />
                  {field.unit && (
                    <span className="text-xs text-gray-500 ml-2">
                      {field.unit}
                    </span>
                  )}
                </div>
                {isCustomField(field.id, true) && (
                  <button
                    className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1"
                    title="Remove"
                    onClick={() => handleDeleteField(field, "wire")}
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setNewFieldType("wire");
              setShowAddFieldDialog(true);
            }}
            className=" mt-3 flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaPlus size={14} />
            <span>ફીલ્ડ ઉમેરો</span>
          </button>
        </div>

        {/* Price Fields */}
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5 text-center tracking-tight drop-shadow-lg">
            પ્રાઇસ ફીલ્ડ્સ
          </h2>
          <div className="space-y-3">
            {priceValues.map((field) => (
              <div
                key={field.id}
                className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1"
              >
                <label className="font-semibold text-gray-700 text-sm mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg px-4 py-2 bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                  onChange={(e) =>
                    handlePriceInputChange(field.id, e.target.value)
                  }
                  value={String(priceValues[field.id - 1].value)}
                />
                {isCustomField(field.id, false) && (
                  <button
                    className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1"
                    title="Remove"
                    onClick={() => handleDeleteField(field, "price")}
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setNewFieldType("price");
              setShowAddFieldDialog(true);
            }}
            className="flex mt-3 items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaPlus size={14} />
            <span>ફીલ્ડ ઉમેરો</span>
          </button>
        </div>

        {/* Action Buttons - Desktop Only */}
        <div className="hidden md:flex justify-end gap-4 mt-8">
          <button
            onClick={() => setShowAiDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaRobot />
            AI Fill
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaDownload />
            Download PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaShare />
            Share PDF
          </button>
          <button
            onClick={handleSaveOrUpdate}
            className={`flex items-center gap-2 px-4 py-2 ${
              editState?.editPricing?.id
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-lg font-medium shadow text-sm transition`}
          >
            {editState?.editPricing?.id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
