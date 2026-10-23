import { FormEvent, useState } from 'react';
import { ArrowRight, Circle, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound, X } from 'lucide-react';
import { supabase } from './supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setFormError('Those passwords don’t match yet. Give it another try.');
      return;
    }
    setFormError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      if (!supabase) {
        setFormError('Connect Supabase to enable accounts. Follow the setup steps in the project README.');
        return;
      }
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) setNotice('Your account is ready. Welcome to the game!');
        else setNotice('Account created! Check your email to confirm it, then sign in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setIsSignUp((current) => !current);
    setFormError('');
    setNotice('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <main className="login-page">
      <header className="login-topbar">
        <a className="brand" href="#login" aria-label="Little Play Studio home">
          <span className="brand-mark"><X size={18} strokeWidth={3} /><Circle size={17} strokeWidth={2.8} /></span>
          <span>little <b>play</b> studio</span>
        </a>
        <span className="login-top-note">A LITTLE SPACE TO PLAY</span>
      </header>

      <section className="login-layout" id="login">
        <div className="login-welcome">
          <p className="eyebrow"><Sparkles size={14} /> {isSignUp ? 'YOUR NEXT FAVORITE THING' : 'GOOD TO HAVE YOU HERE'}</p>
          <h1>{isSignUp ? <>Let’s make<br />room for <span>you.</span></> : <>Make room<br />for <span>play.</span></>}</h1>
          <p className="login-intro-copy">{isSignUp ? 'Create your little play account and save a spot for your next friendly rivalry.' : 'Your next little brain break is just around the corner. Sign in and let the friendly rivalry begin.'}</p>
          <div className="login-art" aria-hidden="true">
            <div className="art-sparkle sparkle-one">✳</div>
            <div className="art-sparkle sparkle-two">✦</div>
            <div className="art-grid">
              <span className="art-cell art-x"><X strokeWidth={2.5} /></span>
              <span className="art-cell" />
              <span className="art-cell art-o"><Circle strokeWidth={2.5} /></span>
              <span className="art-cell" />
              <span className="art-cell art-x"><X strokeWidth={2.5} /></span>
              <span className="art-cell" />
              <span className="art-cell art-o"><Circle strokeWidth={2.5} /></span>
              <span className="art-cell" />
              <span className="art-cell art-x"><X strokeWidth={2.5} /></span>
            </div>
            <div className="art-caption"><span className="live-dot" /> A GOOD MOVE LOOKS GOOD ON YOU</div>
          </div>
        </div>

        <div className="login-card-wrap">
          <div className="login-card">
            <div className="login-card-heading">
              <span className="login-card-icon">{isSignUp ? <UserRound size={18} /> : <LockKeyhole size={18} />}</span>
              <p className="login-kicker">YOUR CORNER OF THE INTERNET</p>
              <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
              <p className="login-card-copy">{isSignUp ? 'A few details, then you’re ready to play.' : 'Sign in to pick up where the fun begins.'}</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              {isSignUp && <>
                <label className="field-label" htmlFor="display-name">Your name</label>
                <div className="input-wrap">
                  <UserRound size={17} aria-hidden="true" />
                  <input id="display-name" name="name" type="text" autoComplete="name" placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
              </>}
              <label className="field-label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <Mail size={17} aria-hidden="true" />
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>

              <div className="password-label-row">
                <label className="field-label" htmlFor="password">Password</label>
                <span className="password-hint">At least 6 characters</span>
              </div>
              <div className="input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignUp ? 'new-password' : 'current-password'} placeholder={isSignUp ? 'Create a password' : 'Enter your password'} value={password} onChange={(event) => { setPassword(event.target.value); setFormError(''); }} minLength={6} required />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {isSignUp && <>
                <label className="field-label" htmlFor="confirm-password">Confirm password</label>
                <div className="input-wrap">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <input id="confirm-password" name="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Enter your password again" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFormError(''); }} minLength={6} required />
                </div>
              </>}

              {formError && <p className="form-error" role="alert">{formError}</p>}

              {!isSignUp && <div className="login-options">
                <span className="secure-note"><span className="secure-dot" /> Private &amp; secure</span>
              </div>}

              {notice && <p className="form-notice" role="status">{notice}</p>}
              <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'One moment…' : isSignUp ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
            </form>

            {!supabase && <div className="login-disclaimer">Setup required: configure Supabase using the project README.</div>}
          </div>
          <p className="account-switch">{isSignUp ? 'Already have an account?' : 'New around here?'} <button type="button" onClick={switchMode}>{isSignUp ? 'Sign in' : 'Create an account'} <ArrowRight size={13} /></button></p>
        </div>
      </section>

      <footer className="login-footer"><span>MADE FOR A LITTLE FRIENDLY COMPETITION</span><span className="footer-heart">✳</span><span>TAKE TURNS. HAVE FUN.</span></footer>
    </main>
  );
}
