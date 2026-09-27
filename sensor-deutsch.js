// ===== ESTADO COMPARTIDO =====
// 4 sensores agrupados en 2 pares independientes, mismos valores
// documentados en el Word y en el Colab (S1=0,S2=1 balanceada;
// S3=1,S4=1 constante)
let pares = {
  p1: { nombre: 'S1 – S2', labelX: 'Sensor S1', labelY: 'Sensor S2', x: 0, y: 1 },
  p2: { nombre: 'S3 – S4', labelX: 'Sensor S3', labelY: 'Sensor S4', x: 1, y: 1 }
};
let parActivo = 'p1';
function activo() { return pares[parActivo]; }

let classicStep = 0;   // 0..3
let quantumStep = 0;   // 0..4
let currentMode = 'classic';

const canvas = document.getElementById('circuit-canvas');
const ctx = canvas.getContext('2d');

// ===== ORÁCULO: según la tabla del proyecto (sin cambios) =====
function getOracle(A, B) {
  if (A === 0 && B === 0) return { tipo: 'Constante', gate: 'ninguna' };
  if (A === 1 && B === 1) return { tipo: 'Constante', gate: 'X en q1' };
  if (A === 0 && B === 1) return { tipo: 'Balanceada', gate: 'CNOT(q0→q1)' };
  return { tipo: 'Balanceada', gate: 'CNOT(q0→q1) + X en q1' }; // A=1,B=0
}

function expectedMeasurement(A, B) {
  return A === B ? 0 : 1; // 0 = constante, 1 = balanceada
}

// ===== HELPERS DE DIBUJO (sin cambios) =====
function clear() {
  ctx.fillStyle = '#0b0d12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function box(x, y, w, h, label, color) {
  ctx.strokeStyle = color || '#4b5563';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color || '#e6e8eb';
  ctx.font = '13px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 4);
}

function text(x, y, str, color, size, align) {
  ctx.fillStyle = color || '#e6e8eb';
  ctx.font = (size || 13) + 'px Consolas, monospace';
  ctx.textAlign = align || 'left';
  ctx.fillText(str, x, y);
}

// ===== DIBUJO: MODO CLÁSICO =====
function drawClassic() {
  clear();
  const { x: A, y: B, labelX, labelY } = activo();
  const boxA = { x: 80, y: 60, w: 140, h: 60 };
  const boxB = { x: 80, y: 180, w: 140, h: 60 };
  const comp = { x: 320, y: 120, w: 160, h: 60 };

  box(boxA.x, boxA.y, boxA.w, boxA.h,
      classicStep >= 1 ? `${labelX} = ${A}` : `${labelX} = ?`, '#34d399');
  box(boxB.x, boxB.y, boxB.w, boxB.h,
      classicStep >= 1 ? `${labelY} = ${B}` : `${labelY} = ?`, '#34d399');

  if (classicStep >= 2) {
    ctx.strokeStyle = '#4b5563';
    ctx.beginPath();
    ctx.moveTo(boxA.x + boxA.w, boxA.y + boxA.h / 2);
    ctx.lineTo(comp.x, comp.y + comp.h / 2 - 15);
    ctx.moveTo(boxB.x + boxB.w, boxB.y + boxB.h / 2);
    ctx.lineTo(comp.x, comp.y + comp.h / 2 + 15);
    ctx.stroke();
    box(comp.x, comp.y, comp.w, comp.h, `¿${labelX.slice(-2)} == ${labelY.slice(-2)}?`, '#e6e8eb');
  }

  if (classicStep >= 3) {
    const igual = A === B;
    const color = igual ? '#34d399' : '#f87171';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(comp.x + comp.w, comp.y + comp.h / 2);
    ctx.lineTo(comp.x + comp.w + 60, comp.y + comp.h / 2);
    ctx.stroke();
    box(comp.x + comp.w + 60, comp.y - 10, 130, 80, '', color);
    text(comp.x + comp.w + 60 + 65, comp.y + 30, igual ? 'MISMO' : 'ESTADOS', color, 14, 'center');
    text(comp.x + comp.w + 60 + 65, comp.y + 48, igual ? 'ESTADO' : 'DIFERENTES', color, 14, 'center');
  }
}

function updateClassicStats() {
  const { x: A, y: B, nombre } = activo();
  document.getElementById('c-stat-par').textContent = nombre;
  document.getElementById('c-stat-values').textContent = `${A} / ${B}`;
  const resEl = document.getElementById('c-stat-result');
  const msg = document.getElementById('classic-result');
  if (classicStep >= 3) {
    const igual = A === B;
    resEl.textContent = igual ? 'Mismo estado' : 'Estados diferentes';
    msg.textContent = igual
      ? '✓ Los sensores del par coinciden.'
      : '⚠️ Inconsistencia detectada entre los sensores del par.';
  } else {
    resEl.textContent = '—';
    msg.textContent = '';
  }
}

