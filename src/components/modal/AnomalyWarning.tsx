
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const AnomalyWarning = () => {
  return (
    <Alert variant="destructive" className="mb-4 max-w-full">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Si vous constatez des anomalies, veuillez les signaler dans le module dédié "Anomalies".
      </AlertDescription>
    </Alert>
  );
};

export default AnomalyWarning;
