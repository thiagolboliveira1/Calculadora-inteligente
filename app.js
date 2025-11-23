
// app.js - full application logic (login-first)
import { getDb, getAuthInstance, isFirebaseEnabled } from './firebase.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

const $ = id => document.getElementById(id);

// Auth UI elements
const emailInput = $('email');
const passwordInput = $('password');
const btnSignIn = $('btnSignIn');
const btnSignUp = $('btnSignUp');
const btnSignOut = $('btnSignOut');
const userInfo = $('userInfo');

const loginScreen = $('loginScreen');
const mainScreen = $('mainScreen');

// App elements
const svc = $('serviceValue');
const pct = $('commissionPct');
const lch = $('expenseLunch');
const gas = $('expenseGas');
const dt = $('date');
const notes = $('notes');
const btnCalc = $('btnCalc');
const btnSave = $('btnSave');
const btnClear = $('btnClear');
const btnPDF = $('btnPDF');
const btnRefresh = $('btnRefresh');
const resCard = $('resultCard');
const commissionValueEl = $('commissionValue');
const dLunchEl = $('dLunch');
const dGasEl = $('dGas');
const netValueEl = $('netValue');
const monthKeyDisplay = $('monthKeyDisplay');
const monthlySummary = $('monthlySummary');
const monthLabel = $('monthLabel');
const monthlyTotals = $('monthlyTotals');
const monthlyList = $('monthlyList');

let currentUser = null;
let currentClientId = null;
let savedClientIds = new Set();

function pad(n){return n.toString().padStart(2,'0')}
function toDateInputValue(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}
dt.value = toDateInputValue(new Date());

function generateClientId(){ return `${Date.now()}-${Math.random().toString(36).slice(2,9)}` }
function resetSaveState(){ currentClientId = generateClientId(); btnSave.disabled = true }
resetSaveState();

function calcular(){
  const sv = parseFloat(svc.value || 0);
  const cp = parseFloat(pct.value || 0);
  const exLunch = parseFloat(lch.value || 0);
  const exGas = parseFloat(gas.value || 0);
  const commissionValue = Number(((sv * cp) / 100).toFixed(2));
  const net = Number((commissionValue - exLunch - exGas).toFixed(2));
  commissionValueEl.textContent = commissionValue.toFixed(2);
  dLunchEl.textContent = exLunch.toFixed(2);
  dGasEl.textContent = exGas.toFixed(2);
  netValueEl.textContent = net.toFixed(2);
  const selectedDate = new Date(dt.value);
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth()+1).padStart(2,'0');
  const monthKey = `${y}-${m}`;
  monthKeyDisplay.textContent = monthKey;
  resCard.style.display = 'block';
  btnSave.disabled = false;
  if (!currentClientId) currentClientId = generateClientId();
  return {
    serviceValue: Number(sv.toFixed(2)),
    commissionPct: Number(cp.toFixed(2)),
    commissionValue,
    expenseLunch: Number(exLunch.toFixed(2)),
    expenseGas: Number(exGas.toFixed(2)),
    netValue: net,
    date: selectedDate,
    monthKey,
    clientId: currentClientId
  };
}

btnCalc.addEventListener('click', ()=>{ try{ calcular() }catch(e){ alert('Erro no cálculo') } });

['input','change'].forEach(evt=>{
  [svc,pct,lch,gas,dt,notes].forEach(el=>{
    el.addEventListener(evt, ()=>{ currentClientId = null; btnSave.disabled=true })
  })
});

btnClear.addEventListener('click', ()=>{ svc.value=''; pct.value='20'; lch.value='0'; gas.value='0'; notes.value=''; dt.value = toDateInputValue(new Date()); resCard.style.display='none'; btnSave.disabled=true; monthlySummary.style.display='none'; monthlyList.innerHTML=''; resetSaveState(); });

