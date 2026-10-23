import { useEffect, useState } from 'react';
import { ArrowRight, Circle, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import LoginScreen from './LoginScreen';
import AdminUsers from './AdminUsers';
import { hasSupabaseConfig, supabase } from './supabase';

type Player = 'X' | 'O';
type Cell = Player | null;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board: Cell[]) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { player: board[a]!, line };
  }
  return null;
}

export default function App() {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsAdmin(data.session?.user.app_metadata.role === 'admin');
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAdmin(nextSession?.user.app_metadata.role === 'admin');
      setShowDirectory(false);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase?.auth.signOut();
  };

  if (isLoading) return <main className="auth-loading">Getting your game ready…</main>;
  if (!session) return <LoginScreen />;
  if (showDirectory && isAdmin) return <AdminUsers onBack={() => setShowDirectory(false)} />;

  const displayName = session.user.user_metadata.display_name ?? session.user.email ?? 'Player';
  return <GameScreen userEmail={displayName} isAdmin={isAdmin} onOpenDirectory={() => setShowDirectory(true)} onLogout={logout} />;
}

function GameScreen({ userEmail, isAdmin, onOpenDirectory, onLogout }: { userEmail: string; isAdmin: boolean; onOpenDirectory: () => void; onLogout: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const winner = getWinner(board);
  const draw = !winner && board.every(Boolean);
  const finished = Boolean(winner || draw);

  useEffect(() => {
    if (winner) setScores((current) => ({ ...current, [winner.player]: current[winner.player] + 1 }));
    else if (draw) setScores((current) => ({ ...current, draws: current.draws + 1 }));
  }, [winner?.player, draw]);

  const play = (index: number) => {
    if (board[index] || finished) return;
    setBoard((current) => current.map((cell, i) => i === index ? turn : cell));
    setTurn((current) => current === 'X' ? 'O' : 'X');
  };

  const newRound = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setRound((current) => current + 1);
  };

  const resetMatch = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    setRound(1);
    setBoard(Array(9).fill(null));
    setTurn('X');
  };

  const status = winner
    ? `${winner.player === 'X' ? 'Coral' : 'Mint'} takes the round!`
    : draw ? 'It’s a little too close.' : `${turn === 'X' ? 'Coral' : 'Mint'}’s turn to play`;
  const subtitle = winner ? 'A lovely little victory.' : draw ? 'Nobody loses this one.' : 'Make your move when you’re ready.';

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Three in a Row home">
          <span className="brand-mark"><X size={18} strokeWidth={3} /><Circle size={17} strokeWidth={2.8} /></span>
          <span>little <b>play</b> studio</span>
        </a>
        <div className="game-account"><span className="top-note"><span className="live-dot" /> {userEmail}</span>{isAdmin && <button className="logout-button" onClick={onOpenDirectory}>Users</button>}<button className="logout-button" onClick={() => void onLogout()}>Sign out</button></div>
      </header>

      <section className="game-layout" id="top">
        <div className="intro-column">
          <p className="eyebrow"><Sparkles size={14} /> A moment to play</p>
          <h1>Three in<br />a <span>row.</span></h1>
          <p className="intro-copy">A little friendly rivalry, one square at a time. Find your rhythm, make your move, and enjoy the moment.</p>
          <div className="player-cards" aria-label="Current score">
            <article className={`player-card coral-card ${!finished && turn === 'X' ? 'is-active' : ''}`}>
              <div className="player-card-top"><span className="player-symbol x-symbol"><X size={17} strokeWidth={3} /></span><span className="player-label">PLAYER ONE</span>{winner?.player === 'X' && <Trophy size={15} className="trophy-icon" />}</div>
              <div className="player-card-bottom"><span>Coral</span><strong>{scores.X}</strong></div>
            </article>
            <article className={`player-card mint-card ${!finished && turn === 'O' ? 'is-active' : ''}`}>
              <div className="player-card-top"><span className="player-symbol o-symbol"><Circle size={16} strokeWidth={3} /></span><span className="player-label">PLAYER TWO</span>{winner?.player === 'O' && <Trophy size={15} className="trophy-icon" />}</div>
              <div className="player-card-bottom"><span>Mint</span><strong>{scores.O}</strong></div>
            </article>
          </div>
          <div className="match-meta"><span>ROUND <b>{String(round).padStart(2, '0')}</b></span><span className="meta-divider" /><span>DRAWS <b>{scores.draws}</b></span></div>
        </div>

        <div className="board-column">
          <div className="board-heading">
            <div className="status-copy"><span className={`status-marker ${winner ? 'winner-marker' : draw ? 'draw-marker' : turn === 'X' ? 'coral-marker' : 'mint-marker'}`} />
              <div><h2 aria-live="polite">{status}</h2><p>{subtitle}</p></div>
            </div>
            <span className="round-pill">ROUND {String(round).padStart(2, '0')}</span>
          </div>
          <div className="board-wrap">
            <div className="game-board" role="group" aria-label="Tic Tac Toe board">
              {board.map((cell, index) => {
                const isWinning = winner?.line.includes(index) ?? false;
                return <button key={index} className={`cell ${cell ? `cell-${cell.toLowerCase()}` : ''} ${isWinning ? 'winning-cell' : ''}`} onClick={() => play(index)} disabled={Boolean(cell) || finished} aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}${cell ? `, ${cell === 'X' ? 'Coral' : 'Mint'}` : ', empty'}`}>
                  {cell === 'X' && <X className="mark mark-x" strokeWidth={2.7} aria-hidden="true" />}
                  {cell === 'O' && <Circle className="mark mark-o" strokeWidth={2.7} aria-hidden="true" />}
                  {!cell && <span className="cell-hint" aria-hidden="true">+</span>}
                </button>;
              })}
            </div>
            <div className="board-caption"><span>✳</span> GOOD THINGS HAPPEN ONE MOVE AT A TIME</div>
          </div>
          <div className="game-actions">
            <button className="reset-button" onClick={newRound}><RotateCcw size={16} /> {finished ? 'Play again' : 'Start fresh'} <ArrowRight size={15} className="button-arrow" /></button>
            <button className="text-button" onClick={resetMatch}>Reset score</button>
          </div>
        </div>
      </section>

      <footer className="footer"><span>MADE FOR A LITTLE FRIENDLY COMPETITION</span><span className="footer-heart">✳</span><span>TAKE TURNS. HAVE FUN.</span></footer>
    </main>
  );
}
