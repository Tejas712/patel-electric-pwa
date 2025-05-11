import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShare, FaEdit, FaTrash, FaCopy, FaPlus } from "react-icons/fa";
import type { FieldType } from "../data/field";
import { v4 as uuidv4 } from "uuid";

interface Customer {
  name: string;
  phone: string;
  address: string;
}

interface PricingEntry {
  id: string;
  timestamp: number;
  customer: Customer;
  wiresValues: FieldType[];
  priceValues: FieldType[];
}

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toLocaleString();
};

const PricingList = () => {
  const [pricing, setPricing] = useState<PricingEntry[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const list: PricingEntry[] = JSON.parse(
      localStorage.getItem("pricingList") || "[]"
    );
    setPricing(list.reverse());
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pricing?"))
      return;
    const newList = pricing.filter((p) => p.id !== id);
    setPricing(newList);
    localStorage.setItem("pricingList", JSON.stringify([...newList].reverse()));
  };

  const handleEdit = (pricing: PricingEntry) => {
    navigate("/", { state: { editPricing: pricing } });
  };

  const handleShare = (pricing: PricingEntry) => {
    // Use the same billHtml logic as PricingForm
    import("../data/bill").then(({ billHtml }) => {
      const blob = new Blob(
        [
          billHtml({
            priceFields: pricing.priceValues,
            wireFields: pricing.wiresValues,
          }),
        ],
        { type: "text/html" }
      );
      const file = new File([blob], "patel-electric-bill.html", {
        type: "text/html",
      });
      if (navigator.share) {
        navigator.share({
          files: [file],
          title: "Patel Electric Bill",
          text: "Check out this bill from Patel Electric",
        });
      } else {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    });
  };

  const handleCopy = (data: PricingEntry) => {
    const pricingList: PricingEntry[] = JSON.parse(
      localStorage.getItem("pricingList") || "[]"
    );
    const newEntry: PricingEntry = {
      ...data,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    pricingList.push(newEntry);
    localStorage.setItem("pricingList", JSON.stringify(pricingList));
    setPricing([newEntry, ...pricing]);
    alert("Pricing copied!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-1 md:py-8 md:px-2 overflow-auto">
      <div className="w-full max-w-3xl bg-white/90 rounded-2xl md:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-8 md:py-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 sm:mb-8 tracking-tight drop-shadow text-center">
          Saved Pricing Lists
        </h2>
        {pricing.length === 0 ? (
          <p className="text-gray-600 text-center">
            No saved pricing lists yet.
          </p>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {pricing.map((pricing) => (
              <div
                key={pricing.id}
                className="flex flex-col md:flex-row md:items-center justify-between bg-gray-100 rounded-xl shadow p-3 sm:p-4 gap-2"
              >
                <div className="flex-1">
                  <div className="font-bold text-base sm:text-lg text-gray-800">
                    {pricing.customer?.name || "(No Name)"}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {formatDate(pricing.timestamp)}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 md:mt-0 w-full md:w-auto">
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => handleEdit(pricing)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg font-semibold shadow transition text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => handleShare(pricing)}
                  >
                    <FaShare /> Share
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => handleCopy(pricing)}
                  >
                    <FaCopy /> Copy
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow transition text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => handleDelete(pricing.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for mobile */}
      {location.pathname === "/list" && (
        <button
          className="fixed bottom-16 right-4 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 md:hidden flex items-center justify-center transition"
          onClick={() => navigate("/")}
          title="Add New Pricing"
        >
          <FaPlus size={24} />
        </button>
      )}
    </div>
  );
};

export default PricingList;
