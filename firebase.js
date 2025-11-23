// firebase.js — versão limpa e consistente (use este arquivo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

// Seu firebaseConfig (cole exatamente do Console Firebase)
// OBS: corrigi storageBucket para o formato .appspot.com (padrão)
const firebaseConfig = {
  apiKey: "AIzaSyBy5apK-iD-UMb6AWezRhjR4IvqU94zyEA",
  authDomain: "calculadora-inteligente-82f91.firebaseapp.com",
  projectId: "calculadora-inteligente-82f91",
  storageBucket: "calculadora-inteligente-82f91.appspot.com",
  messagingSenderId: "702697035202",
  appId: "1:702697035202:web:e775c5d53ff18e41fe725b",
  measurementId: "G-1WK74VRRJB"
};

// Inicializa Firebase com o SDK modular
const app = initializeApp(firebaseConfig);

// Analytics é opcional — inicialize só se precisar
let analytics = null;
try { analytics = getAnalytics(app); } catch(e) { /* measurementId opcional */ }

// Exporta instâncias que o app.js usa
export const auth = getAuth(app);
export const db = getFirestore(app);

// helpers compatíveis com o app.js existente
export function getDb() { return db; }
export function getAuthInstance() { return auth; }
export function isFirebaseEnabled() { return !!app; }
