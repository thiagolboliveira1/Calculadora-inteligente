Calculadora de Comissão - Marceneiro (versão com exportação em PDF)
================================================================================

O pacote contém:

- index.html        -> interface principal (abre no navegador)
- styles.css        -> estilos separados
- firebase.js       -> arquivo para configurar seu Firebase (preencha firebaseConfig)
- app.js            -> lógica da aplicação (cálculo, salvar, exportar PDF)
- README.md         -> este arquivo

Como usar
---------
1. Extraia o ZIP em uma pasta.
2. Abra o arquivo `index.html` no navegador (duplo clique).
   - Se quiser usar o histórico salvo no Firestore, edite `firebase.js` e preencha o objeto `firebaseConfig` com os dados do seu projeto Firebase.
   - Se não usar Firebase, a função de salvar ficará desabilitada, mas a exportação em PDF continuará funcionando para o registro atual.
3. Para salvar no Firestore:
   - Habilite Firestore no console do Firebase.
   - Ajuste as regras de segurança (recomendado: usar autenticação).
   - Preencha `firebaseConfig` em `firebase.js`. Ao abrir a página, o Firebase será inicializado automaticamente.
4. Exportar PDF:
   - Clique em "Exportar PDF" e será gerado um PDF com os dados atuais e o histórico do mês (se houver Firestore configurado).
5. Personalizações sugeridas:
   - Adicionar autenticação para separar os dados por usuário.
   - Exportar relatório por período personalizado.
   - Melhorar layout do PDF (logo, fontes).

Observações técnicas
--------------------
- O projeto usa jsPDF via CDN para gerar PDF no cliente.
- O Firebase é inicializado dinamicamente em `firebase.js` usando os módulos CDN.
- Se for hospedar em servidor, mantenha as mesmas estruturas (index.html referenciando scripts relativos).

Se quiser que eu gere uma versão hospedada (ex.: ZIP com deploy scripts) ou que eu altere o layout do PDF (inserir logo, tabela com colunas mais largas, etc.), me avise e eu já atualizo agora.
