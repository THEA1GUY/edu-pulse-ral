import { useState, useRef, useEffect } from 'react';
import './App.css';
import DemoOne from './demo';
import { motion } from 'motion/react';
import { Globe, BarChart3, Zap, Cpu, Sun, Moon } from 'lucide-react';
import Switch from '@/components/ui/switch';
import ButtonSocialIconDemo from '@/components/ui/social-icon';
import logo from './assets/logo.png';

type QuizState = 'landing' | 'teacher_dashboard' | 'generating' | 'student_quiz' | 'grading' | 'results' | 'insights';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleGenerateQuiz = () => {
    setViewState('generating');
    
    // Simulate Agentic AI generation delay
    setTimeout(() => {
      setQuestions([
        {
          id: 1,
          text: `In the process of photosynthesis, what is the primary role of chlorophyll?`,
          translation: `A cikin tsarin photosynthesis, mene ne babban aikin chlorophyll?`,
          options: [
            "To absorb water from the soil",
            "To capture light energy from the sun",
            "To convert oxygen into carbon dioxide",
            "To act as a structural component of the plant cell"
          ],
          correctAnswerIndex: 1
        },
        {
          id: 2,
          text: "Which of the following is considered a product of the light-dependent reactions?",
          translation: "Wanne ne daga cikin waɗannan ake ɗauka a matsayin samfurin halayen dogaro da haske?",
          options: [
            "Glucose",
            "Carbon dioxide",
            "ATP and NADPH",
            "Water"
          ],
          correctAnswerIndex: 2
        },
        {
          id: 3,
          text: "Where precisely does the Calvin cycle take place inside the chloroplast?",
          translation: "A ina ne ainihin zagayowar Calvin ke faruwa a cikin chloroplast?",
          options: [
            "Thylakoid membrane",
            "Outer membrane",
            "Stroma",
            "Granum"
          ],
          correctAnswerIndex: 2
        }
      ]);
      setViewState('student_quiz');
      setCurrentQuestionIdx(0);
      setAnswers({});
    }, 3000);
  };

  const handleSelectAnswer = (optIndex: number) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optIndex });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setViewState('grading');
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
