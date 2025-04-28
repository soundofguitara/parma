
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const AnomalyWarning = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Si vous constatez des anomalies, utilisez le bouton ci-dessous pour les signaler.
      </AlertDescription>
    </Alert>
  );
};

export default AnomalyWarning;
