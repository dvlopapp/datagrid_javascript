const KEY1 = 'optimizer_1d';
const KEY2 = 'optimizer_2d';

export function saveState1D(params){
  localStorage.setItem(KEY1, JSON.stringify(params));
}
export function loadState1D(){
  try{ return JSON.parse(localStorage.getItem(KEY1)) || null; }catch{return null}
}

export function saveState2D(params){
  localStorage.setItem(KEY2, JSON.stringify(params));
}
export function loadState2D(){
  try{ return JSON.parse(localStorage.getItem(KEY2)) || null; }catch{return null}
}
