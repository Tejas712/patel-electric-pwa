import PricingForm from "./components/PricingForm";
import PricingList from "./components/PricingList";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import logo from "./assets/logo.png";
import { FaHome, FaList } from "react-icons/fa";

function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-around items-center py-2 md:hidden">
      <Link
        to="/"
        className={`flex flex-col items-center text-xs ${
          location.pathname === "/" ? "text-yellow-400" : "text-white"
        } hover:text-yellow-400 transition`}
      >
        <FaHome size={22} />
        Home
      </Link>
      <Link
        to="/list"
        className={`flex flex-col items-center text-xs ${
          location.pathname === "/list" ? "text-yellow-400" : "text-white"
        } hover:text-yellow-400 transition`}
      >
        <FaList size={22} />
        Pricings
      </Link>
    </nav>
  );
}

function AppLayout() {
  const location = useLocation();
  return (
    <>
      <nav className="w-full bg-gray-900 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Patel Electric Logo"
            className="h-9 w-9 rounded-md bg-white object-contain"
          />
          <span className="text-xl font-bold text-yellow-400">
            Patel Electric
          </span>
        </div>
        <div className="hidden md:flex gap-4">
          <Link
            to="/"
            className={`font-medium transition px-2 pb-1 ${location.pathname === '/' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}`}
          >
            Form
          </Link>
          <Link
            to="/list"
            className={`font-medium transition px-2 pb-1 ${location.pathname === '/list' ? 'text-yellow-400 font-bold border-b-2 border-yellow-400' : 'text-white hover:text-yellow-400'}`}
          >
            List
          </Link>
        </div>
      </nav>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Routes>
          <Route path="/" element={<PricingForm />} />
          <Route path="/list" element={<PricingList />} />
        </Routes>
        <MobileNav />
      </div>
    </>
  );
}

export default AppLayout; 