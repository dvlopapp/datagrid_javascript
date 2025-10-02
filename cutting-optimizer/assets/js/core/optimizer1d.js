export function parseDemands1D(text){
  return text
    .split(/\n+/)
    .map(l=>l.trim())
    .filter(Boolean)
    .map(l=>{
      const m = l.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+)/);
      if(!m) return null;
      return { length: Number(m[1]), qty: Number(m[2]) };
    })
    .filter(Boolean);
}

// Heurística Best-Fit Decreasing con kerf y pérdidas
export function optimizeCutting1D({ stockLength, kerf=0, trimStart=0, trimEnd=0, demands }){
  const pieces = [];
  for(const d of demands){
    for(let i=0;i<d.qty;i++) pieces.push(d.length);
  }
  pieces.sort((a,b)=>b-a);

  const bars = [];
  for(const length of pieces){
    let bestIndex = -1;
    let bestRemainder = Infinity;
    for(let i=0;i<bars.length;i++){
      const bar = bars[i];
      const needed = (bar.cuts.length>0 ? kerf : 0) + length; // kerf entre piezas, no antes de la primera
      if(bar.remaining >= needed){
        const rem = bar.remaining - needed;
        if(rem < bestRemainder){ bestRemainder = rem; bestIndex = i; }
      }
    }
    if(bestIndex===-1){
      const usable = stockLength - trimStart - trimEnd;
      const bar = { remaining: usable, cuts: [] };
      bars.push(bar);
      bestIndex = bars.length - 1;
    }
    const bar = bars[bestIndex];
    if(bar.cuts.length>0) bar.remaining -= kerf;
    bar.cuts.push(length);
    bar.remaining -= length;
  }

  const wastePerBar = bars.map(b=>b.remaining + trimStart + trimEnd);
  const totalWaste = wastePerBar.reduce((a,b)=>a+b,0);
  return { numBars: bars.length, bars: bars.map(b=>({ cuts: b.cuts, remaining: b.remaining })), kerf, trimStart, trimEnd, totalWaste };
}