// Auth handlers
btnSignIn.addEventListener('click', async ()=>{
  const email = emailInput.value.trim(); const pass = passwordInput.value;
  if(!email||!pass){ alert('Preencha email e senha'); return; }
  try{ const auth = getAuthInstance(); await signInWithEmailAndPassword(auth,email,pass); }
  catch(err){ console.error(err); alert('Erro ao entrar: '+(err.message||err)) }
});
btnSignUp.addEventListener('click', async ()=>{
  const email = emailInput.value.trim(); const pass = passwordInput.value;
  if(!email||!pass){ alert('Preencha email e senha'); return; }
  try{ const auth = getAuthInstance(); await createUserWithEmailAndPassword(auth,email,pass); alert('Usuário criado e autenticado.'); }
  catch(err){ console.error(err); alert('Erro no cadastro: '+(err.message||err)) }
});
btnSignOut.addEventListener('click', async ()=>{ try{ const auth = getAuthInstance(); await signOut(auth); }catch(e){console.error(e)} });

// observe auth state
onAuthStateChanged(getAuthInstance(), user=>{
  if(user){
    currentUser = user;
    userInfo.textContent = user.email;
    loginScreen.style.display='none';
    mainScreen.style.display='block';
    const mk = dt.value ? dt.value.slice(0,7) : new Date().toISOString().slice(0,7);
    showMonthlyTotals(mk);
  } else {
    currentUser = null;
    userInfo.textContent = '—';
    loginScreen.style.display='block';
    mainScreen.style.display='none';
  }
});

// Save to Firestore
btnSave.addEventListener('click', async ()=>{
  if(!isFirebaseEnabled()){ alert('Firebase não configurado. Preencha firebase.js'); return; }
  if(!currentUser){ alert('Faça login primeiro.'); return; }
  const data = calcular();
  const clientId = data.clientId;
  if(savedClientIds.has(clientId)){ alert('Este item já foi salvo.'); btnSave.disabled=true; return; }
  btnSave.disabled=true;
  try{
    const db = getDb();
    const q = query(collection(db,'commissions'), where('clientId','==',clientId), where('userId','==',currentUser.uid));
    const snap = await getDocs(q);
    if(!snap.empty){ savedClientIds.add(clientId); alert('Registro já existe no banco.'); return; }
    const docData = {
      serviceValue: data.serviceValue,
      commissionPct: data.commissionPct,
      commissionValue: data.commissionValue,
      expenseLunch: data.expenseLunch,
      expenseGas: data.expenseGas,
      netValue: data.netValue,
      date: serverTimestamp(),
      monthKey: data.monthKey,
      notes: notes.value || '',
      clientId,
      userId: currentUser.uid,
      userEmail: currentUser.email
    };
    const docRef = await addDoc(collection(db,'commissions'), docData);
    savedClientIds.add(clientId);
    alert('Salvo com sucesso! ID: '+docRef.id);
    await showMonthlyTotals(data.monthKey);
  }catch(err){ console.error(err); alert('Erro ao salvar: '+(err.message||err)); btnSave.disabled=false }
});

// show monthly totals
async function showMonthlyTotals(monthKey){
  monthlySummary.style.display='block';
  monthLabel.textContent = monthKey;
  if(!isFirebaseEnabled()){ monthlyTotals.innerHTML='<em>Firestore não configurado.</em>'; monthlyList.innerHTML=''; return; }
  if(!currentUser){ monthlyTotals.innerHTML='<em>Faça login para ver o histórico.</em>'; monthlyList.innerHTML=''; return; }
  const db = getDb();
  const q = query(collection(db,'commissions'), where('monthKey','==',monthKey), where('userId','==',currentUser.uid), orderBy('date','desc'));
  const snap = await getDocs(q);
  let totalCommission=0,totalExpenses=0,totalNet=0;
  monthlyList.innerHTML='';
  snap.forEach(doc=>{
    const d = doc.data();
    totalCommission += Number(d.commissionValue||0);
    totalExpenses += Number((d.expenseLunch||0)+(d.expenseGas||0));
    totalNet += Number(d.netValue||0);
    const dtStr = d.date && d.date.toDate ? d.date.toDate().toLocaleDateString() : '—';
    const item = document.createElement('div');
    item.className = 'monthly-item';
    item.innerHTML = `<div><strong>${dtStr}</strong> ${d.notes?'- '+d.notes:''}</div><div>R$ ${Number(d.netValue||0).toFixed(2)}</div>`;
    monthlyList.appendChild(item);
  });
  monthlyTotals.innerHTML = `<div><strong>Total comissão bruta:</strong> R$ ${totalCommission.toFixed(2)}</div>
    <div><strong>Total despesas (lunch+gas):</strong> R$ ${totalExpenses.toFixed(2)}</div>
    <div style="margin-top:8px"><strong>Total líquido (soma):</strong> R$ ${totalNet.toFixed(2)}</div>`;
}

