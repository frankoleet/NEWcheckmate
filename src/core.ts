export type Score = '1-0' | 'draw' | '0-1';
export type Player = { id: string; name: string };
export type Match = { id: string; a: string; b: string; round: number; number: number };
export type Tournament = {version: 1; format: 'round-robin'; name: string; id: string; createdAt: string; players: Player[]; results: Record<string, Score>};
export const points = (n: number) => String(n).replace('.', ',');
export const resultLabel = (s?: Score) => s === 'draw' ? '0,5 : 0,5' : s === '1-0' ? '1 : 0' : s === '0-1' ? '0 : 1' : '— : —';
export function schedule(players: Player[]) {
  if (players.length < 2 || new Set(players.map(p => p.id)).size !== players.length) throw Error('Некорректный состав.');
  const ring: (string | null)[] = players.map(p => p.id);
  if (ring.length % 2) ring.push(null);
  const rounds: {matches: Match[]; rest: string | null}[] = [];
  let number = 0;
  for (let round = 0; round < ring.length - 1; round++) {
    const matches: Match[] = []; let rest: string | null = null;
    for (let i = 0; i < ring.length / 2; i++) {
      let a = ring[i], b = ring[ring.length - 1 - i];
      if (a === null || b === null) { rest = a ?? b; continue; }
      if ((round + i) % 2) [a,b] = [b,a];
      matches.push({id: `r${round}m${i}`, a, b, round, number: ++number});
    }
    rounds.push({matches, rest}); ring.splice(1,0,ring.pop()!);
  }
  return rounds;
}
export function cleanNames(names: string[]) {
  const cleaned = names.map(n => n.trim()).filter(Boolean);
  if (cleaned.some(n => n.length > 200)) throw Error('Имя должно быть не длиннее 200 символов.');
  if (new Set(cleaned.map(n => n.toLocaleLowerCase('ru'))).size !== cleaned.length) throw Error('Имена повторяются. Добавьте фамилию или номер, чтобы различать игроков.');
  if (cleaned.length > 128) throw Error('Максимум 128 участников.');
  return cleaned;
}
export function createTournament(name: string, names: string[]): Tournament {
  const cleaned = cleanNames(names);
  if (!name.trim() || name.length > 100) throw Error('Введите название до 100 символов.');
  if (cleaned.length < 2) throw Error('Добавьте минимум двух игроков.');
  return {version:1, format:'round-robin',name:name.trim(),id:crypto.randomUUID(),createdAt:new Date().toISOString(),players:cleaned.map((name,i)=>({id:`p${i}`,name})),results:{}};
}
export const scoreFor = (s: Score, first: boolean) => s === 'draw' ? 0.5 : s === (first ? '1-0' : '0-1') ? 1 : 0;
export function setResult(t: Tournament, id: string, score: Score | null): Tournament {
  if (score !== null && !['1-0','draw','0-1'].includes(score)) throw Error('Недопустимый результат.');
  if (!schedule(t.players).some(r=>r.matches.some(m=>m.id===id))) throw Error('Матч не найден.');
  const next = {...t,results:{...t.results}};
  if (score === null) delete next.results[id]; else next.results[id] = score;
  return next;
}
export function standings(t: Tournament) {
  const rows = t.players.map(p=>({...p,played:0,remaining:t.players.length-1,points:0,wins:0,draws:0,losses:0,rank:0}));
  const map = new Map(rows.map(r=>[r.id,r]));
  for (const m of schedule(t.players).flatMap(r=>r.matches)) {
    const s = t.results[m.id]; if (!s) continue;
    [m.a,m.b].forEach((id,i)=>{const row=map.get(id)!;const value=scoreFor(s,i===0);row.played++;row.remaining--;row.points+=value;if(value===1)row.wins++;else if(value===0.5)row.draws++;else row.losses++;});
  }
  rows.sort((a,b)=>b.points-a.points);
  rows.forEach((r,i)=>r.rank=i>0&&rows[i-1].points===r.points?rows[i-1].rank:i+1);
  return rows;
}
export function validateTournament(value: unknown): Tournament {
  const v = value as Tournament;
  if (!v || v.version!==1 || v.format!=='round-robin' || typeof v.name!=='string' || !v.name.trim() || v.name.length>100 || typeof v.id!=='string' || !v.id || typeof v.createdAt!=='string' || !Number.isFinite(Date.parse(v.createdAt)) || !Array.isArray(v.players) || v.players.length<2 || v.players.length>128 || !v.results || typeof v.results!=='object' || Array.isArray(v.results)) throw Error('Это не файл кругового турнира.');
  if (!v.players.every(p=>p && typeof p.id==='string' && p.id && typeof p.name==='string' && p.name.trim())) throw Error('Некорректный список игроков.');
  cleanNames(v.players.map(p=>p.name));
  const ids=new Set(schedule(v.players).flatMap(r=>r.matches).map(m=>m.id));
  if (!Object.entries(v.results).every(([id,s])=>ids.has(id)&&['1-0','draw','0-1'].includes(s))) throw Error('Файл содержит некорректные результаты.');
  return {version:1,format:'round-robin',name:v.name,id:v.id,createdAt:v.createdAt,players:v.players.map(p=>({id:p.id,name:p.name})),results:{...v.results}};
}
