// firebase.js - placeholder-guided (Option 2)
// Cole seu firebaseConfig exatamente como aparece no console do Firebase.
// Exemplo de preenchimento (substitua os valores entre <>):

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy5apK-iD-UMb6AWezRhjR4IvqU94zyEA",
  authDomain: "calculadora-inteligente-82f91.firebaseapp.com",
  projectId: "calculadora-inteligente-82f91",
  storageBucket: "calculadora-inteligente-82f91.firebasestorage.app",
  messagingSenderId: "702697035202",
  appId: "1:702697035202:web:e775c5d53ff18e41fe725b",
  measurementId: "G-1WK74VRRJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Depois de colar as informações, salve este arquivo e abra index.html no navegador.
// NOTA: para evitar erros de chave inválida, verifique no Google Cloud Console se a API Key
// não tem restrições de referrer (ou adicione seu domínio: ex: https://seunome.github.io/*).

export let firebaseEnabled = false;
export let db = null;
export let auth = null;

async function init() {
  try {
    // Carrega o SDK modular do Firebase
    const appMod = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
    const fbAuth = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js');
    const fbStore = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    // Inicializa somente se o usuário preencheu o firebaseConfig acima
    if (!firebaseConfig || firebaseConfig.apiKey.includes('<')) {
      console.warn('firebaseConfig não preenchido. Preencha firebase.js com seus dados do console Firebase.');
      return;
    }
    const app = appMod.initializeApp(firebaseConfig);
    auth = fbAuth.getAuth(app);
    db = fbStore.getFirestore(app);
    firebaseEnabled = true;
    console.log('Firebase inicializado.');
  } catch (e) {
    console.error('Erro ao inicializar Firebase:', e);
  }
}

init();

export function getDb() { return db; }
export function getAuthInstance() { return auth; }
export function isFirebaseEnabled() { return firebaseEnabled; }
