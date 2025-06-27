'use client';

import { useState, useTransition, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getIdeas, addIdea, addPhraseToIdea, refineIdeaAction } from './actions';
import { marked } from 'marked';
import LoginModal from '@/components/LoginModal';
import { ArrowLeft } from 'lucide-react';

// The Question Bank defines all possible analyses the AI can perform.
const questionBank = [
    { id: 'structure', label: 'Structure', prompt: 'Propose an optimal outline or hierarchy.' },
    { id: 'sub_components', label: 'Sub-components', prompt: 'Break the idea into logical modules or steps.' },
    { id: 'category', label: 'Category', prompt: 'Classify this idea into a category (e.g., How-to Guide, Product Spec, Marketing Plan, etc.) and explain your choice.' },
    { id: 'related_topics', label: 'Related Topics', prompt: 'List 3 related topics or similar products.' },
    { id: 'audience', label: 'Target Audience', prompt: 'Who are the target audiences & personas for this idea?' },
    { id: 'gap_analysis', label: 'Competitive Gap', prompt: 'What are the existing solutions & the competitive gap this idea could fill?' },
    { id: 'use_cases', label: 'Use Cases', prompt: 'Describe potential use-cases or jobs-to-be-done.' },
    { id: 'feasibility', label: 'Feasibility', prompt: 'Assess the feasibility & required resources.' },
    { id: 'mvp', label: 'MVP', prompt: 'Define a Minimal Viable Product (MVP) version of this idea.' },
    { id: 'timeline', label: 'Timeline', prompt: 'Propose a high-level timeline with key milestones.' },
    { id: 'risks', label: 'Risks & Mitigations', prompt: 'Identify key risks & potential mitigations.' },
    { id: 'kpis', label: 'Metrics / KPIs', prompt: 'What metrics or KPIs should be used to track success?' },
    { id: 'revenue', label: 'Revenue Model', prompt: 'Suggest a potential revenue or impact model.' },
    { id: 'tech_stack', label: 'Tech Stack', prompt: 'Suggest a potential scalability plan & tech-stack.' },
    { id: 'pitch', label: 'Elevator Pitch', prompt: 'Write a 30-word elevator pitch.' },
    { id: 'names', label: 'Tagline & Names', prompt: 'Propose a tagline and 3 alternative names.' },
    { id: 'next_steps', label: 'Next Actions', prompt: 'What are the immediate next best action steps?' },
    { id: 'unknowns', label: 'Open Questions', prompt: 'List the open questions or unknowns about this idea.' },
    { id: 'mind_map', label: 'Mind-map Summary', prompt: 'Create a mind-map style summary in list form.' },
    { id: 'image_prompt', label: 'Image Prompt', prompt: 'Generate a detailed prompt for an image or diagram that visually represents this idea.' }
];

// Available LLM providers for the UI
const llmProviders = [
    { id: 'gemini', label: 'Google Gemini' },
    { id: 'openai', label: 'OpenAI GPT' },
    { id: 'claude', label: 'Anthropic Claude' }
];

