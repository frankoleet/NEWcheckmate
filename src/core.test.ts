import { describe, it, expect } from 'vitest';
import { createTournament, schedule, standings, setResult, validateTournament, cleanNames } from './core';
const make=(n:number)=>createTournament('Кубок',Array.from({length:n},(_,i)=>`Игрок ${i+1}`));
describe.each([2,3,15,20])('Круговой турнир: %i участников',n=>{
 it('каждая пара ровно один раз, один матч в туре и правильный отдых',()=>{
  const t=make(n),rounds=schedule(t.players),all=rounds.flatMap(r=>r.matches);
  expect(rounds).toHaveLength(n%2?n:n-1);expect(all).toHaveLength(n*(n-1)/2);
  const pairs=new Set<string>();const counts=new Map<string,number>();const rests=new Map<string,number>();
  for(const r of rounds){expect(r.matches).toHaveLength(Math.floor(n/2));const playing=new Set<string>();for(const m of r.matches){expect(m.a).not.toBe(m.b);for(const id of [m.a,m.b]){expect(playing.has(id)).toBe(false);playing.add(id);counts.set(id,(counts.get(id)||0)+1)}const key=[m.a,m.b].sort().join('|');expect(pairs.has(key)).toBe(false);pairs.add(key)}if(r.rest){expect(playing.has(r.rest)).toBe(false);rests.set(r.rest,(rests.get(r.rest)||0)+1)}else expect(playing.size).toBe(n)}
  for(const p of t.players){expect(counts.get(p.id)).toBe(n-1);expect(rests.get(p.id)||0).toBe(n%2)}
  expect(standings(t).every(p=>p.points===0&&p.played===0&&p.rank===1)).toBe(true);
 });
 it('полный турнир сохраняет сумму очков и число партий',()=>{let t=make(n);const ms=schedule(t.players).flatMap(r=>r.matches);for(const [i,m] of ms.entries())t=setResult(t,m.id,(['1-0','draw','0-1'] as const)[i%3]);const rows=standings(t);expect(rows.reduce((s,p)=>s+p.points,0)).toBe(ms.length);expect(rows.every(p=>p.played===n-1&&p.remaining===0)).toBe(true);expect(validateTournament(JSON.parse(JSON.stringify(t)))).toEqual(t)});
});
it('победы, ничьи, поражения, исправление и очистка без потери других результатов',()=>{let t=make(4);const [a,b]=schedule(t.players)[0].matches;t=setResult(t,a.id,'1-0');t=setResult(t,b.id,'draw');let rows=standings(t);expect(rows.find(p=>p.id===a.a)).toMatchObject({points:1,wins:1,played:1});expect(rows.find(p=>p.id===a.b)).toMatchObject({points:0,losses:1});expect(rows.find(p=>p.id===b.a)).toMatchObject({points:0.5,draws:1,rank:2});expect(rows.find(p=>p.id===b.b)?.rank).toBe(2);const original=t;t=setResult(t,a.id,'0-1');expect(original.results[a.id]).toBe('1-0');expect(standings(t).find(p=>p.id===a.b)?.wins).toBe(1);t=setResult(t,a.id,null);expect(t.results).toEqual({[b.id]:'draw'});expect(standings(t).find(p=>p.id===a.a)?.played).toBe(0)});
it('отклоняет повреждённые файлы и результаты',()=>{const t=make(15);for(const bad of [null,{}, {...t,version:2},{...t,results:[]},{...t,results:{r0m1:'win'}},{...t,results:{unknown:'draw'}},{...t,players:[t.players[0],t.players[0]]},{...t,createdAt:'bad'}, {...t,players:[{id:'a',name:'Игрок'},{id:'b',name:'игрок'}]}])expect(()=>validateTournament(bad)).toThrow();expect(()=>setResult(t,'unknown','draw')).toThrow();expect(()=>setResult(t,'r0m1','bad' as never)).toThrow()});
it('пустые строки пропускаются, одинаковые имена отклоняются',()=>{expect(cleanNames([' Анна ','',' Борис '])).toEqual(['Анна','Борис']);expect(()=>cleanNames(['Анна','анна'])).toThrow();expect(()=>createTournament('', ['А','Б'])).toThrow();expect(()=>createTournament('Кубок',['А'])).toThrow()});
