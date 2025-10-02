export function parsePieces2D(text){
  return text
    .split(/\n+/)
    .map(l=>l.trim())
    .filter(Boolean)
    .map(l=>{
      const m = l.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+)/);
      if(!m) return null;
      return { w: Number(m[1]), h: Number(m[2]), qty: Number(m[3]) };
    })
    .filter(Boolean);
}

// Guillotine First-Fit Decreasing (FFD) con espacios libres y kerf
export function optimizeGuillotine2D({ sheet, kerf=0, allowRotate=true, pieces }){
  const expanded = [];
  for(const p of pieces){
    for(let i=0;i<p.qty;i++) expanded.push({ w: p.w, h: p.h, id: `${p.w}x${p.h}` });
  }
  expanded.sort((a,b)=> (b.w*b.h)-(a.w*a.h));

  const sheets = [];
  for(const piece of expanded){
    let placed = false;
    for(const s of sheets){
      if(placeInSheet(s, piece, kerf, allowRotate)){ placed = true; break; }
    }
    if(!placed){
      const s = createEmptySheet(sheet.width, sheet.height);
      sheets.push(s);
      placeInSheet(s, piece, kerf, allowRotate);
    }
  }
  return { sheets };
}

function createEmptySheet(width, height){
  return { width, height, free: [{ x:0, y:0, w:width, h:height }], placed: [] };
}

function fits(space, w, h, kerf){
  return (w + kerf <= space.w) && (h + kerf <= space.h);
}

function placeInSheet(sheet, piece, kerf, allowRotate){
  // First-fit: primer espacio libre donde quepa
  for(let i=0;i<sheet.free.length;i++){
    const space = sheet.free[i];
    const options = [ {w: piece.w, h: piece.h, rotated: false} ];
    if(allowRotate) options.push({ w: piece.h, h: piece.w, rotated: true });

    for(const opt of options){
      if(fits(space, opt.w, opt.h, kerf)){
        // Colocar en la esquina superior izquierda del espacio
        const placed = { x: space.x, y: space.y, w: opt.w, h: opt.h, kerf, rotated: opt.rotated, id: piece.id };
        sheet.placed.push(placed);
        // Subdividir espacio estilo guillotina (corte horizontal y vertical)
        const right = { x: space.x + opt.w + kerf, y: space.y, w: space.w - opt.w - kerf, h: opt.h };
        const bottom = { x: space.x, y: space.y + opt.h + kerf, w: space.w, h: space.h - opt.h - kerf };
        const remain = [];
        if(right.w > 0 && right.h > 0) remain.push(right);
        if(bottom.w > 0 && bottom.h > 0) remain.push(bottom);
        // Reemplazar espacio actual por los restantes
        sheet.free.splice(i,1, ...remain);
        // Normalizar y fusionar espacios simples
        mergeFreeSpaces(sheet);
        return true;
      }
    }
  }
  return false;
}

function mergeFreeSpaces(sheet){
  // Fusión simple por adyacencia exacta horizontal/vertical
  let merged = true;
  while(merged){
    merged = false;
    outer: for(let i=0;i<sheet.free.length;i++){
      for(let j=i+1;j<sheet.free.length;j++){
        const a = sheet.free[i], b = sheet.free[j];
        // Horizontal merge
        if(a.y===b.y && a.h===b.h && a.x + a.w === b.x){
          a.w += b.w; sheet.free.splice(j,1); merged = true; break outer;
        }
        if(b.y===a.y && b.h===a.h && b.x + b.w === a.x){
          b.w += a.w; sheet.free.splice(i,1); merged = true; break outer;
        }
        // Vertical merge
        if(a.x===b.x && a.w===b.w && a.y + a.h === b.y){
          a.h += b.h; sheet.free.splice(j,1); merged = true; break outer;
        }
        if(b.x===a.x && b.w===a.w && b.y + b.h === a.y){
          b.h += a.h; sheet.free.splice(i,1); merged = true; break outer;
        }
      }
    }
  }
}