// A dedicated component to render the structured JSON response from the AI
function RefinementDisplay({ refinement, questionBank }) {
    if (!refinement) return null;

    // Handle cases where the AI returns an error
    if (refinement.error) {
        return (
            <div>
                <h3 className="text-red-500 font-bold mb-2">[ ANALYSIS ERROR ]</h3>
                <p className="text-dark-text-secondary">{refinement.error}</p>
                {refinement.rawResponse && (
                    <pre className="mt-4 p-2 bg-dark-bg border border-dark-border rounded text-xs whitespace-pre-wrap">
                        {refinement.rawResponse}
                    </pre>
                )}
            </div>
        );
    }
    
    // Helper to find the display label for a given JSON key
    const getLabel = (key) => {
        const question = questionBank.find(q => q.id === key);
        return question ? question.label : key.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <div className="space-y-8">
            {Object.entries(refinement).map(([key, value]) => (
                <div key={key}>
                    <h3 className="text-xl font-bold text-brand-purple mb-3">{`// ${getLabel(key)}`}</h3>
                    <div 
                        className="prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-brand-light-green"
                        dangerouslySetInnerHTML={{ __html: marked(String(value)) }} 
                    />
                </div>
            ))}
        </div>
    );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [ideas, setIdeas] = useState([]);
  const [activeIdea, setActiveIdea] = useState(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [refinement, setRefinement] = useState(null);
  const [activeView, setActiveView] = useState('phrases'); 
  const [selectedQuestions, setSelectedQuestions] = useState(new Set(['pitch', 'category', 'mvp', 'next_steps']));
  const [llmProvider, setLlmProvider] = useState('gemini');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsFetching(true);
      startTransition(async () => {
        const initialIdeas = await getIdeas();
        setIdeas(initialIdeas);
        if (initialIdeas.length > 0) {
          selectIdea(initialIdeas[0], false);
        } else {
          setActiveIdea(null);
        }
        setIsFetching(false);
      });
    } else {
      setIdeas([]);
      setActiveIdea(null);
    }
  }, [status]);
  
  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleCreateIdea = (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;
    startTransition(async () => {
      const newIdea = await addIdea(newIdeaTitle);
      setIdeas([newIdea, ...ideas]);
      selectIdea(newIdea, true);
      setNewIdeaTitle('');
    });
  };

  const handleAddPhrase = (e) => {
    e.preventDefault();
    if (!newPhrase.trim() || !activeIdea) return;
    startTransition(async () => {
      await addPhraseToIdea(activeIdea._id, newPhrase);
      const updatedIdea = { ...activeIdea, phrases: [...activeIdea.phrases, newPhrase] };
      setActiveIdea(updatedIdea);
      setIdeas(ideas.map(idea => idea._id === activeIdea._id ? updatedIdea : idea));
      setNewPhrase('');
    });
  };

  const handleRefine = async () => {
    if (!activeIdea || activeIdea.phrases.length === 0 || selectedQuestions.size === 0) return;
    setIsRefining(true);
    setActiveView('refinement');
    setRefinement(null);
    const selectedPromptIds = Array.from(selectedQuestions);
    const resultObject = await refineIdeaAction(activeIdea._id, activeIdea.phrases, selectedPromptIds, questionBank, llmProvider);
    setRefinement(resultObject);
    setIsRefining(false);
  };
  
  const selectIdea = (idea, isNew = false) => { 
    setActiveIdea(idea); 
    setRefinement(null); 
    setActiveView('phrases');
    if (typeof window !== 'undefined' && (window.innerWidth < 768 || isNew)) {
      setShowDetailView(true);
    }
  };

  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="flex flex-col h-screen">
        <header className="p-4 border-b border-dark-border bg-dark-surface/80 backdrop-blur-sm flex-shrink-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-brand-green animate-pulse">MIND_SIGNAL</h1>
                <div>{status === 'authenticated' ? (<div className="flex items-center gap-4"><span className="text-xs text-dark-text-secondary hidden sm:inline">{session.user.email}</span><button onClick={() => signOut()} className="px-3 py-1 text-xs bg-dark-border hover:bg-red-900/50 transition-colors rounded">[ LOGOUT ]</button></div>) : (<button onClick={() => setIsLoginModalOpen(true)} className="px-3 py-1 text-xs bg-brand-purple text-dark-bg font-bold hover:bg-opacity-80 transition-colors rounded">[ LOGIN / SIGNUP ]</button>)}</div>
            </div>
        </header>
        <main className="flex-grow flex md:flex-row flex-col overflow-hidden">
          {status !== 'authenticated' ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                  <h2 className="text-3xl text-brand-purple font-bold mb-4">[ AUTHENTICATION REQUIRED ]</h2>
                  <p className="text-dark-text-secondary max-w-md">Please log in to access your secure idea refinery. Your streams are encrypted and linked to your account.</p>
                  <button onClick={() => setIsLoginModalOpen(true)} className="mt-8 px-6 py-2 bg-brand-green text-dark-bg font-bold hover:bg-brand-light-green transition-colors rounded">[ PROCEED TO LOGIN ]</button>
              </div>
          ) : (
            <>
              {/* Left Column (Idea List) */}
              <div className={`w-full md:w-1/3 md:max-w-md h-full flex-col border-r border-dark-border bg-dark-surface ${showDetailView ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-dark-border flex-shrink-0">
                  <form onSubmit={handleCreateIdea} className="p-2 bg-dark-bg border border-dark-border rounded">
                    <label htmlFor="idea-title" className="text-dark-text-secondary text-xs px-2">{'>'} Initiate new idea stream:</label>
                    <div className="flex items-center mt-1">
                      <input id="idea-title" type="text" value={newIdeaTitle} onChange={(e) => setNewIdeaTitle(e.target.value)} placeholder="...title" className="w-full bg-transparent text-brand-light-green placeholder-dark-text-secondary focus:outline-none text-base px-2"/>
                      <button type="submit" disabled={isPending || !newIdeaTitle.trim()} className="ml-2 px-3 py-1 bg-brand-green text-dark-bg font-bold text-sm hover:bg-brand-light-green disabled:bg-dark-border disabled:text-dark-text-secondary transition-colors rounded">[INIT]</button>
                    </div>
                  </form>
                </div>
                <div className="flex-grow overflow-y-auto">
                  {isFetching ? <p className="p-4 text-brand-light-green animate-pulse">Querying database...</p> : ideas.length > 0 ? ideas.map(idea => (
                    <button key={idea._id} onClick={() => selectIdea(idea)} className={`w-full text-left p-4 border-b border-dark-border hover:bg-dark-bg transition-colors ${activeIdea?._id === idea._id ? 'bg-brand-green/10' : ''}`}>
                      <p className={`font-bold truncate ${activeIdea?._id === idea._id ? 'text-brand-light-green' : 'text-dark-text'}`}>{idea.title}</p>
                      <p className="text-xs text-dark-text-secondary">waves: {idea.phrases.length} {'//'} last_update: {new Date(idea.updatedAt).toLocaleTimeString()}</p>
                    </button>
                  )) : <p className="p-4 text-dark-text-secondary">No active idea streams. Initiate one above.</p>}
                </div>
              </div>

              {/* Right Column (Detail View) */}
              <div className={`w-full h-full flex-col bg-dark-bg/50 ${showDetailView ? 'flex' : 'hidden md:flex'}`}>
                {activeIdea ? (
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 md:p-6 flex-shrink-0 border-b border-dark-border">
                        <div className="flex justify-between items-start pb-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <button onClick={() => setShowDetailView(false)} className="md:hidden p-2 -ml-2 text-dark-text-secondary hover:text-white flex-shrink-0"><ArrowLeft size={20}/></button>
                                <div className="overflow-hidden">
                                  <h2 className="text-2xl font-bold text-brand-light-green truncate">{activeIdea.title}</h2>
                                  <p className="text-dark-text-secondary text-xs md:text-sm truncate">STREAM_ID: {activeIdea._id}</p>
                                </div>
                            </div>
                            <button onClick={handleRefine} disabled={isRefining || activeIdea.phrases.length === 0 || selectedQuestions.size === 0} className="ml-4 px-4 py-2 bg-brand-purple text-white font-bold hover:opacity-90 disabled:bg-dark-border disabled:text-dark-text-secondary transition-colors rounded flex items-center text-sm md:text-base whitespace-nowrap flex-shrink-0">
                              {isRefining ? 'ANALYZING...' : '[ REFINE ]'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                            <div>
                              <h3 className="text-dark-text-secondary text-sm mb-2">{'>'} LLM Provider:</h3>
                              <div className="flex flex-wrap gap-2">{llmProviders.map(p => (<button key={p.id} onClick={() => setLlmProvider(p.id)} className={`px-2 py-1 text-xs rounded transition-colors ${llmProvider === p.id ? 'bg-brand-purple text-dark-bg' : 'bg-dark-surface hover:bg-dark-border text-dark-text-secondary'}`}>{`[ ${p.label} ]`}</button>))}</div>
                            </div>
                            <div>
                              <h3 className="text-dark-text-secondary text-sm mb-2">{'>'} Analysis Modules:</h3>
                              <div className="flex flex-wrap gap-2">{questionBank.map(q => (<button key={q.id} onClick={() => handleQuestionToggle(q.id)} className={`px-2 py-1 text-xs rounded transition-colors ${selectedQuestions.has(q.id) ? 'bg-brand-green text-dark-bg' : 'bg-dark-surface hover:bg-dark-border text-dark-text-secondary'}`}>{selectedQuestions.has(q.id) ? `[ ${q.label} ✓]` : `[ ${q.label} ]`}</button>))}</div>
                            </div>
                        </div>
                    </div>
                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto px-4 md:px-6 py-6">
                        {activeView === 'phrases' && (<div className="space-y-2">{activeIdea.phrases.length > 0 ? activeIdea.phrases.map((phrase, index) => (<div key={index} className="flex items-start text-dark-text"><span className="text-dark-text-secondary mr-4">{String(index + 1).padStart(2, '0')}:</span><p className="flex-1">{phrase}</p></div>)) : <p className="text-dark-text-secondary">No thought waves committed. Add one below.</p>}</div>)}
                        {activeView === 'refinement' && (<div>{isRefining && <p className="text-brand-light-green animate-pulse">AI is processing stream... Stand by.</p>}<RefinementDisplay refinement={refinement} questionBank={questionBank} /></div>)}
                    </div>
                    {/* Sticky Input Form */}
                    <div className="p-4 md:p-6 mt-auto flex-shrink-0 bg-dark-bg/80 backdrop-blur-sm border-t border-dark-border">
                        <form onSubmit={handleAddPhrase}>
                          <div className="flex items-center p-2 bg-dark-surface border border-dark-border rounded">
                            <span className="text-brand-green text-lg mx-2">{'>'}</span>
                            <input type="text" value={newPhrase} onChange={(e) => setNewPhrase(e.target.value)} placeholder="Commit new thought wave..." className="w-full bg-transparent text-brand-light-green placeholder-dark-text-secondary focus:outline-none text-base"/>
                            <button type="submit" disabled={isPending || !newPhrase.trim()} className="ml-4 px-4 py-2 bg-brand-green text-dark-bg font-bold hover:bg-brand-light-green disabled:bg-dark-border disabled:text-dark-text-secondary transition-colors rounded text-sm md:text-base">[COMMIT]</button>
                          </div>
                        </form>
                    </div>
                  </div>
                ) : (<div className="w-full h-full items-center justify-center hidden md:flex"><p className="text-dark-text-secondary">{isFetching ? 'Loading streams...' : 'Select an idea stream from the left.'}</p></div>)}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
