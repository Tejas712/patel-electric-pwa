import React, { useState, useEffect } from "react";
import type { FieldType } from "../data/field";
import { priceFields, wiredDetails } from "../data/field";
import { billHtml } from "../data/bill";
import { FaShare, FaDownload, FaPlus, FaTrash, FaRobot, FaTimes, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { sendMessage } from "../services/gemini";
import html2pdf from 'html2pdf.js';
import { v4 as uuidv4 } from 'uuid';

// Add Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: Record<string, unknown>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const initialCustomer = {
  name: "",
  phone: "",
  address: "",
};

interface EditPricingState {
  customer: typeof initialCustomer;
  wiresValues: FieldType[];
  priceValues: FieldType[];
  id: string;
  timestamp: number;
}

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
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseAnimation;
  document.head.appendChild(style);
}

const PricingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(initialCustomer);
  const [wiresValues, setWiresValues] = useState<FieldType[]>(wiredDetails);
  const [priceValues, setPriceValues] = useState<FieldType[]>(priceFields);
  const [editId, setEditId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiPreview, setAiPreview] = useState<FieldType[] | null>(null);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [newFieldType, setNewFieldType] = useState<'wire' | 'price' | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);

  // Helper to determine if a field is custom (not part of initial fields)
  const isCustomField = (id: number, isWireField: boolean) => {
    if (isWireField) return id > wiredDetails.length;
    return id > priceFields.length;
  };

  // Load editPricing if present
  useEffect(() => {
    const state = location.state as { editPricing?: EditPricingState } | null;
    if (state && state.editPricing) {
      const { customer, wiresValues, priceValues, id } = state.editPricing;
      setCustomer(customer);
      setWiresValues(wiresValues);
      setPriceValues(priceValues);
      setEditId(id);
    }
  }, [location.state]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'gu-IN'; // Gujarati language

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        setAiPrompt(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, []);

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePriceInputChange = (id: number, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ""));
    setPriceValues((prevState) => {
      const prevClone = [...prevState];
      prevClone[id - 1].value = numericValue;
      return prevClone;
    });
  };

  const handleWireInputChange = (id: number, value: string) => {
    setWiresValues((prevState) => {
      const prevClone = [...prevState];
      prevClone[id - 1].value = value;
      return prevClone;
    });
  };

  const handleDeleteField = (field: FieldType, type: 'wire' | 'price') => {
    if (type === 'wire') {
      setWiresValues(wiresValues.filter((w) => w.id !== field.id));
    } else {
      setPriceValues(priceValues.filter((p) => p.id !== field.id));
    }
  };

  const handleAiFill = async () => {
    if (!aiPrompt.trim()) return;
    
    // Stop microphone if active
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
    
    setIsAiLoading(true);
    try {
      const response = await sendMessage(priceValues, aiPrompt);
      
      if (response.fields) {
        setAiPreview(response.fields);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestions = () => {
    if (!aiPreview) return;

    const updatedPriceFields = priceValues.map(field => {
      const aiField = aiPreview.find(f => f.label === field.label);
      if (aiField) {
        return {
          ...field,
          value: aiField.value || 0
        };
      }
      return field;
    });
    setPriceValues(updatedPriceFields);
    setShowAiDialog(false);
    setAiPrompt("");
    setAiPreview(null);
  };

  const handleDownloadPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = billHtml({
      priceFields: priceValues,
      wireFields: wiresValues,
    });

    const opt = {
      margin: 1,
      filename: `patel-electric-${customer.name || 'invoice'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleShare = async () => {
    try {
      const element = document.createElement('div');
      element.innerHTML = billHtml({
        priceFields: priceValues,
        wireFields: wiresValues,
      });

      const opt = {
        margin: 1,
        filename: `patel-electric-${customer.name || 'invoice'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      // Generate PDF blob
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      
      // Create a File object from the blob
      const file = new File([pdfBlob], `patel-electric-${customer.name || 'invoice'}.pdf`, {
        type: 'application/pdf'
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Patel Electric Invoice',
          text: `Invoice for ${customer.name || 'Customer'}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      alert('Failed to share PDF. Please try downloading instead.');
    }
  };

  // Save or update pricing to localStorage
  const handleSaveOrUpdate = () => {
    const pricingList: EditPricingState[] = JSON.parse(localStorage.getItem("pricingList") || "[]");
    if (editId) {
      // Update existing
      const idx = pricingList.findIndex((p) => p.id === editId);
      if (idx !== -1) {
        pricingList[idx] = {
          ...pricingList[idx],
          customer,
          wiresValues,
          priceValues,
          timestamp: Date.now(),
        };
        localStorage.setItem("pricingList", JSON.stringify(pricingList));
        alert("Pricing updated!");
        navigate("/list");
        return;
      }
    }
    // Add new
    const newEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      customer,
      wiresValues,
      priceValues,
    };
    pricingList.push(newEntry);
    localStorage.setItem("pricingList", JSON.stringify(pricingList));
    alert("Pricing saved!");
    navigate("/list");
  };

  const handleAddField = () => {
    if (!newFieldType || !newFieldLabel.trim()) return;

    const newField: FieldType = {
      id: newFieldType === 'wire' ? wiresValues.length + 1 : priceValues.length + 1,
      label: newFieldLabel,
      value: newFieldType === 'wire' ? newFieldValue : Number(newFieldValue) || 0,
    };

    if (newFieldType === 'wire') {
      setWiresValues([...wiresValues, newField]);
    } else {
      setPriceValues([...priceValues, newField]);
    }

    // Reset dialog state
    setShowAddFieldDialog(false);
    setNewFieldType(null);
    setNewFieldLabel('');
    setNewFieldValue('');
  };

  const toggleListening = () => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      speechRecognition.stop();
    } else {
      // Clear previous input when starting new recording
      setAiPrompt("");
      speechRecognition.start();
    }
    setIsListening(!isListening);
  };

  const resetAiDialog = () => {
    // Stop microphone if active
    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
    
    setShowAiDialog(false);
    setAiPrompt("");
    setAiPreview(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-1 md:py-8 md:px-2 overflow-auto pb-24">
      {/* Add Field Dialog */}
      {showAddFieldDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New Field</h3>
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
                      onClick={() => setNewFieldType('wire')}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newFieldType === 'wire'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Wire Field
                    </button>
                    <button
                      onClick={() => setNewFieldType('price')}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        newFieldType === 'price'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                    type={newFieldType === 'price' ? 'number' : 'text'}
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder={newFieldType === 'price' ? 'Enter number' : 'Enter text'}
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
                <h3 className="text-xl font-bold text-gray-900">AI Price Suggestions</h3>
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
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    style={isListening ? {
                      animation: 'pulse 1.5s infinite, ripple 2s infinite'
                    } : undefined}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <div className="relative">
                      {isListening ? <FaMicrophoneSlash size={16} /> : <FaMicrophone size={16} />}
                      {isListening && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                </div>
                {isListening && (
                  <div className="mt-2 text-sm text-red-500 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-wave" style={{ animation: 'wave 1s infinite' }} />
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-wave" style={{ animation: 'wave 1s infinite 0.2s' }} />
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-wave" style={{ animation: 'wave 1s infinite 0.4s' }} />
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
                <FaRobot className={isAiLoading ? 'animate-spin' : ''} />
                {isAiLoading ? 'Generating...' : 'Generate Suggestions'}
              </button>

              {aiPreview && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Generated Suggestions</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {aiPreview.map((field) => (
                      <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-700">{field.label}</div>
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
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">Customer Details</h2>
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
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight drop-shadow-lg">વાયર ડીટેલ્સ</h2>
            <button
              onClick={() => setShowAiDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow text-sm transition"
            >
              <FaRobot />
              AI Fill
            </button>
          </div>
          <div className="space-y-3">
            {wiresValues.map((field) => (
              <div key={field.id} className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1">
                <label className="font-semibold text-gray-700 text-sm mb-1">{field.label}</label>
                <div className="flex w-full items-center">
                  <input
                    type="text"
                    className="w-full rounded-lg px-4 py-2 bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                    onChange={(e) => handleWireInputChange(field.id, e.target.value)}
                    value={String(wiresValues[field.id - 1].value)}
                  />
                  {field.unit && <span className="text-xs text-gray-500 ml-2">{field.unit}</span>}
                </div>
                {isCustomField(field.id, true) && (
                  <button className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1" title="Remove" onClick={() => handleDeleteField(field, 'wire')}><FaTrash size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setNewFieldType('wire');
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5 text-center tracking-tight drop-shadow-lg">પ્રાઇસ ફીલ્ડ્સ</h2>
          <div className="space-y-3">
            {priceValues.map((field) => (
              <div key={field.id} className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1">
                <label className="font-semibold text-gray-700 text-sm mb-1">{field.label}</label>
                <input
                  type="number"
                  className="w-full rounded-lg px-4 py-2 bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
                  onChange={(e) => handlePriceInputChange(field.id, e.target.value)}
                  value={String(priceValues[field.id - 1].value)}
                />
                {isCustomField(field.id, false) && (
                  <button className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1" title="Remove" onClick={() => handleDeleteField(field, 'price')}><FaTrash size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setNewFieldType('price');
              setShowAddFieldDialog(true);
            }}
            className="flex mt-3 items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition"
          >
            <FaPlus size={14} />
            <span>ફીલ્ડ ઉમેરો</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
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
              editId ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg font-medium shadow text-sm transition`}
          >
            {editId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
