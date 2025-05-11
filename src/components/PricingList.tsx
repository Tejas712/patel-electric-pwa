import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShare, FaEdit, FaTrash, FaCopy, FaPlus, FaEllipsisV } from "react-icons/fa";
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const list: PricingEntry[] = JSON.parse(
      localStorage.getItem("pricingList") || "[]"
    );
    setPricing(list.reverse());
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu') && !target.closest('.menu-trigger')) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pricing?"))
      return;
    const newList = pricing.filter((p) => p.id !== id);
    setPricing(newList);
    localStorage.setItem("pricingList", JSON.stringify([...newList].reverse()));
    setActiveMenuId(null);
  };

  const handleEdit = (pricing: PricingEntry) => {
    navigate("/", { state: { editPricing: pricing } });
    setActiveMenuId(null);
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
    setActiveMenuId(null);
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
    setActiveMenuId(null);
  };

  const toggleMenu = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4 px-1 md:py-8 md:px-2 overflow-auto pb-24">
      <div className="w-full max-w-3xl bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-3 sm:p-4 md:p-8 md:py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight drop-shadow-lg text-center">
          Saved Pricing Lists
        </h2>
        {pricing.length === 0 ? (
          <p className="text-gray-600 text-center">
            No saved pricing lists yet.
          </p>
        ) : (
          <div className="space-y-6">
            {pricing.map((pricing) => (
              <div
                key={pricing.id}
                className="bg-white rounded-2xl shadow-lg p-4 gap-2 transition hover:shadow-2xl border border-gray-200 relative"
                style={{ minHeight: 90 }}
              >
                {/* Name and Dots Row */}
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                    {pricing.customer?.name || "(No Name)"}
                  </div>
                  <div className="relative flex items-center ml-2">
                    <button
                      onClick={() => toggleMenu(pricing.id)}
                      className="menu-trigger p-3 rounded-full transition-colors bg-gray-100 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center shadow-sm"
                      title="Actions"
                      style={{ minWidth: 44, minHeight: 44 }}
                    >
                      <FaEllipsisV size={20} className="text-gray-500" />
                    </button>
                    {/* Action Menu */}
                    {activeMenuId === pricing.id && (
                      <div
                        className="action-menu absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-200 animate-fade-slide"
                        style={{ minWidth: 180 }}
                      >
                        <button
                          onClick={() => handleEdit(pricing)}
                          className="w-full px-5 py-3 text-left text-base text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                          style={{ minHeight: 48 }}
                        >
                          <FaEdit size={16} className="text-blue-600" /> Edit
                        </button>
                        <button
                          onClick={() => handleShare(pricing)}
                          className="w-full px-5 py-3 text-left text-base text-gray-700 hover:bg-yellow-50 flex items-center gap-3 transition-colors"
                          style={{ minHeight: 48 }}
                        >
                          <FaShare size={16} className="text-yellow-500" /> Share
                        </button>
                        <button
                          onClick={() => handleCopy(pricing)}
                          className="w-full px-5 py-3 text-left text-base text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                          style={{ minHeight: 48 }}
                        >
                          <FaCopy size={16} className="text-gray-500" /> Copy
                        </button>
                        <button
                          onClick={() => handleDelete(pricing.id)}
                          className="w-full px-5 py-3 text-left text-base text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          style={{ minHeight: 48 }}
                        >
                          <FaTrash size={16} className="text-red-600" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Date below */}
                <div className="text-gray-400 text-xs sm:text-sm font-medium mt-1">
                  {formatDate(pricing.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Floating Action Button for mobile */}
      {location.pathname === "/list" && (
        <button
          className="fixed bottom-16 right-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg p-4 md:hidden flex items-center justify-center transition"
          onClick={() => navigate("/")}
          title="Add New Pricing"
          style={{ minWidth: 56, minHeight: 56 }}
        >
          <FaPlus size={22} />
        </button>
      )}
      {/* Animations */}
      <style>{`
        @keyframes fade-slide {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide {
          animation: fade-slide 0.18s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
};

export default PricingList;
