// app.js
import { getDb, isFirebaseEnabled } from './firebase.js';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const $ = id => document.getElementById(id);
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
const resCard = $('resultCard');
const commissionValueEl = $('commissionValue');
const dLunchEl = $('dLunch');
const dGasEl = $('dGas');
const netValueEl = $('netValue');
const monthKeyDisplay = $('monthKeyDisplay');
const msg = $('msg');
const monthlySummary = $('monthlySummary');
const monthLabel = $('monthLabel');
const monthlyTotals = $('monthlyTotals');
const monthlyList = $('monthlyList');

let currentClientId = null;
let savedClientIds = new Set();

function toDateInputValue(date) {
  const pad = n => n.toString().padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
const hoje = new Date();
dt.value = toDateInputValue(hoje);

// generate a clientId for the current form state
function generateClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
}

function markAsSaved(clientId) {
  savedClientIds.add(clientId);
}

// Call when inputs change to allow new save
function resetSaveState() {
  currentClientId = generateClientId();
  btnSave.disabled = true; // enabled after calculate
}

resetSaveState();

function calcular() {
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
  msg.textContent = '';
  // ensure currentClientId exists (if was saved earlier, generate new)
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

btnCalc.addEventListener('click', () => {
  try { calcular(); } catch (e) { msg.style.color='red'; msg.textContent = 'Erro no cálculo'; }
});

// When user edits inputs, reset save state so they can save a new record
['input','change'].forEach(evt => {
  [svc,pct,lch,gas,dt,notes].forEach(el => {
    el.addEventListener(evt, () => {
      currentClientId = null;
      btnSave.disabled = true;
    });
  });
});

btnClear.addEventListener('click', () => {
  svc.value=''; pct.value='20'; lch.value='0'; gas.value='0'; notes.value=''; dt.value = toDateInputValue(new Date());
  resCard.style.display='none'; btnSave.disabled=true; monthlySummary.style.display='none'; msg.textContent='';
  monthlyList.innerHTML = '';
  resetSaveState();
});

btnSave.addEventListener('click', async () => {
  if (!isFirebaseEnabled()) { msg.style.color='red'; msg.textContent='Firebase não configurado.'; return; }
  const data = calcular();
  const clientId = data.clientId;
  if (savedClientIds.has(clientId)) {
    msg.style.color='green';
    msg.textContent = 'Este item já foi salvo.';
    btnSave.disabled = true;
    return;
  }

  btnSave.disabled = true;
  msg.style.color = 'black'; msg.textContent = 'Verificando...';

  try {
    const db = getDb();
    const q = query(collection(db, "commissions"), where("clientId","==",clientId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      msg.style.color='green';
      msg.textContent = 'Registro já existe no banco (salvamento anterior detectado).';
      markAsSaved(clientId);
      return;
    }

    msg.textContent = 'Salvando...';
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
      clientId
    };
    const docRef = await addDoc(collection(db, "commissions"), docData);
    msg.style.color = 'green';
    msg.textContent = 'Salvo com sucesso! ID: ' + docRef.id;
    markAsSaved(clientId);
    await showMonthlyTotals(data.monthKey);
  } catch (err) {
    console.error(err);
    msg.style.color = 'red';
    msg.textContent = 'Erro ao salvar: ' + (err.message || err);
    btnSave.disabled = false;
  }
});

async function showMonthlyTotals(monthKey) {
  monthlySummary.style.display = 'block';
  monthLabel.textContent = monthKey;

  if (!isFirebaseEnabled()) {
    monthlyTotals.innerHTML = '<em>Firestore não configurado — habilite firebaseConfig para ver histórico.</em>';
    monthlyList.innerHTML = '';
    return;
  }

  const db = getDb();
  const q = query(collection(db, "commissions"), where("monthKey","==",monthKey), orderBy("date","desc"));
  const snap = await getDocs(q);

  let totalCommission = 0;
  let totalExpenses = 0;
  let totalNet = 0;
  monthlyList.innerHTML = '';

  snap.forEach(doc => {
    const d = doc.data();
    totalCommission += Number(d.commissionValue || 0);
    totalExpenses += Number((d.expenseLunch || 0) + (d.expenseGas || 0));
    totalNet += Number(d.netValue || 0);

    const dtStr = d.date && d.date.toDate ? d.date.toDate().toLocaleDateString() : '—';
    const item = document.createElement('div');
    item.className = 'monthly-item';
    item.innerHTML = `<div><strong>${dtStr}</strong> ${d.notes ? '- ' + d.notes : ''}</div><div>R$ ${Number(d.netValue||0).toFixed(2)}</div>`;
    monthlyList.appendChild(item);
  });

  monthlyTotals.innerHTML =
    `<div style="padding:8px 0"><strong>Total comissão bruta:</strong> R$ ${totalCommission.toFixed(2)}</div>
     <div><strong>Total despesas (lunch+gas):</strong> R$ ${totalExpenses.toFixed(2)}</div>
     <div style="margin-top:8px"><strong>Total líquido (soma):</strong> R$ ${totalNet.toFixed(2)}</div>`;
}

// PDF Export — Receipt style with logo
btnPDF.addEventListener('click', async () => {
  try {
    const data = calcular();
    let history = [];
    if (isFirebaseEnabled()) {
      const db = getDb();
      const q = query(collection(db, "commissions"), where("monthKey","==",data.monthKey), orderBy("date","desc"));
      const snap = await getDocs(q);
      snap.forEach(doc => {
        const d = doc.data();
        const dateStr = d.date && d.date.toDate ? d.date.toDate().toLocaleDateString() : '—';
        history.push({
          date: dateStr,
          notes: d.notes || '',
          netValue: Number(d.netValue || 0)
        });
      });
    } else {
      history.push({
        date: toDateInputValue(data.date),
        notes: notes.value || '',
        netValue: data.netValue
      });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const left = 14;
    let y = 15;

    async function loadLogoDataURL(path) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0);
          try {
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          } catch(e) { reject(e); }
        };
        img.onerror = (e) => reject(e);
        img.src = 'logo.png';
      });
    }

    try {
      const logoDataUrl = await loadLogoDataURL('logo.png');
      doc.addImage(logoDataUrl, 'PNG', left, y, 40, 20);
    } catch (e) {
      doc.setFontSize(14);
      doc.text('Thiago Oliveira Designer de Interiores', left, y + 12);
    }

    doc.setFontSize(12);
    doc.text(`RECIBO DE COMISSÃO`, 140, y + 10, { align: 'right' });
    y += 28;

    doc.setFontSize(10);
    doc.text(`Emitente: Thiago Oliveira Designer de Interiores`, left, y); y += 6;
    doc.text(`Documento: Recibo de comissão`, left, y); y += 6;
    doc.text(`Data emissão: ${new Date().toLocaleString()}`, left, y); y += 8;

    doc.setDrawColor(200);
    doc.line(left, y, 196, y); y += 6;

    doc.setFontSize(11);
    doc.text(`Serviço (R$): ${data.serviceValue.toFixed(2)}`, left, y); y += 6;
    doc.text(`% Comissão: ${data.commissionPct.toFixed(2)}%`, left, y); y += 6;
    doc.text(`Comissão bruta (R$): ${data.commissionValue.toFixed(2)}`, left, y); y += 6;
    doc.text(`Despesa - Almoço (R$): ${data.expenseLunch.toFixed(2)}`, left, y); y += 6;
    doc.text(`Despesa - Gasolina (R$): ${data.expenseGas.toFixed(2)}`, left, y); y += 6;
    doc.setFont(undefined, 'bold');
    doc.text(`Resultado líquido (R$): ${data.netValue.toFixed(2)}`, left, y); doc.setFont(undefined, 'normal');
    y += 10;

    doc.setFontSize(12);
    doc.text('Histórico do mês', left, y); y += 6;
    doc.setFontSize(10);
    doc.text('Data', left, y);
    doc.text('Líquido (R$)', 100, y);
    doc.text('Observações', 140, y);
    y += 5;
    doc.line(left, y, 196, y); y += 4;

    let pageHeight = doc.internal.pageSize.height;
    for (let i = 0; i < history.length; i++) {
      const it = history[i];
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      const notesText = it.notes || '-';
      doc.text(String(it.date), left, y);
      doc.text(it.netValue.toFixed(2), 100, y);
      let noteShort = notesText.length > 40 ? notesText.slice(0,40) + '...' : notesText;
      doc.text(noteShort, 140, y);
      y += 6;
    }

    y += 8;
    if (y > pageHeight - 30) { doc.addPage(); y = 20; }
    const totalNet = history.reduce((s, it) => s + Number(it.netValue || 0), 0);
    doc.setFontSize(12);
    doc.text(`Total líquido (mês): R$ ${totalNet.toFixed(2)}`, left, y);
    y += 8;

    doc.setLineWidth(0.2);
    doc.line(30, y+20, 90, y+20);
    doc.text('Assinatura (Emitente)', 30, y+26);
    doc.line(120, y+20, 176, y+20);
    doc.text('Assinatura (Recebedor)', 120, y+26);

    const fileName = `recibo_comissao_${data.monthKey}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error(err);
    alert('Erro ao gerar PDF: ' + (err.message || err));
  }
});
