import { Fragment } from "react";
import "nouislider/dist/nouislider.css";
import "jsvectormap/dist/css/jsvectormap.min.css";
import "react-datepicker/dist/react-datepicker.min.css";
import '@/assets/scss/Default.scss';
import "@/assets/scss/Icons.scss";
import configureFakeBackend from "@/helpers/fake-backend.js";
import AllRoutes from "@/routes/Routes.jsx";
import AppProvidersWrapper from "@/components/AppProvidersWrapper.jsx";

// ✅ Add Toastify imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

configureFakeBackend();

function App() {
  return (
    <Fragment>
      <AppProvidersWrapper>
        <AllRoutes />
        {/* ✅ Global Toast Container */}
        <ToastContainer
  position="top-right"
  autoClose={3000}
  theme="colored"
  style={{ zIndex: 9999 }}   // 🔥 THIS IS THE FIX
/>

      </AppProvidersWrapper>
    </Fragment>
  );
}

export default App;
