import React, { useState, useEffect } from "react";
import type { FieldType } from "../data/field";
import { priceFields, wiredDetails } from "../data/field";
import { billHtml } from "../data/bill";
import { FaShare, FaDownload, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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

const PricingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState(initialCustomer);
  const [wiresValues, setWiresValues] = useState<FieldType[]>(wiredDetails);
  const [priceValues, setPriceValues] = useState<FieldType[]>(priceFields);
  const [editId, setEditId] = useState<string | null>(null);

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

  const addNewWireField = () => {
    const newField: FieldType = {
      id: wiresValues.length + 1,
      label: "નવું ફીલ્ડ",
      value: "",
    };
    setWiresValues([...wiresValues, newField]);
  };

  const addNewPriceField = () => {
    const newField: FieldType = {
      id: priceValues.length + 1,
      label: "નવું ફીલ્ડ",
      value: 0,
    };
    setPriceValues([...priceValues, newField]);
  };

  const removeField = (id: number, isWireField: boolean) => {
    if (isWireField) {
      setWiresValues((prevState) =>
        prevState.filter((field) => field.id !== id)
      );
    } else {
      setPriceValues((prevState) =>
        prevState.filter((field) => field.id !== id)
      );
    }
  };

  const generatePDFContent = () => {
    const htmlContent = billHtml({
      priceFields: priceValues,
      wireFields: wiresValues,
    });
    return new Blob([htmlContent], { type: "text/html" });
  };

  const downloadPDF = async () => {
    try {
      const blob = generatePDFContent();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "patel-electric-bill.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const sharePDF = async () => {
    try {
      const blob = generatePDFContent();
      const file = new File([blob], "patel-electric-bill.html", {
        type: "text/html",
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Patel Electric Bill",
          text: "Check out this bill from Patel Electric",
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Helper to determine if a field is custom (not part of initial fields)
  const isCustomField = (id: number, isWireField: boolean) => {
    if (isWireField) return id > wiredDetails.length;
    return id > priceFields.length;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-1 md:py-8 md:px-2 overflow-auto pb-24">
      <div className="w-full max-w-3xl bg-white/50 backdrop-blur-lg border border-white/30 rounded-2xl md:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-8 md:py-12">
        {/* Customer Details */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center tracking-tight drop-shadow-lg">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={customer.name}
              onChange={handleCustomerChange}
              className="rounded-lg px-5 py-3 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm transition"
            />
            <input
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
            />
          </div>
        </div>

        {/* Wire Details */}
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-5 text-center tracking-tight drop-shadow-lg">વાયર ડીટેલ્સ</h2>
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
                  <button className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1" title="Remove" onClick={() => removeField(field.id, true)}>
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition" onClick={addNewWireField}>
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
                  <button className="ml-2 bg-red-500 hover:bg-red-700 text-white rounded-lg p-2 transition self-end mt-1" title="Remove" onClick={() => removeField(field.id, false)}>
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition" onClick={addNewPriceField}>
            <FaPlus size={14} />
            <span>ફીલ્ડ ઉમેરો</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-3 mt-8 w-full">
          <button className="flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow text-sm transition w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-yellow-400" onClick={downloadPDF} aria-label="Download">
            <FaDownload size={16} className="md:size-5" />
            <span>Download</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg font-medium shadow text-sm transition w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-yellow-400" onClick={sharePDF} aria-label="Share">
            <FaShare size={16} className="md:size-5" />
            <span>Share</span>
          </button>
          <button className={`flex items-center justify-center gap-2 px-3 py-1.5 md:px-4 md:py-2 ${editId ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg font-medium shadow text-sm transition w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400`} onClick={handleSaveOrUpdate} aria-label={editId ? 'Update' : 'Save'}>
            <span>{editId ? 'Update' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingForm;
