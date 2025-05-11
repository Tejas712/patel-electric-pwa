import { BrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import { DialogProvider } from "./context/DialogContext";

function App() {
  return (
    <DialogProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </DialogProvider>
  );
}

export default App;