// ===== DIBUJO: MODO CUÁNTICO =====
function drawQuantum() {
  clear();
  const { x: A, y: B } = activo();
  const oracle = getOracle(A, B);
  const q0y = 110, q1y = 250;
  const xStart = 60, xEnd = 580;

  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xStart, q0y); ctx.lineTo(xEnd, q0y);
  ctx.moveTo(xStart, q1y); ctx.lineTo(xEnd, q1y);
  ctx.stroke();

  text(xStart - 10, q0y - 15, 'q0: |0⟩', '#a78bfa', 13, 'left');
  text(xStart - 10, q1y - 15, 'q1: |1⟩', '#a78bfa', 13, 'left');

  if (quantumStep >= 1) {
    box(150, q0y - 20, 40, 40, 'H', '#a78bfa');
    box(150, q1y - 20, 40, 40, 'H', '#a78bfa');
    text(200, 40, 'Estado: superposición', '#a78bfa', 13, 'left');
  }

  if (quantumStep >= 2) {
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(280, q0y - 60, 90, (q1y - q0y) + 100);
    ctx.setLineDash([]);
    text(325, q0y - 70, 'Uf', '#f59e0b', 13, 'center');

    if (oracle.gate.includes('CNOT')) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(325, q0y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(325, q0y); ctx.lineTo(325, q1y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(325, q1y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(313, q1y); ctx.lineTo(337, q1y);
      ctx.moveTo(325, q1y - 12); ctx.lineTo(325, q1y + 12);
      ctx.stroke();
    }
    if (oracle.gate.includes('X en q1')) {
      box(350, q1y - 20, 30, 40, 'X', '#f59e0b');
    }
    text(200, 60, `Oráculo aplicado: ${oracle.gate}`, '#f59e0b', 12, 'left');
  }

  if (quantumStep >= 3) {
    box(430, q0y - 20, 40, 40, 'H', '#a78bfa');
    text(200, 80, 'Interferencia sobre q0', '#a78bfa', 13, 'left');
  }

  if (quantumStep >= 4) {
    const resultado = expectedMeasurement(A, B);
    const color = resultado === 0 ? '#34d399' : '#f87171';
    box(500, q0y - 20, 50, 40, 'M', color);
    text(560, q0y + 5, `c0 = ${resultado}`, color, 16, 'left');
    text(200, 100,
      resultado === 0 ? 'Colapso → función CONSTANTE' : 'Colapso → función BALANCEADA',
      color, 13, 'left');
  }
}

function updateQuantumStats() {
  const { x: A, y: B, nombre } = activo();
  const stateEl = document.getElementById('q-stat-state');
  const classEl = document.getElementById('q-stat-class');
  const msg = document.getElementById('quantum-result');
  const oracle = getOracle(A, B);

  document.getElementById('q-stat-par').textContent = nombre;

  const estados = [
    '|0⟩|1⟩ (inicial)',
    'Superposición (tras H)',
    `Oráculo aplicado (${oracle.gate})`,
    'Interferencia (tras 2ª H)',
    'Colapsado (medido)'
  ];
  stateEl.textContent = estados[quantumStep];

  if (quantumStep >= 4) {
    const resultado = expectedMeasurement(A, B);
    classEl.textContent = resultado === 0 ? 'Constante' : 'Balanceada';
    msg.textContent = resultado === 0
      ? '✓ f constante → los sensores del par tienen el mismo estado.'
      : '⚠️ f balanceada → los sensores del par tienen estados diferentes.';
  } else {
    classEl.textContent = '—';
    msg.textContent = '';
  }
}

// ===== SINCRONIZAR BOTONES DE TOGGLE CON EL PAR ACTIVO =====
function syncToggleButtons() {
  const p = activo();
  document.getElementById('label-a').textContent = p.labelX;
  document.getElementById('label-b').textContent = p.labelY;
  document.getElementById('toggle-a').textContent = p.x;
  document.getElementById('toggle-b').textContent = p.y;
}

// ===== CONTROLES =====
function redraw() {
  if (currentMode === 'classic') drawClassic(); else drawQuantum();
}

function onModeChange(mode) {
  currentMode = mode;
  redraw();
}

// Selector de par activo
document.querySelectorAll('.par-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.par-tab').forEach(t => t.classList.remove('current'));
    tab.classList.add('current');
    parActivo = tab.dataset.par;
    classicStep = 0; quantumStep = 0;
    syncToggleButtons();
    updateClassicStats(); updateQuantumStats(); redraw();
  });
});

document.getElementById('toggle-a').addEventListener('click', (e) => {
  activo().x = activo().x === 0 ? 1 : 0;
  e.target.textContent = activo().x;
  classicStep = 0; quantumStep = 0;
  updateClassicStats(); updateQuantumStats(); redraw();
});

document.getElementById('toggle-b').addEventListener('click', (e) => {
  activo().y = activo().y === 0 ? 1 : 0;
  e.target.textContent = activo().y;
  classicStep = 0; quantumStep = 0;
  updateClassicStats(); updateQuantumStats(); redraw();
});

// Clásico
document.getElementById('c-btn-start').addEventListener('click', () => {
  classicStep = 3; drawClassic(); updateClassicStats();
});
document.getElementById('c-btn-step').addEventListener('click', () => {
  classicStep = Math.min(classicStep + 1, 3);
  drawClassic(); updateClassicStats();
});
document.getElementById('c-btn-reset').addEventListener('click', () => {
  classicStep = 0; drawClassic(); updateClassicStats();
});

// Cuántico
document.getElementById('q-btn-start').addEventListener('click', () => {
  quantumStep = 3; drawQuantum(); updateQuantumStats();
});
document.getElementById('q-btn-step').addEventListener('click', () => {
  quantumStep = Math.min(quantumStep + 1, 3);
  drawQuantum(); updateQuantumStats();
});
document.getElementById('q-btn-measure').addEventListener('click', () => {
  if (quantumStep >= 3) { quantumStep = 4; drawQuantum(); updateQuantumStats(); }
});
document.getElementById('q-btn-reset').addEventListener('click', () => {
  quantumStep = 0; drawQuantum(); updateQuantumStats();
});

// ===== INICIO =====
syncToggleButtons();
drawClassic();
updateClassicStats();
updateQuantumStats();