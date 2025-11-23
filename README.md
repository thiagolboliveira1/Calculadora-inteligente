Calculadora de Comissão - Recebimento/Recibo
================================================================================

Alterações nesta versão:
- Inserida logo (arquivo logo.png) que será incluída no recibo PDF.
- PDF gerado com layout de recibo/nota, com cabeçalho, histórico e área para assinatura.
- Salvamento idempotente: cada formulário gera um `clientId` único e o app verifica no Firestore se já existe um documento com o mesmo `clientId` antes de inserir — assim evita duplicatas caso você clique duas vezes.

Arquivos:
- index.html
- styles.css
- firebase.js
- app.js
- logo.png  (sua logo fornecida)
- README.md

Como usar:
1. Extraia o ZIP.
2. Abra index.html no navegador.
3. Preencha `firebase.js` com seu firebaseConfig para habilitar salvar/consultar. Sem Firebase, PDF funciona normalmente.
4. Para evitar salvar em duplicidade:
   - O app gera um clientId para cada formulário/calculo.
   - Antes de inserir, ele verifica se já existe um documento com esse clientId.
   - Após salvar com sucesso, o botão de salvar é desabilitado até você alterar os campos (gera novo clientId).
