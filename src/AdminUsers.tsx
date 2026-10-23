import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { supabase } from './supabase';

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
};

export default function AdminUsers({ onBack }: { onBack: () => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfiles = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setIsLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, email, display_name, created_at')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (queryError) setError(queryError.message);
      else setProfiles(data ?? []);
      setIsLoading(false);
    };

    void loadProfiles();
    return () => { active = false; };
  }, []);

  return (
    <main className="page-shell admin-page">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Three in a Row home">
          <span className="brand-mark"><Users size={18} /></span>
          <span>little <b>play</b> studio</span>
        </a>
        <button className="logout-button" onClick={onBack}>Back to game</button>
      </header>
      <section className="admin-content">
        <button className="admin-back" onClick={onBack}><ArrowLeft size={15} /> Back to game</button>
        <p className="eyebrow"><Users size={14} /> ADMINISTRATION</p>
        <h1>Player <span>directory.</span></h1>
        <p className="intro-copy admin-intro">Registered accounts and profile details. Passwords are never shown.</p>
        <div className="directory-card">
          <div className="directory-heading"><div><h2>All players</h2><p>{profiles.length} registered {profiles.length === 1 ? 'player' : 'players'}</p></div><span className="directory-badge">ADMIN VIEW</span></div>
          {isLoading ? <p className="directory-message">Loading player profiles…</p> : error ? <p className="directory-error" role="alert">{error}. Confirm the profile table and admin policy are set up as described in README.</p> : profiles.length === 0 ? <p className="directory-message">No player profiles yet.</p> : (
            <div className="directory-table-wrap"><table className="directory-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id}><td>{profile.display_name || '—'}</td><td>{profile.email}</td><td>{new Date(profile.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
          )}
        </div>
      </section>
      <footer className="footer"><span>PRIVATE PLAYER DETAILS</span><span className="footer-heart">✳</span><span>ADMIN ACCESS ONLY</span></footer>
    </main>
  );
}
