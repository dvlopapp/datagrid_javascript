export function loadSample1D(){
  const stockLength = 6000;
  const kerf = 3;
  const trimStart = 0;
  const trimEnd = 0;
  const text = `1200 x 4\n800 x 3\n450 x 2`;
  return { stockLength, kerf, trimStart, trimEnd, text };
}

export function loadSample2D(){
  const sheet = { width: 2440, height: 1220 };
  const kerf = 3;
  const allowRotate = true;
  const text = `600 x 400 x 4\n300 x 200 x 6`;
  return { sheet, kerf, allowRotate, text };
}
