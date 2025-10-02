export function saveJson(obj, filename){
  const blob = new Blob([JSON.stringify(obj,null,2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 0);
}

export function exportCanvasPng(canvas, filename){
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
}
