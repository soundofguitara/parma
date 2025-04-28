
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pharma-blue-dark">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-pharma-text-muted mb-4">Page non trouvée</p>
        <a href="/" className="text-pharma-accent-blue hover:text-blue-400 underline">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
