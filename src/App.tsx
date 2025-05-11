import "./App.css";
import PricingForm from "./components/PricingForm";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import PricingList from "./components/PricingList";
import { FaHome, FaList } from "react-icons/fa";
import logo from "./assets/logo.png";

function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-around items-center py-2 md:hidden">
      <Link
        to="/"
        className={`flex flex-col items-center text-xs ${
          location.pathname === "/" ? "text-green-400" : "text-white"
        } hover:text-green-400 transition`}
      >
        <FaHome size={22} />
        Home
      </Link>
      <Link
        to="/list"
        className={`flex flex-col items-center text-xs ${
          location.pathname === "/list" ? "text-green-400" : "text-white"
        } hover:text-green-400 transition`}
      >
        <FaList size={22} />
        Pricings
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav className="w-full bg-gray-900 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Patel Electric Logo"
            className="h-9 w-9 rounded-md bg-white object-contain"
          />
          <span className="text-xl font-bold text-green-400">
            Patel Electric
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/"
            className="text-white hover:text-green-400 font-medium transition"
          >
            New Pricing
          </Link>
          <Link
            to="/list"
            className="text-white hover:text-green-400 font-medium transition"
          >
            Saved Pricings
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<PricingForm />} />
        <Route path="/list" element={<PricingList />} />
      </Routes>
      <MobileNav />
    </BrowserRouter>
  );
}

export default App;
