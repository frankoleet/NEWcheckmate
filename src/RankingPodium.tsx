import { Trophy, Medal } from 'lucide-react';
import { points, standings } from './core';
export const placeNames = ['Первое место', 'Второе место', 'Третье место'];
export function RankingPodium({ rows }: { rows: ReturnType<typeof standings> }) {
 return <div className="ranking-podium winners" aria-label="Призовые места">{placeNames.map((title,index)=>{
  const players=rows.filter(p=>p.rank===index+1);
  return <article className={`podium-summary prize-${index+1}${players.length?'':' unassigned'}`} key={title}>
   <div className="podium-summary-title">{index===0?<Trophy size={23}/>:<Medal size={23}/>}<h3>{title}</h3></div>
   {players.length?<><strong className="podium-names">{players.map(p=>p.name).join(', ')}</strong><div className="podium-summary-footer"><span>Очки: <b>{points(players[0].points)}</b></span><span>{players.length>1?'Разделили место':index===0?'Победитель':'Призёр'}</span></div></>:<p className="podium-empty">{index+1>rows.length?'В турнире меньше участников.':'Не присуждается: участники выше разделили место.'}</p>}
  </article>;
 })}</div>;
}
