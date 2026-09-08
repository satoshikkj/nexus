// Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyABlbc-bFpGJLAhYPkqtGnybuIx-lb-dVQ",
  authDomain: "nexus-e5303.firebaseapp.com",
  projectId: "nexus-e5303",
  storageBucket: "nexus-e5303.firebasestorage.app",
  messagingSenderId: "753922064603",
  appId: "1:753922064603:web:28415bcab7d2d984158cfe"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Authentication
const auth = getAuth(app);

// Inicializa Firestore
const db = getFirestore(app);

// Exporta para o restante do NEXUS
export { app, auth, db };
