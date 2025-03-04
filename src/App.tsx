
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import ApplicantLogin from "./pages/ApplicantLogin";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CVDetail from "./pages/CVDetail";
import SortingPage from "./pages/SortingPage";
import MessagesInterviewsPage from "./pages/MessagesInterviewsPage"; // Import the new page

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cv/:id" element={<CVDetail />} />
          <Route path="/admin/sorting" element={<SortingPage />} />
          <Route path="/admin/messages" element={<MessagesInterviewsPage />} /> {/* Add the route for MessagesInterviewsPage */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
