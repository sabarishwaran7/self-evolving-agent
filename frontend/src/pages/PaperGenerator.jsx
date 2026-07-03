import React, { useState } from 'react';
import { 
  FileText, Download, Sparkles, BookOpen, Send, 
  HelpCircle, ChevronRight, Cpu, UploadCloud, CheckCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AgentMonitor from '../components/AgentMonitor';

export default function PaperGenerator({ user, addToast }) {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('IEEE');
  const [authorName, setAuthorName] = useState(user?.displayName || 'Academic Researcher');
  const [authorEmail, setAuthorEmail] = useState('');
  const [institution, setInstitution] = useState('AI Research Institute');
  const [keywords, setKeywords] = useState('');
  const [includeFlowDiagram, setIncludeFlowDiagram] = useState(true);
  const [customHeadings, setCustomHeadings] = useState('');
  
  // Advanced Mode States
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [abstractNotes, setAbstractNotes] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [methodologyNotes, setMethodologyNotes] = useState('');
  const [referencePaper, setReferencePaper] = useState(null);
  const [diagramImages, setDiagramImages] = useState([]);
  
  // Pre-Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSections, setAnalyzedSections] = useState([]);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  
  // Workflow status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('abstract');
  const [generatedPaper, setGeneratedPaper] = useState(null);
  
  // Agent monitor lists
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Feedback loops
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleDiagramChange = (e) => {
    if (e.target.files) {
      setDiagramImages(Array.from(e.target.files));
    }
  };

  const handleReferenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setReferencePaper(file);
    setIsAnalyzing(true);
    setTemplateLoaded(false);
    setAnalyzedSections([]);
    addToast('info', 'Analyzing Template', 'Extracting section headers from your uploaded document...');

    const formData = new FormData();
    formData.append('reference_paper', file);

    try {
      const res = await fetch('/api/papers/analyze-template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalyzedSections(data.sections || []);
        setTemplateLoaded(true);
        addToast('success', 'Template Ready', 'Document parsed. Structure imported successfully.');
      } else {
        throw new Error(data.detail || 'Analysis failed');
      }
    } catch (err) {
      addToast('error', 'Parse Error', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerPaperOrchestrator = async (e) => {
    e.preventDefault();
    if (!title) {
      addToast('warning', 'Title Required', 'Enter a research title first.');
      return;
    }

    setIsGenerating(true);
    setGeneratedPaper(null);
    addToast('info', 'Agents Dispatched', 'Research multi-agent crew dispatched to synthesize your manuscript.');

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard/metrics', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAgents(data.agents);
          setLogs(data.recentActivity);
        } else if (res.status === 401) {
          window.dispatchEvent(new Event('force-logout'));
        }
      } catch (err) {
        console.error(err);
      }
    }, 2500);

    try {
      let response;
      if (isAdvancedMode) {
        const formData = new FormData();
        formData.append('title', title);
        if (abstractNotes) formData.append('abstract_notes', abstractNotes);
        if (problemStatement) formData.append('problem_statement', problemStatement);
        if (methodologyNotes) formData.append('methodology_notes', methodologyNotes);
        if (referencePaper) formData.append('reference_paper', referencePaper);
        formData.append('include_flow_diagram', includeFlowDiagram);
        diagramImages.forEach(img => formData.append('diagram_images', img));

        response = await fetch('/api/papers/generate/advanced', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          },
          body: formData
        });
      } else {
        response = await fetch('/api/papers/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            title,
            format,
            authorName,
            authorEmail,
            institution,
            includeFlowDiagram,
            customHeadings,
            keywords: keywords.split(',').map(k => k.trim()).filter(Boolean)
          })
        });
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Paper compilation failed');
      }

      setGeneratedPaper(data);
      addToast('success', 'Paper Compiled', `Manuscript generated successfully. Similarity index: ${data.plagiarismScore}%`);
    } catch (err) {
      addToast('error', 'Compilation Failed', err.message);
    } finally {
      clearInterval(pollInterval);
      setIsGenerating(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) return;
    
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch('/api/memory/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          entityType: 'paper',
          entityId: generatedPaper.id,
          feedback,
          rating
        })
      });
      const data = await response.json();
      if (response.ok) {
        addToast('success', 'AI Evolved', 'The memory agent derived new instructions from your feedback!');
        setFeedback('');
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Feedback failed', err.message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Helper to extract sections properly
  const renderSections = () => {
    if (!generatedPaper) return null;
    let tabs = ['abstract'];
    if (generatedPaper.sections) {
      tabs = [...tabs, ...Object.keys(generatedPaper.sections)];
    }
    if (generatedPaper.tables && generatedPaper.tables.length > 0) tabs.push('tables');
    if (generatedPaper.algorithms && generatedPaper.algorithms.length > 0) tabs.push('algorithms');
    if (generatedPaper.equations && generatedPaper.equations.length > 0) tabs.push('equations');
    if (generatedPaper.diagrams && generatedPaper.diagrams.length > 0) tabs.push('diagrams');
    tabs.push('references');

    return (
      <div className="flex flex-wrap gap-1 border-b border-white/5 pb-3 mb-4 text-[10px] uppercase font-bold">
        {tabs.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveTab(sec)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === sec ? 'bg-space-700 text-white border border-neon-cyan/30' : 'text-slate-400 hover:text-white'}`}
          >
            {sec}
          </button>
        ))}
      </div>
    );
  };

  const renderActiveContent = () => {
    if (!generatedPaper) return null;
    if (activeTab === 'abstract') return <p className="italic text-slate-200">{generatedPaper.abstract}</p>;
    if (activeTab === 'references') {
      return (
        <ol className="space-y-3 font-mono">
          {generatedPaper.references.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-neon-cyan shrink-0">[{i+1}]</span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      );
    }
    if (activeTab === 'tables') {
      return generatedPaper.tables?.map((t, i) => (
        <div key={i} className="mb-6">
          <h4 className="font-bold text-neon-cyan mb-2">{t.title}</h4>
          <pre className="bg-space-900 p-4 rounded text-slate-300 font-mono text-xs overflow-x-auto">{t.content}</pre>
        </div>
      ));
    }
    if (activeTab === 'algorithms') {
      return generatedPaper.algorithms?.map((a, i) => (
        <div key={i} className="mb-6">
          <h4 className="font-bold text-neon-emerald mb-2">{a.title}</h4>
          <pre className="bg-space-900 p-4 rounded text-slate-300 font-mono text-xs whitespace-pre-wrap">{a.pseudocode}</pre>
        </div>
      ));
    }
    if (activeTab === 'equations') {
      return generatedPaper.equations?.map((eq, i) => (
        <div key={i} className="mb-6 flex justify-between items-center bg-space-900 p-4 rounded">
          <span className="text-slate-400 italic">{eq.description}</span>
          <span className="text-neon-cyan font-mono text-lg">{eq.latex}</span>
        </div>
      ));
    }
    if (activeTab === 'diagrams') {
      return generatedPaper.diagrams?.map((d, i) => (
        <div key={i} className="mb-6 space-y-3 bg-space-900 p-4 rounded border border-white/5">
          <h4 className="font-bold text-neon-indigo">{d.caption}: {d.title}</h4>
          <p className="text-slate-400 text-xs">{d.explanation}</p>
          <div className="bg-space-950 p-4 rounded-xl border border-white/5">
            <span className="text-xs font-bold text-slate-500 mb-2 block">Mermaid Output</span>
            <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto">{d.mermaidCode}</pre>
          </div>
        </div>
      ));
    }
    return <p>{generatedPaper.sections[activeTab]}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-neon-cyan" />
          AI Research Paper Generator
        </h1>
        <p className="text-xs text-slate-400">
          Synthesize full research articles using autonomous agent chains.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard title="Draft Parameter Hub" glowColor="indigo">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-slate-300">Use Uploaded Template</span>
              <button 
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isAdvancedMode ? 'bg-neon-cyan' : 'bg-space-700'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${isAdvancedMode ? 'left-6' : 'left-1'}`}></div>
              </button>
            </div>

            <form onSubmit={triggerPaperOrchestrator} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Manuscript Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A Decoupled Multi-Agent Cache for IoT Devices"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
                  required
                />
              </div>

              {isAdvancedMode ? (
                <>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold flex items-center justify-between">
                      Upload Reference Paper (PDF/DOCX)
                      <span className="text-[9px] text-neon-emerald bg-neon-emerald/10 px-1.5 py-0.5 rounded font-bold">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleReferenceUpload}
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-2 px-4 text-slate-200 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neon-cyan/10 file:text-neon-cyan hover:file:bg-neon-cyan/20 cursor-pointer"
                      />
                    </div>
                    {isAnalyzing && (
                      <p className="text-[10px] text-neon-cyan animate-pulse mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Analyzing Template Structure...
                      </p>
                    )}
                    {templateLoaded && (
                      <div className="mt-2 bg-neon-emerald/5 border border-neon-emerald/20 p-3 rounded-lg">
                        <p className="text-[10px] text-neon-emerald font-bold flex items-center gap-1 mb-2">
                          <CheckCircle className="w-3.5 h-3.5" /> Template Loaded Successfully
                        </p>
                        <p className="text-[9px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Detected Sections Preview:</p>
                        <ul className="list-disc pl-4 text-slate-300 text-[10px] space-y-0.5 max-h-[100px] overflow-y-auto">
                          {analyzedSections.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-slate-400 font-semibold flex items-center justify-between">
                      Upload Template Diagrams
                      <span className="text-[9px] text-neon-indigo bg-neon-indigo/10 px-1.5 py-0.5 rounded font-bold">Optional</span>
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleDiagramChange}
                      className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-2 px-4 text-slate-200 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neon-indigo/10 file:text-neon-indigo hover:file:bg-neon-indigo/20 cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <label className="text-slate-400 font-semibold flex items-center justify-between border-b border-white/5 pb-2">
                      Content Overrides
                    </label>
                    <textarea
                      value={abstractNotes}
                      onChange={(e) => setAbstractNotes(e.target.value)}
                      placeholder="Abstract Notes (Optional)"
                      className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition min-h-[60px]"
                    />
                    <textarea
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      placeholder="Problem Statement (Optional)"
                      className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition min-h-[60px]"
                    />
                    <textarea
                      value={methodologyNotes}
                      onChange={(e) => setMethodologyNotes(e.target.value)}
                      placeholder="Methodology Notes (Optional)"
                      className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition min-h-[60px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Format Guidelines</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                      >
                        <option value="IEEE">IEEE Transactions</option>
                        <option value="Springer">Springer Core</option>
                        <option value="Journal">Standard Journal</option>
                        <option value="Conference">Conference Brief</option>
                        <option value="College">College Thesis</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Author</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Institution Affiliate</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Author Email</label>
                      <input
                        type="email"
                        value={authorEmail}
                        onChange={(e) => setAuthorEmail(e.target.value)}
                        placeholder="author@example.com"
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Multi-agent, ChromaDB, IoT, caching"
                      className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1 mt-2 border-t border-white/5 pt-4">
                <label className="text-slate-400 font-semibold">Custom Headings / Extra Sections (Optional)</label>
                <input
                  type="text"
                  value={customHeadings}
                  onChange={(e) => setCustomHeadings(e.target.value)}
                  placeholder="e.g. Ethical Considerations, Deployment Strategy"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
                />
              </div>

              <div className="space-y-1 mb-2">
                <label className="text-slate-400 font-semibold flex items-center gap-2 cursor-pointer mt-2">
                  <input 
                    type="checkbox" 
                    checked={includeFlowDiagram} 
                    onChange={(e) => setIncludeFlowDiagram(e.target.checked)} 
                    className="w-4 h-4 rounded border-white/5 bg-space-950 text-neon-cyan focus:ring-neon-cyan/40 cursor-pointer"
                  />
                  Automatically Include AI Flow Diagram
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-xs"
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                {isGenerating ? 'Synthesizing Pipeline...' : 'Generate Research Paper'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Dynamic Activity/Result workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active compiling state or live agent activities */}
          {(isGenerating || !generatedPaper) && (
            <AgentMonitor 
              agents={agents} 
              logs={logs} 
              isProcessing={isGenerating} 
              activeTitle={title} 
            />
          )}

          {/* Finished compiled results display */}
          {generatedPaper && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-space-900 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Paper Compliance Score:</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald font-bold">
                    Plagiarism: {generatedPaper.plagiarismScore}%
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={`/api/papers/${generatedPaper.id}/download/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/5 hover:bg-neon-cyan/15 text-neon-cyan transition flex items-center gap-1.5 text-xs font-bold shadow-neon-cyan/5"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                  <a
                    href={`/api/papers/${generatedPaper.id}/download/docx`}
                    className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-space-950 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Download DOCX
                  </a>
                </div>
              </div>

              {/* Document display board */}
              <GlassCard 
                title={generatedPaper.title} 
                glowColor="cyan"
                headerActions={
                  generatedPaper.format === "Custom Advanced" ? (
                    <div className="text-[10px] font-bold text-neon-emerald uppercase tracking-widest flex items-center gap-1 border border-neon-emerald/30 bg-neon-emerald/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Template Source: Uploaded Paper
                    </div>
                  ) : null
                }
              >
                {renderSections()}

                <div className="bg-space-950/60 rounded-xl p-5 border border-white/5 font-sans leading-relaxed text-xs text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                  {renderActiveContent()}
                </div>
              </GlassCard>

              {/* Self-Evolving Feedback looping loop */}
              <GlassCard 
                title="Teach the Evolving AI Memory Module" 
                glowColor="indigo"
                headerActions={
                  <div className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 animate-pulse" />
                    Adaptive Learning Active
                  </div>
                }
              >
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                  <p className="text-slate-400 leading-normal">
                    Critique the vocabulary, depth, or formatting style of this paper. The AI memory agent will automatically derive system instructions and inject them into future prompts!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Your feedback review</label>
                      <input
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g. Format references strictly in square brackets or add more formulas in methodology"
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                        required
                      />
                    </div>

                    <div className="md:col-span-1 space-y-1">
                      <label className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Weight Rating (1-5)</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                      >
                        <option value="5">5 - Critical Adjustment</option>
                        <option value="4">4 - High Adjustment</option>
                        <option value="3">3 - General Mod</option>
                        <option value="2">2 - Low Priority</option>
                        <option value="1">1 - Tweak Only</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedback}
                    className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-violet hover:shadow-neon-indigo/10 text-white transition disabled:opacity-50 text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingFeedback ? 'Evolving Node...' : 'Inject Preferences into Memory'}
                  </button>
                </form>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
