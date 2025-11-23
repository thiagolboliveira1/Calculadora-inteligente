// firebase.js - placeholder-guided (Option 2)
// Cole seu firebaseConfig exatamente como aparece no console do Firebase.
// Exemplo de preenchimento (substitua os valores entre <>):

const firebaseConfig = {
  apiKey: "<COLE_AQUI_SUA_API_KEY>",
  authDomain: "<EX: seu-projeto.firebaseapp.com>",
  projectId: "<EX: seu-projeto>",
  storageBucket: "<EX: seu-projeto.appspot.com>",
  messagingSenderId: "<EX: 123456789012>",
  appId: "<EX: 1:123456789012:web:abcdef123456>",
  measurementId: "<OPCIONAL: G-XXXXXXX>"
};

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
