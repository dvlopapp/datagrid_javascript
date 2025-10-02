import { parseDemands1D, optimizeCutting1D } from './core/optimizer1d.js';
import { parsePieces2D, optimizeGuillotine2D } from './core/optimizer2d.js';
import { drawBarsPlan } from './ui/draw1d.js';
import { drawSheetsPlan } from './ui/draw2d.js';
import { saveJson, exportCanvasPng } from './ui/export.js';
import { setupTabs } from './ui/tabs.js';
import { loadSample1D, loadSample2D } from './data/samples.js';
import { saveState1D, loadState1D, saveState2D, loadState2D } from './ui/storage.js';

setupTabs();

// 1D handlers
const form1D = document.getElementById('form-1d');
const metrics1D = document.getElementById('metrics1D');
const canvas1D = document.getElementById('canvas1D');

form1D.addEventListener('submit', (e) => {
  e.preventDefault();
  const stockLength = Number(document.getElementById('stockLength1D').value);
  const kerf = Number(document.getElementById('kerf1D').value);
  const trimStart = Number(document.getElementById('trimStart1D').value);
  const trimEnd = Number(document.getElementById('trimEnd1D').value);
  const demands = parseDemands1D(document.getElementById('demands1D').value);
  saveState1D({ stockLength, kerf, trimStart, trimEnd, text: document.getElementById('demands1D').value });
  const plan = optimizeCutting1D({ stockLength, kerf, trimStart, trimEnd, demands });
  drawBarsPlan(canvas1D, plan, { stockLength, kerf, trimStart, trimEnd });
  const wastePct = (plan.totalWaste / (plan.numBars * stockLength)) * 100 || 0;
  metrics1D.textContent = `Barras: ${plan.numBars} | Uso: ${(100 - wastePct).toFixed(2)}% | Desperdicio: ${wastePct.toFixed(2)}%`;
});

document.getElementById('loadSample1D').addEventListener('click', () => {
  const { stockLength, kerf, trimStart, trimEnd, text } = loadSample1D();
  document.getElementById('stockLength1D').value = stockLength;
  document.getElementById('kerf1D').value = kerf;
  document.getElementById('trimStart1D').value = trimStart;
  document.getElementById('trimEnd1D').value = trimEnd;
  document.getElementById('demands1D').value = text;
});

document.getElementById('exportPlan1D').addEventListener('click', () => {
  const stockLength = Number(document.getElementById('stockLength1D').value);
  const kerf = Number(document.getElementById('kerf1D').value);
  const trimStart = Number(document.getElementById('trimStart1D').value);
  const trimEnd = Number(document.getElementById('trimEnd1D').value);
  const demands = parseDemands1D(document.getElementById('demands1D').value);
  const plan = optimizeCutting1D({ stockLength, kerf, trimStart, trimEnd, demands });
  saveJson(plan, 'plan-1d.json');
});

document.getElementById('exportPng1D').addEventListener('click', () => {
  exportCanvasPng(canvas1D, 'plan-1d.png');
});

// 2D handlers
const form2D = document.getElementById('form-2d');
const metrics2D = document.getElementById('metrics2D');
const canvas2D = document.getElementById('canvas2D');

form2D.addEventListener('submit', (e) => {
  e.preventDefault();
  const width = Number(document.getElementById('sheetWidth').value);
  const height = Number(document.getElementById('sheetHeight').value);
  const kerf = Number(document.getElementById('kerf2D').value);
  const allowRotate = document.getElementById('allowRotate').checked;
  const pieces = parsePieces2D(document.getElementById('pieces2D').value);
  saveState2D({ sheet: { width, height }, kerf, allowRotate, text: document.getElementById('pieces2D').value });
  const plan = optimizeGuillotine2D({ sheet: { width, height }, kerf, allowRotate, pieces });
  drawSheetsPlan(canvas2D, plan, { width, height, kerf });
  const usedArea = plan.sheets.reduce((acc, s) => acc + s.placed.reduce((a,p)=>a+p.w*p.h,0), 0);
  const totalArea = plan.sheets.length * width * height;
  const wastePct = ((totalArea - usedArea) / totalArea) * 100 || 0;
  metrics2D.textContent = `Planchas: ${plan.sheets.length} | Uso: ${(100 - wastePct).toFixed(2)}% | Desperdicio: ${wastePct.toFixed(2)}%`;
});

document.getElementById('loadSample2D').addEventListener('click', () => {
  const { sheet, kerf, allowRotate, text } = loadSample2D();
  document.getElementById('sheetWidth').value = sheet.width;
  document.getElementById('sheetHeight').value = sheet.height;
  document.getElementById('kerf2D').value = kerf;
  document.getElementById('allowRotate').checked = allowRotate;
  document.getElementById('pieces2D').value = text;
});

document.getElementById('exportPlan2D').addEventListener('click', () => {
  const width = Number(document.getElementById('sheetWidth').value);
  const height = Number(document.getElementById('sheetHeight').value);
  const kerf = Number(document.getElementById('kerf2D').value);
  const allowRotate = document.getElementById('allowRotate').checked;
  const pieces = parsePieces2D(document.getElementById('pieces2D').value);
  const plan = optimizeGuillotine2D({ sheet: { width, height }, kerf, allowRotate, pieces });
  saveJson(plan, 'plan-2d.json');
});

document.getElementById('exportPng2D').addEventListener('click', () => {
  exportCanvasPng(canvas2D, 'plan-2d.png');
});

// Cargar estado guardado
window.addEventListener('DOMContentLoaded', () => {
  const s1 = loadState1D();
  if(s1){
    document.getElementById('stockLength1D').value = s1.stockLength;
    document.getElementById('kerf1D').value = s1.kerf;
    document.getElementById('trimStart1D').value = s1.trimStart;
    document.getElementById('trimEnd1D').value = s1.trimEnd;
    document.getElementById('demands1D').value = s1.text;
  }
  const s2 = loadState2D();
  if(s2){
    document.getElementById('sheetWidth').value = s2.sheet.width;
    document.getElementById('sheetHeight').value = s2.sheet.height;
    document.getElementById('kerf2D').value = s2.kerf;
    document.getElementById('allowRotate').checked = s2.allowRotate;
    document.getElementById('pieces2D').value = s2.text;
  }
});
