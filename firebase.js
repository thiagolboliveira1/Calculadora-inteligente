// firebase.js - prefilled with your firebaseConfig
export let firebaseEnabled = false;
export let db = null;
export let auth = null;

const firebaseConfig = {
  apiKey: "AIzaSyBy5apK-iD-UMb6AWezRhjR4TvqU94zyEA",
  authDomain: "calculadora-inteligente-82f91.firebaseapp.com",
  projectId: "calculadora-inteligente-82f91",
  storageBucket: "calculadora-inteligente-82f91.appspot.com",
  messagingSenderId: "702697035202",
  appId: "1:702697035202:web:e775c5d53f1be41fe725b",
  measurementId: "G-1WK74VRRJB"
};

async function init() {
  try {
    const appMod = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
    const fbAuth = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js');
    const fbStore = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
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
