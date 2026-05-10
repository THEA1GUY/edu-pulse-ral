import { useState, useRef, useEffect } from 'react';
import './App.css';
import DemoOne from './demo';
import { motion } from 'motion/react';
import { Globe, BarChart3, Zap, Cpu, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import Switch from '@/components/ui/switch';
import ButtonSocialIconDemo from '@/components/ui/social-icon';
import logo from './assets/logo.jpg';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type QuizState = 'landing' | 'auth' | 'teacher_dashboard' | 'generating' | 'student_quiz' | 'grading' | 'results' | 'insights';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  translation?: string;
}

function App() {
  const [viewState, setViewState] = useState<QuizState>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [topic, setTopic] = useState('Photosynthesis');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [targetLanguage, setTargetLanguage] = useState('Hausa');
  const [isBilingual, setIsBilingual] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [fileName, setFileName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Test connection
    const testConnection = async () => {
      const { data, error } = await supabase.from('connection_test').select('*').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error.message);
      } else {
        console.log('Supabase connection test successful!', data);
      }
    };
    testConnection();

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setTopic(file.name.split('.')[0]); // Default topic to filename
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // If sign up successful, we need to create a profile
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: email.split('@')[0],
            role: 'teacher' // Default to teacher for now
          });
        }
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setViewState('teacher_dashboard');
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setViewState('landing');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!session) {
      setViewState('auth');
      return;
    }

    setViewState('generating');
    
    try {
      // 1. Create the Quiz Entry
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          teacher_id: session.user.id,
          topic: topic,
          difficulty: difficulty as any,
          language: targetLanguage,
          is_bilingual: isBilingual
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // 2. Generate Questions (Mock AI logic but real DB insert)
      const mockQuestions = [
        {
          quiz_id: quiz.id,
          question_text: `In the process of photosynthesis, what is the primary role of chlorophyll?`,
          translation_text: `A cikin tsarin photosynthesis, mene ne babban aikin chlorophyll?`,
          options: [
            "To absorb water from the soil",
            "To capture light energy from the sun",
            "To convert oxygen into carbon dioxide",
            "To act as a structural component of the plant cell"
          ],
          correct_answer_index: 1
        },
        {
          quiz_id: quiz.id,
          question_text: "Which of the following is considered a product of the light-dependent reactions?",
          translation_text: "Wanne ne daga cikin waɗannan ake ɗauka a matsayin samfurin halayen dogaro da haske?",
          options: [
            "Glucose",
            "Carbon dioxide",
            "ATP and NADPH",
            "Water"
          ],
          correct_answer_index: 2
        },
        {
          quiz_id: quiz.id,
          question_text: "Where precisely does the Calvin cycle take place inside the chloroplast?",
          translation_text: "A ina ne ainihin zagayowar Calvin ke faruwa a cikin chloroplast?",
          options: [
            "Thylakoid membrane",
            "Outer membrane",
            "Stroma",
            "Granum"
          ],
          correct_answer_index: 2
        }
      ];

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .insert(mockQuestions)
        .select();

      if (questionsError) throw questionsError;

      // Map DB questions back to local state format
      setQuestions(questionsData.map(q => ({
        id: q.id,
        quizId: q.quiz_id,
        text: q.question_text,
        translation: q.translation_text,
        options: q.options,
        correctAnswerIndex: q.correct_answer_index
      })));
      
      setViewState('student_quiz');
      setCurrentQuestionIdx(0);
      setAnswers({});

    } catch (error: any) {
      console.error("Error generating quiz:", error.message);
      alert("Failed to generate quiz in database. Make sure you have run the schema SQL.");
      setViewState('teacher_dashboard');
    }
  };

  const handleSelectAnswer = (optIndex: number) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optIndex });
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setViewState('grading');
      
      // Save attempt to Supabase
      if (session) {
        try {
          // Find the quiz ID from the first question (they all share the same quiz_id)
          // We need to fetch the quiz_id which we stored in the question objects earlier
          // Wait, I mapped them to local 'id' in questions array, but I need the quiz_id.
          // Let's assume the questions state has the quiz_id or we track it.
          // I'll update the questions state mapping to include quiz_id.
          
          const quizId = (questions[0] as any).quizId;
          const score = calculateScore();
          
          await supabase.from('attempts').insert({
            quiz_id: quizId,
            student_id: session.user.id,
            score: score,
            answers: answers,
            feedback: `Performance: ${score}% on ${topic}`
          });
        } catch (error) {
          console.error("Error saving attempt:", error);
        }
      }

      setTimeout(() => {
        setViewState('results');
      }, 2000);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q: Question, idx: number) => {
      if (answers[idx] === q.correctAnswerIndex) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  return (
    <div className="app-container">
      <nav className="nav-bar">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="logo" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => setViewState('landing')}>
            <img src={logo} alt="Logo" style={{height: '40px', width: 'auto'}} />
          </div>
          {viewState !== 'landing' && (
            <div className="tabs-container">
              <button 
                className={`tab-btn ${viewState === 'teacher_dashboard' ? 'active' : ''}`}
                onClick={() => setViewState('teacher_dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`tab-btn ${viewState === 'insights' ? 'active' : ''}`}
                onClick={() => setViewState('insights')}
              >
                Insights
              </button>
            </div>
          )}
          <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
             {session ? (
               <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                 <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                   <User size={14} />
                   {session.user.email}
                 </div>
                 <button className="tab-btn" onClick={handleSignOut} style={{padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                   <LogOut size={14} /> Sign Out
                 </button>
               </div>
             ) : (
               <button className="btn-primary" onClick={() => setViewState('auth')} style={{padding: '0.6rem 1.5rem', width: 'auto', fontSize: '0.9rem'}}>
                 <LogIn size={16} /> Teacher Login
               </button>
             )}
             <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <Moon size={14} className={theme === 'dark' ? 'text-primary' : 'text-muted'} />
                <Switch 
                  checked={theme === 'light'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')} 
                />
                <Sun size={14} className={theme === 'light' ? 'text-yellow-400' : 'text-muted'} />
             </div>
          </div>
        </div>
      </nav>

      {/* LANDING VIEW */}
      {viewState === 'landing' && (
        <div className="landing-page">
          <DemoOne onLaunch={() => setViewState('teacher_dashboard')} theme={theme} />
          
          <div className="container">
            {/* PLATFORM EMPHASIS / IMPACT SECTION */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="impact-section"
            >
              <div className="impact-grid">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="impact-content"
                >
                  <div className="badge-ai mb-4" style={{width: 'fit-content'}}>The Agentic Edge</div>
                  <h2 className="section-title text-left">Why EDU•PULSE?</h2>
                  <p className="section-subtitle text-left">
                    We're not just another quiz tool. We are an <strong>Agentic Reasoning Engine</strong> that understands context, language nuances, and student performance patterns.
                  </p>
                  
                  <ul className="impact-list">
                    <motion.li whileHover={{ x: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <div className="impact-icon-small"><Cpu size={18} /></div>
                      <div>
                        <strong>Autonomous Curation</strong>
                        <p>Our AI agents don't just extract; they reason through your material to create pedagogically sound assessments.</p>
                      </div>
                    </motion.li>
                    <motion.li whileHover={{ x: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <div className="impact-icon-small"><Globe size={18} /></div>
                      <div>
                        <strong>True Localization</strong>
                        <p>Bridging the cognitive gap by allowing students to toggle between English and their mother tongue seamlessly.</p>
                      </div>
                    </motion.li>
                    <motion.li whileHover={{ x: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <div className="impact-icon-small"><BarChart3 size={18} /></div>
                      <div>
                        <strong>Predictive Analytics</strong>
                        <p>Move from "what happened" to "what will happen" with AI that identifies future intervention groups.</p>
                      </div>
                    </motion.li>
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="impact-visual"
                >
                  <div className="visual-card-stack">
                    <div className="visual-card card-1">
                      <div className="card-header-mock">
                        <div className="dot"></div>
                        <div className="line"></div>
                      </div>
                      <div className="card-body-mock">
                        <div className="skeleton-line w-full"></div>
                        <div className="skeleton-line w-3/4"></div>
                        <div className="skeleton-line w-1/2"></div>
                      </div>
                    </div>
                    <div className="visual-card card-2">
                      <Zap className="text-yellow-400" size={32} />
                      <div className="text-xs font-bold mt-2">AI CURATOR ACTIVE</div>
                    </div>
                    <div className="visual-card card-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold">LIVE INSIGHTS</span>
                      </div>
                      <div className="flex gap-1 h-8 items-end">
                        <div className="w-1 bg-emerald-500/40 h-1/2"></div>
                        <div className="w-1 bg-emerald-500/60 h-3/4"></div>
                        <div className="w-1 bg-emerald-500 h-full"></div>
                        <div className="w-1 bg-emerald-500/80 h-2/3"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="features-section"
            >
              <div className="section-header">
                <h2 className="section-title">Built for the Future</h2>
                <p className="section-subtitle">Everything you need to modernize your assessment workflow.</p>
              </div>
              <div className="features-grid">
                {[
                  { icon: <Zap />, title: "Instant Generation", desc: "Upload a PDF or image and our Curator Agent builds a tailored quiz instantly." },
                  { icon: <Globe />, title: "Bilingual Support", desc: "Bridging the language gap with side-by-side localization in major mother tongues." },
                  { icon: <BarChart3 />, title: "Deep Insights", desc: "Identify knowledge gaps and intervention groups with AI-driven analytics." }
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.1)" }}
                    className="feature-card"
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="how-it-works-wrapper"
            >
              <div className="glass-panel how-it-works">
                <div className="section-header mb-12">
                  <h2 className="text-2xl font-bold">The Three-Step Workflow</h2>
                </div>
                <div className="steps-container">
                  {[
                    { num: "01", title: "Upload", desc: "Drop your lecture notes or textbooks." },
                    { num: "02", title: "Configure", desc: "Set logic, language, and difficulty." },
                    { num: "03", title: "Ship", desc: "Deploy to students and track progress." }
                  ].map((step, idx) => (
                    <div key={idx} className="step-group">
                      <div className="step">
                        <div className="step-num">{step.num}</div>
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                      {idx < 2 && <div className="step-divider"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <footer className="landing-footer">
              <div className="flex items-center">
                <img src={logo} alt="Logo" style={{height: '32px', width: 'auto'}} />
              </div>
              <ButtonSocialIconDemo />
              <div className="text-sm opacity-60">© 2026 EDU•PULSE. All rights reserved.</div>
            </footer>
          </div>
        </div>
      )}

      {/* AUTH VIEW */}
      {viewState === 'auth' && (
        <div className="container pt-32">
          <div className="glass-panel" style={{maxWidth: '450px'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>{isSignUp ? 'Join the Lab' : 'Welcome Back'}</h2>
              <p style={{color: 'var(--text-muted)'}}>{isSignUp ? 'Create your teacher account' : 'Sign in to manage your assessments'}</p>
            </div>
            
            <form onSubmit={handleAuth} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {authError && (
                <div style={{color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                  {authError}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0'}}>
                <div style={{flex: 1, height: '1px', background: 'var(--glass-border)'}}></div>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>OR</span>
                <div style={{flex: 1, height: '1px', background: 'var(--glass-border)'}}></div>
              </div>

              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleGoogleSignIn}
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%'}}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </form>

            <div style={{textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
              {isSignUp ? 'Already have an account?' : 'New to EDU•PULSE?'}
              <button 
                style={{background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer'}}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {viewState === 'teacher_dashboard' && (
        <div className="container pt-32">
          <header className="header">
            <h1 className="animate-in">Create Adaptive Assessment</h1>
            <p>Upload source material and let AI generate personalized quizzes in seconds.</p>
          </header>
          <main className="glass-panel">
            <div className="form-grid">
              <div className="form-group">
                <label>Topic / Subject</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Quantum Physics"
                />
              </div>
              <div className="form-group">
                <label>Difficulty Logic</label>
                <select 
                  className="input-field"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner (Recall)</option>
                  <option value="Intermediate">Intermediate (Apply)</option>
                  <option value="Advanced">Advanced (Evaluate)</option>
                </select>
              </div>
            </div>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{display: 'none'}} 
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              <div className="upload-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <div style={{fontWeight: 700}}>{fileName || 'Drag & Drop Source File'}</div>
              <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Supports PDF, PNG, JPG (Max 10MB)</div>
            </div>
            <div className="localization-bar">
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontWeight: 700, fontSize: '0.9rem'}}>Mother Tongue Localization</span>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Enable bilingual side-by-side view</span>
              </div>
              <div className="toggle-group">
                <select 
                  className="input-field" 
                  style={{padding: '0.4rem 1rem', fontSize: '0.8rem'}}
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  <option value="Hausa">Hausa</option>
                  <option value="Yoruba">Yoruba</option>
                  <option value="Igbo">Igbo</option>
                </select>
                <label className="switch">
                  <input type="checkbox" checked={isBilingual} onChange={() => setIsBilingual(!isBilingual)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            <button className="btn-primary" onClick={handleGenerateQuiz}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Generate AI Assessment
            </button>
          </main>
        </div>
      )}

      {/* GENERATING VIEW */}
      {viewState === 'generating' && (
        <div className="container pt-32">
          <div className="glass-panel loader-container">
            <div className="loader"></div>
            <div style={{textAlign: 'center'}}>
              <h2>Engaging Curator Agent...</h2>
              <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Parsing "{topic}" and generating {difficulty} level {targetLanguage} translations.</p>
            </div>
            <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden'}}>
               <div style={{width: '60%', height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ VIEW */}
      {viewState === 'student_quiz' && questions.length > 0 && (
        <div className="container pt-32">
          <div className="glass-panel">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Assessment</div>
                <div style={{fontSize: '1.25rem', fontWeight: 800}}>{topic}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '1.5rem', fontWeight: 800}}>{currentQuestionIdx + 1} / {questions.length}</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Progress</div>
              </div>
            </div>
            <div className="question-card">
              <h3 className="question-text">{questions[currentQuestionIdx].text}</h3>
              {isBilingual && (
                <div style={{marginTop: '-1rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', color: 'var(--primary)', fontStyle: 'italic', fontSize: '1.1rem'}}>
                  {questions[currentQuestionIdx].translation}
                </div>
              )}
              <div className="options-grid">
                {questions[currentQuestionIdx].options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    className={`option-btn ${answers[currentQuestionIdx] === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectAnswer(idx)}
                  >
                    <div className="option-indicator">{String.fromCharCode(65 + idx)}</div>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={handleNextQuestion}
              disabled={answers[currentQuestionIdx] === undefined}
              style={{opacity: answers[currentQuestionIdx] === undefined ? 0.4 : 1}}
            >
              {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
            </button>
          </div>
        </div>
      )}

      {/* GRADING VIEW */}
      {viewState === 'grading' && (
        <div className="container pt-32">
          <div className="glass-panel loader-container">
            <div className="loader"></div>
            <h2>Analyzing Performance...</h2>
            <p style={{color: 'var(--text-muted)'}}>Cross-referencing responses with linguistic confidence scores.</p>
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {viewState === 'results' && (
        <div className="container pt-32">
          <div className="glass-panel" style={{textAlign: 'center'}}>
            <h2 style={{fontSize: '2rem'}}>Assessment Results</h2>
            <div className="score-circle">{calculateScore()}%</div>
            <p style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>You mastered the core concepts of <strong>{topic}</strong>.</p>
            <div className="ai-feedback-box">
              <div className="ai-feedback-title">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                Adaptive AI Insights
              </div>
              <p style={{color: 'var(--text-main)', opacity: 0.9}}>Based on your performance, you are strong in <strong>Conceptual Application</strong> but showed slight hesitation in <strong>Structural Definitions</strong> during the {targetLanguage} bilingual sections.</p>
              <div className="recommendations">
                <div className="recommendation-item">
                  <span style={{fontWeight: 800, color: 'var(--secondary)'}}>Focus Area:</span> Review the Stroma's role in the Calvin cycle to improve recall speed.
                </div>
                <div className="recommendation-item">
                  <span style={{fontWeight: 800, color: 'var(--secondary)'}}>Suggested Study:</span> Visualizing light-dependent reactions via SVG diagrams.
                </div>
              </div>
            </div>
            <div style={{marginTop: '2.5rem', display: 'flex', gap: '1rem'}}>
               <button className="btn-primary" onClick={() => setViewState('teacher_dashboard')}>New Assessment</button>
               <button className="btn-secondary">Download PDF Report</button>
            </div>
          </div>
        </div>
      )}

      {/* INSIGHTS VIEW (MOCK) */}
      {viewState === 'insights' && (
        <div className="container pt-32">
          <div className="glass-panel">
            <h2>Classroom Intelligence</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Knowledge heatmap based on recent adaptive assessments.</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '2rem'}}>
               {Array.from({length: 25}).map((_, i) => (
                  <div key={i} style={{
                    height: '40px', 
                    borderRadius: '4px', 
                    background: `rgba(16, 185, 129, ${0.2 + Math.random() * 0.8})`,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}></div>
               ))}
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)'}}>
               <h4 style={{marginBottom: '1rem'}}>Intervention Groups</h4>
               <div style={{display: 'flex', gap: '2rem'}}>
                  <div style={{flex: 1}}>
                     <div style={{color: 'var(--warning)', fontWeight: 800}}>Needs Visual Supplement (8)</div>
                     <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Students struggling with text-only logic.</div>
                  </div>
                  <div style={{flex: 1}}>
                     <div style={{color: 'var(--success)', fontWeight: 800}}>Mastery (14)</div>
                     <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Ready for evaluation-level challenges.</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
