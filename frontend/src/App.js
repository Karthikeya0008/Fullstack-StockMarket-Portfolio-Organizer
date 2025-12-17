import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./Dashboard";
import Portfolio from "./portfolio";
import TaxReports from "./TaxReports";
import AccountDetails from "./AccountDetails";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/portfolio" element={<Layout><Portfolio/></Layout>} />
        <Route path="/tax-reports" element={<TaxReports />} />
        <Route path="/account-details" element={<AccountDetails/>} />
      </Routes>
    </Router>
  );
}

export default App;
