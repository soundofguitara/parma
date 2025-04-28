
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import Operators from "./pages/Operators";
import NotFound from "./pages/NotFound";
import Assignments from "./pages/Assignments";
import Performance from "./pages/Performance";
import Planning from "./pages/Planning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/operators" element={<Operators />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
