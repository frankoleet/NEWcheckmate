import { ResultsCelebration } from './ResultsCelebration';
import { Trophy, Medal, Check, Download } from 'lucide-react';
import { points, standings, type Tournament } from './core';

export function TournamentResults({ tournament, onExport }: { tournament: Tournament; onExport: () => void }) {
  const rows = standings(tournament);
  const ranks = [...new Set(rows.filter(row => row.rank <= 5).map(row => row.rank))];
  const medals = ['gold', 'silver', 'bronze'];
  
  return <section className="final-results" aria-labelledby="results-title"><ResultsCelebration/>
    <div className="results-hero">
      <span className="results-complete"><Check size={16}/> Все партии завершены</span>
      <div className="results-cup"><Trophy size={46} strokeWidth={1.5}/></div>
      <div className="eyebrow">ПОЗДРАВЛЯЕМ УЧАСТНИКОВ</div>
      <h2 id="results-title">Итоги турнира</h2>
      <p className="results-name">{tournament.name}</p>
      <p>{tournament.players.length} участников · {Object.keys(tournament.results).length} сыгранных матчей</p>
    </div>
    <div className="results-places">
      {ranks.map(rank => {
        const players = rows.filter(row => row.rank === rank);
        return <article key={rank} className={`result-place ${rank <= 3 ? medals[rank - 1] : 'runner-up'}`} data-rank={rank}>
          <div className="place-heading"><span className="place-medal">{rank <= 3 ? <Medal size={30}/> : <span>{rank}</span>}</span><div><h3>{rank} место</h3><p>{players.length > 1 ? 'Разделили место' : rank === 1 ? 'Победитель турнира' : rank <= 3 ? 'Призёр турнира' : 'В первой пятёрке'}</p></div></div>
          <div className="place-players">{players.map(player => <div className="result-player" key={player.id}>
            <div className="result-player-heading"><h4>{player.name}</h4><div className="result-total"><b>{points(player.points)}</b><span>очки</span></div></div>
            <div className="result-record"><span>Победы: <b>{player.wins}</b></span><span>Ничьи: <b>{player.draws}</b></span><span>Поражения: <b>{player.losses}</b></span></div>
          </div>)}</div>
        </article>;
      })}
    </div>
    <div className="results-note"><p>Места определяются по очкам. При равенстве участники делят место — все они показаны в итогах. Следующее место учитывает число участников выше: например, 1, 1, 3.</p><button onClick={onExport}><Download size={17}/>Сохранить турнир</button></div>
  </section>;
}
