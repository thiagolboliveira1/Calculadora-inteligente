Calculadora de Comissão - Recebimento/Recibo (Auth + Logo embedded)
================================================================================

O pacote contém:
- index.html
- styles.css
- firebase.js (preencha seu firebaseConfig)
- app.js
- logo.png (cópia da sua logo)
- README.md

Principais mudanças:
- Logo embutida como base64 no app para garantir que apareça no PDF mesmo em ambiente local.
- Layout do recibo ajustado: cor, tipografia, posição da logo e caixa de informações destacada.
- Firebase Authentication obrigatório para salvar no Firestore. Você deve criar usuários no console Firebase (Authentication -> Email/Password) ou implementar cadastro adicional.
- Ao salvar, o documento registra `userId` e `userEmail` para separar dados por usuário.
- Salvamento idempotente por `clientId` + `userId` para evitar duplicação.

Como usar:
1. Extraia o ZIP.
2. Abra index.html no navegador.
3. Em `firebase.js` preencha o objeto `firebaseConfig` do seu projeto e publique/acesse Firestore e Auth.
4. Crie um usuário no Firebase Auth (email/senha) pelo console ou implemente fluxo de registro.
5. Entrar com o usuário antes de salvar.
6. Gerar recibo em PDF com o botão "Exportar PDF (Recibo)".

Firestore Rules recomendadas (exemplo mínimo):
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /commissions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}

Se quiser que eu implemente:
- fluxo de cadastro (signup) diretamente na UI,
- melhorias estéticas no recibo (cores, tipografia, adicionar sua tipografia preferida),
- incluir CNPJ/Endereço no recibo,
diga qual e eu atualizo agora.
