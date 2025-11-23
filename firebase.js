// firebase.js
// Insira seu firebaseConfig abaixo. Exporte `firebaseEnabled` e as funções para usar no app.
export let firebaseEnabled = false;
export let db = null;

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

async function init() {
  try {
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.appId) {
      // usa SDK modular
      const mod = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
      const fb = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
      mod.initializeApp(firebaseConfig);
      db = fb.getFirestore();
      firebaseEnabled = true;
      console.log('Firebase inicializado.');
    } else {
      console.warn('firebaseConfig não preenchido. Firebase desabilitado.');
    }
  } catch (e) {
    console.error('Erro ao inicializar Firebase:', e);
  }
}

// inicia automaticamente
init();

export function getDb() { return db; }
export function isFirebaseEnabled() { return firebaseEnabled; }
