export function drawSheetsPlan(canvas, plan, cfg){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const { width, height, kerf } = cfg;
  const padding = 16;
  const sheetGap = 24;
  const scale = Math.min(
    (canvas.width - padding*2) / width,
    (canvas.height - padding*2) / (height * plan.sheets.length + sheetGap*(plan.sheets.length-1))
  );

  ctx.font = '12px system-ui';
  ctx.textBaseline = 'middle';

  plan.sheets.forEach((s, idx)=>{
    const offsetY = padding + idx * (height*scale + sheetGap);
    // Sheet
    ctx.fillStyle = '#1b2440';
    ctx.fillRect(padding, offsetY, width*scale, height*scale);

    // Placed pieces
    for(const p of s.placed){
      const hue = (p.w * 7 + p.h * 13) % 360;
      ctx.fillStyle = `hsl(${hue},60%,55%)`;
      ctx.fillRect(padding + p.x*scale, offsetY + p.y*scale, p.w*scale, p.h*scale);
      ctx.fillStyle = '#0b0e1b';
      ctx.fillRect(padding + (p.x + p.w)*scale, offsetY + p.y*scale, kerf*scale, p.h*scale);
      ctx.fillRect(padding + p.x*scale, offsetY + (p.y + p.h)*scale, p.w*scale + kerf*scale, kerf*scale);
      ctx.fillStyle = '#e6e9f2';
      ctx.fillText(`${Math.round(p.w)}x${Math.round(p.h)}`, padding + (p.x + 4)*scale, offsetY + (p.y + p.h/2)*scale);
    }

    ctx.strokeStyle = '#5dd0ff';
    ctx.strokeRect(padding, offsetY, width*scale, height*scale);
    ctx.fillStyle = '#98a2b3';
    ctx.fillText(`Plancha #${idx+1}`, padding, offsetY - 6);
  });
}
