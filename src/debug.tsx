import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Style minimal pour le débogage
const styles = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    padding: 20px;
  }
  .debug-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
  }
  .error {
    color: red;
    background-color: #ffeeee;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .success {
    color: green;
    background-color: #eeffee;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  button {
    background-color: #4285f4;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  button:hover {
    background-color: #3367d6;
  }
  pre {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

const DebugApp = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  // Vérifier les variables d'environnement
  useEffect(() => {
    const vars: Record<string, string> = {};
    
    // Récupérer toutes les variables d'environnement VITE_*
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        // Masquer les valeurs sensibles
        const value = key.includes('KEY') || key.includes('SECRET') 
          ? '****' 
          : String(import.meta.env[key]);
        vars[key] = value;
      }
    });
    
    setEnvVariables(vars);
    addLog('Variables d\'environnement chargées');
  }, []);

  // Initialiser Firebase
  useEffect(() => {
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };

      // Vérifier si les variables d'environnement Firebase sont définies
      const missingVars = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        throw new Error(`Variables d'environnement Firebase manquantes: ${missingVars.join(', ')}`);
      }

      // Initialiser Firebase
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      setFirebaseInitialized(true);
      addLog('Firebase initialisé avec succès');
    } catch (err: any) {
      setError(`Erreur lors de l'initialisation de Firebase: ${err.message}`);
      addLog(`ERREUR: ${err.message}`);
      console.error('Erreur Firebase:', err);
    }
  }, []);

  // Tester la connexion Firebase
  const testFirebaseAuth = async () => {
    try {
      addLog('Test de connexion Firebase...');
      
      if (!firebaseInitialized) {
        throw new Error('Firebase n\'est pas initialisé');
      }
      
      const auth = getAuth();
      
      // Tenter une connexion avec des identifiants de test
      // Cela échouera, mais nous permettra de vérifier si Firebase Auth fonctionne
      try {
        await signInWithEmailAndPassword(auth, 'test@example.com', 'password');
      } catch (authErr: any) {
        // Si l'erreur est liée à des identifiants invalides, c'est bon signe
        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
          addLog('Test Firebase réussi: API d\'authentification fonctionnelle');
          return;
        }
        throw authErr;
      }
    } catch (err: any) {
      setError(`Erreur lors du test Firebase Auth: ${err.message}`);
      addLog(`ERREUR: ${err.message}`);
      console.error('Erreur test Firebase:', err);
    }
  };

  return (
    <div className="debug-container">
      <style>{styles}</style>
      <h1>Débogage Firebase</h1>
      
      <h2>Variables d'environnement</h2>
      <pre>{JSON.stringify(envVariables, null, 2)}</pre>
      
      <h2>État Firebase</h2>
      <p>
        Firebase initialisé: <strong>{firebaseInitialized ? 'Oui' : 'Non'}</strong>
      </p>
      
      {error && <div className="error">{error}</div>}
      
      <button onClick={testFirebaseAuth}>
        Tester Firebase Auth
      </button>
      
      <h2>Logs</h2>
      <pre>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </pre>
    </div>
  );
};

// Monter l'application de débogage
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DebugApp />);
} else {
  console.error('Élément root non trouvé');
}

export default DebugApp;
