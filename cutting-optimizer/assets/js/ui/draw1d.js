export function drawBarsPlan(canvas, plan, cfg){
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const { stockLength, kerf, trimStart, trimEnd } = cfg;
  const padding = 20;
  const barHeight = 24;
  const barGap = 16;
  const scale = (canvas.width - padding*2) / stockLength;

  ctx.font = '12px system-ui';
  ctx.textBaseline = 'middle';

  plan.bars.forEach((bar, idx)=>{
    const y = padding + idx*(barHeight+barGap);
    // Draw stock background
    ctx.fillStyle = '#1b2440';
    ctx.fillRect(padding, y, stockLength*scale, barHeight);

    // Trim zones
    if(trimStart>0){ ctx.fillStyle = '#3a3f5a'; ctx.fillRect(padding, y, trimStart*scale, barHeight);}    
    if(trimEnd>0){ ctx.fillStyle = '#3a3f5a'; ctx.fillRect(padding + (stockLength-trimEnd)*scale, y, trimEnd*scale, barHeight);}

    // Draw pieces
    let cursor = padding + trimStart*scale;
    bar.cuts.forEach((len, i)=>{
      if(i>0 && kerf>0){
        ctx.fillStyle = '#0b0e1b';
        ctx.fillRect(cursor, y, kerf*scale, barHeight);
        cursor += kerf*scale;
      }
      const w = len*scale;
      const hue = (len % 360);
      ctx.fillStyle = `hsl(${hue},60%,55%)`;
      ctx.fillRect(cursor, y, w, barHeight);
      ctx.fillStyle = '#e6e9f2';
      ctx.fillText(`${len}`, cursor+4, y+barHeight/2);
      cursor += w;
    });

    // Remaining
    ctx.strokeStyle = '#5dd0ff';
    ctx.setLineDash([4,3]);
    ctx.strokeRect(cursor, y, (padding + stockLength*scale) - cursor, barHeight);
    ctx.setLineDash([]);

    ctx.fillStyle = '#98a2b3';
    ctx.fillText(`Barra #${idx+1} resto: ${Math.max(0,Math.round(bar.remaining))}mm`, padding, y - 6);
  });
}
