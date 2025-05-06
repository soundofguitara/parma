import{q as S,j as s,r as t,i as m,g as u,e as _}from"./index.esm-CibJkt0i.js";const p={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1,VITE_FIREBASE_API_KEY:"AIzaSyAajSxkefGVqBSbrWIoythD6SIqU5Y89u8",VITE_FIREBASE_APP_ID:"1:198744020241:web:b4018fa8ff5879a04aa8b0",VITE_FIREBASE_AUTH_DOMAIN:"vignetage.firebaseapp.com",VITE_FIREBASE_MEASUREMENT_ID:"G-18820NRRQS",VITE_FIREBASE_MESSAGING_SENDER_ID:"198744020241",VITE_FIREBASE_PROJECT_ID:"vignetage",VITE_FIREBASE_STORAGE_BUCKET:"vignetage.firebasestorage.app",VITE_SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHlsa2hkbG5wZWZraHR1bHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjA5NTcsImV4cCI6MjA2MTQ5Njk1N30.-LfPZ4NFcnvorlht3w3GD1-XwtzN4zkQYpupYjCd5bQ",VITE_SUPABASE_URL:"https://hvtylkhdlnpefkhtulsh.supabase.co"},A=`
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
`,R=()=>{const[o,E]=t.useState([]),[n,c]=t.useState(null),[d,g]=t.useState(!1),[h,I]=t.useState({}),a=e=>{E(r=>[...r,`[${new Date().toISOString()}] ${e}`])};t.useEffect(()=>{const e={};Object.keys(p).forEach(r=>{if(r.startsWith("VITE_")){const i=r.includes("KEY")||r.includes("SECRET")?"****":String(p[r]);e[r]=i}}),I(e),a("Variables d'environnement chargées")},[]),t.useEffect(()=>{try{const e={apiKey:"AIzaSyAajSxkefGVqBSbrWIoythD6SIqU5Y89u8",authDomain:"vignetage.firebaseapp.com",projectId:"vignetage",storageBucket:"vignetage.firebasestorage.app",messagingSenderId:"198744020241",appId:"1:198744020241:web:b4018fa8ff5879a04aa8b0"},r=Object.entries(e).filter(([l,x])=>!x).map(([l])=>l);if(r.length>0)throw new Error(`Variables d'environnement Firebase manquantes: ${r.join(", ")}`);const i=m(e),j=u(i);g(!0),a("Firebase initialisé avec succès")}catch(e){c(`Erreur lors de l'initialisation de Firebase: ${e.message}`),a(`ERREUR: ${e.message}`),console.error("Erreur Firebase:",e)}},[]);const f=async()=>{try{if(a("Test de connexion Firebase..."),!d)throw new Error("Firebase n'est pas initialisé");const e=u();try{await _(e,"test@example.com","password")}catch(r){if(r.code==="auth/user-not-found"||r.code==="auth/wrong-password"){a("Test Firebase réussi: API d'authentification fonctionnelle");return}throw r}}catch(e){c(`Erreur lors du test Firebase Auth: ${e.message}`),a(`ERREUR: ${e.message}`),console.error("Erreur test Firebase:",e)}};return s.jsxs("div",{className:"debug-container",children:[s.jsx("style",{children:A}),s.jsx("h1",{children:"Débogage Firebase"}),s.jsx("h2",{children:"Variables d'environnement"}),s.jsx("pre",{children:JSON.stringify(h,null,2)}),s.jsx("h2",{children:"État Firebase"}),s.jsxs("p",{children:["Firebase initialisé: ",s.jsx("strong",{children:d?"Oui":"Non"})]}),n&&s.jsx("div",{className:"error",children:n}),s.jsx("button",{onClick:f,children:"Tester Firebase Auth"}),s.jsx("h2",{children:"Logs"}),s.jsx("pre",{children:o.map((e,r)=>s.jsx("div",{children:e},r))})]})},b=document.getElementById("root");b?S(b).render(s.jsx(R,{})):console.error("Élément root non trouvé");
