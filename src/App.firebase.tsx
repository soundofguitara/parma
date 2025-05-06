import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Batches from "./pages/Batches";
import Operators from "./pages/Operators";
import NotFound from "./pages/NotFound";
import Assignments from "./pages/Assignments";
import Performance from "./pages/Performance";
import Planning from "./pages/Planning";
import Anomalies from "./pages/Anomalies";
import FirebaseLogin from "./pages/FirebaseLogin";
import Admin from "./pages/Admin";
import FirebaseProtectedRoute from "./components/auth/FirebaseProtectedRoute";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<FirebaseLogin />} />

            {/* Route directe vers la page d'administration pour le débogage */}
            <Route path="/admin-direct" element={<Admin />} />

            {/* Routes protégées nécessitant une authentification */}
            <Route element={<FirebaseProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/batches" element={<Batches />} />
                <Route path="/operators" element={<Operators />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/anomalies" element={<Anomalies />} />

                {/* Route protégée nécessitant des privilèges d'administrateur */}
                <Route path="/admin" element={<Admin />} />

                {/* Page de paramètres */}
                <Route path="/settings" element={<Dashboard />} />
              </Route>
            </Route>

            {/* Redirection vers la page 404 pour les routes non définies */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;