// refresh
$('btnRefresh').addEventListener('click', ()=>{ const mk = dt.value ? dt.value.slice(0,7) : new Date().toISOString().slice(0,7); showMonthlyTotals(mk); });

// PDF export
btnPDF.addEventListener('click', async ()=>{
  try{
    const data = calcular();
    let history = [];
    if(isFirebaseEnabled() && currentUser){
      const db = getDb();
      const q = query(collection(db,'commissions'), where('monthKey','==',data.monthKey), where('userId','==',currentUser.uid), orderBy('date','desc'));
      const snap = await getDocs(q);
      snap.forEach(doc=>{ const d = doc.data(); const dateStr = d.date && d.date.toDate ? d.date.toDate().toLocaleDateString() : '—'; history.push({date:dateStr,notes:d.notes||'',netValue:Number(d.netValue||0)})});
    } else { history.push({date: toDateInputValue(data.date), notes: notes.value||'', netValue: data.netValue}); }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4'});
    const left = 14; let y = 15;
    try{ doc.addImage(document.querySelector('.logo-big').src, 'PNG', left, y, 45, 22); }catch(e){}
    doc.setFontSize(12); doc.text('RECIBO DE COMISSÃO', 140, y+10, {align:'right'}); y+=30;
    doc.setFillColor(245,245,247); doc.rect(left,y,182,32,'F');
    doc.setFontSize(10);
    doc.text('Emitente: Thiago Oliveira Designer de Interiores', left+4, y+8);
    doc.text('Documento: Recibo de comissão', left+4, y+15);
    doc.text('Data emissão: '+(new Date().toLocaleString()), left+4, y+22);
    y+=38;
    doc.setDrawColor(200); doc.line(left,y,196,y); y+=6;
    doc.setFontSize(11);
    doc.text('Serviço (R$): '+data.serviceValue.toFixed(2), left, y); y+=6;
    doc.text('% Comissão: '+data.commissionPct.toFixed(2)+'%', left, y); y+=6;
    doc.text('Comissão bruta (R$): '+data.commissionValue.toFixed(2), left, y); y+=6;
    doc.text('Despesa - Almoço (R$): '+data.expenseLunch.toFixed(2), left, y); y+=6;
    doc.text('Despesa - Gasolina (R$): '+data.expenseGas.toFixed(2), left, y); y+=6;
    doc.setFont(undefined, 'bold'); doc.text('Resultado líquido (R$): '+data.netValue.toFixed(2), left, y); doc.setFont(undefined,'normal'); y+=10;
    doc.setFontSize(12); doc.text('Histórico do mês', left, y); y+=6;
    doc.setFontSize(10);
    doc.text('Data', left, y); doc.text('Líquido (R$)', 100, y); doc.text('Observações', 140, y); y+=5;
    doc.line(left, y, 196, y); y+=4;
    let pageHeight = doc.internal.pageSize.height;
    for(let i=0;i<history.length;i++){
      const it = history[i];
      if(y>pageHeight-30){ doc.addPage(); y=20; }
      doc.text(String(it.date), left, y);
      doc.text(it.netValue.toFixed(2), 100, y);
      let noteShort = (it.notes||'').length>40 ? it.notes.slice(0,40)+'...' : it.notes||'-';
      doc.text(noteShort, 140, y);
      y+=6;
    }
    y+=8; if(y>pageHeight-30){ doc.addPage(); y=20; }
    const totalNet = history.reduce((s,it)=>s+Number(it.netValue||0),0);
    doc.setFontSize(12); doc.text('Total líquido (mês): R$ '+totalNet.toFixed(2), left, y); y+=8;
    doc.setLineWidth(0.2); doc.line(30,y+20,90,y+20); doc.text('Assinatura (Emitente)',30,y+26);
    doc.line(120,y+20,176,y+20); doc.text('Assinatura (Recebedor)',120,y+26);
    const fileName = `recibo_comissao_${data.monthKey}.pdf`;
    doc.save(fileName);
  }catch(err){ console.error(err); alert('Erro ao gerar PDF: '+(err.message||err)) }
});
