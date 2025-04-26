
import { Toaster } from "react-hot-toast";
import LandingPage from "./Pages/Landing";

function App() {
  return (
    <div>
      <Toaster position="top-center" />
      <LandingPage />
    </div>
  );
}

export default App;