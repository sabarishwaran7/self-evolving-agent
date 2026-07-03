import React, { useState } from 'react';
import { ShieldCheck, ClipboardCheck, ArrowRight, Zap, RefreshCw, FileText } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function PlagiarismPage({ user, addToast }) {
  const [content, setContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [report, setReport] = useState(null);
  
  // Rewrite states
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);

  const handlePlagiarismCheck = async (e) => {
    e.preventDefault();
    if (content.length < 20) {
      addToast('warning', 'Content Too Short', 'Enter at least a few sentences (20+ chars) to run a precise audit scan.');
      return;
    }

    setIsChecking(true);
    setReport(null);
    setRewriteResult(null);
    addToast('info', 'Scanner Fired', 'Comparing text blocks with indexed IEEE and Springer corpora...');

    try {
      const response = await fetch('/api/plagiarism/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (response.ok) {
        setReport(data);
        addToast('success', 'Audit Complete', `Text duplicate scan returned ${data.similarityPercentage}% similarity.`);
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Audit Failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutoRewrite = async () => {
    setIsRewriting(true);
    addToast('info', 'Agents Active', 'Rewrite Agent rephrasing syntax schemas to optimize similarity levels...');

    try {
      const response = await fetch('/api/plagiarism/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ content })
      });
      const data = await response.json();
      if (response.ok) {
        setRewriteResult(data);
        addToast('success', 'Optimization Completed', `Rephrasing lowered similarity index below target: ${data.newSimilarityPercentage}%!`);
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Rewrite Failed', err.message);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-neon-rose" />
          Academic Plagiarism & Rewrite Engine
        </h1>
        <p className="text-xs text-slate-400">
          Verify paper originality margins and trigger auto-rewrites below the 10% ceiling standard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side input text box */}
        <div className="space-y-6">
          <GlassCard title="Document Originality Input" glowColor="indigo">
            <form onSubmit={handlePlagiarismCheck} className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Paste draft paragraphs, methodology write-ups, or abstracts below to run cross-reference similarity checks.
              </p>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your manuscript paragraphs here (e.g. Traditional neural frameworks require high parameters and lack geometric inductive biases...)"
                rows="10"
                className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl p-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition font-sans leading-relaxed text-xs"
                required
              />

              <button
                type="submit"
                disabled={isChecking || !content}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-xs"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Auditing Similarity...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-4 h-4" />
                    Verify Document Originality
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right side results audit logs */}
        <div className="space-y-6">
          {/* Default scan prompt panel */}
          {!report && !isChecking && (
            <div className="p-16 text-center rounded-2xl bg-space-900/50 border border-white/5 flex flex-col items-center justify-center space-y-3.5 h-[410px]">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Awaiting input details. Submit draft contents to inspect plagiarism scoring dials and execute rewrite adaptions.
              </p>
            </div>
          )}

          {/* Processing view */}
          {isChecking && (
            <div className="p-16 text-center space-y-4 rounded-2xl bg-space-900 border border-white/5 flex flex-col items-center justify-center h-[410px]">
              <RefreshCw className="w-12 h-12 text-neon-rose animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-white tracking-tight text-sm">Plagiarism Agent Auditing Text</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Calculating string distances, checking academic databases, and generating compliance scores...
                </p>
              </div>
            </div>
          )}

          {/* Audit report found */}
          {report && !rewriteResult && (
            <GlassCard title="Originality Analysis Report" glowColor="rose" className="min-h-[410px] flex flex-col justify-between">
              <div className="space-y-5 text-xs">
                {/* Score gauge header */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-space-950 border border-white/5">
                  {/* Gauge */}
                  <div className="relative w-16 h-16 rounded-full border-4 border-neon-rose/30 flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-white text-sm">{report.similarityPercentage}%</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white tracking-tight text-sm">
                      {report.similarityPercentage > 10.0 ? 'Non-Compliant Score' : 'Compliant Copy Score'}
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                      {report.similarityPercentage > 10.0 
                        ? 'Plagiarism exceeds the standard 10% ceiling. Rewriting recommended.'
                        : 'Perfect! Similarity index meets compliance metrics.'}
                    </p>
                  </div>
                </div>

                {/* Copied Matches detail list */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest">
                    Discovered Copy Source Anomalies
                  </span>
                  
                  {report.copiedMatches.map((m, i) => (
                    <div key={i} className="p-3 bg-space-950/40 rounded-xl border border-white/5 space-y-1.5 font-sans leading-normal">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-200">{m.source}</span>
                        <span className="text-neon-rose font-mono">{(m.matchRatio*100).toFixed(0)}% match</span>
                      </div>
                      <p className="text-slate-400 text-[11px] italic">
                        "{m.contentSnippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action rewrite link */}
              {report.similarityPercentage > 10.0 && (
                <button
                  onClick={handleAutoRewrite}
                  disabled={isRewriting}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-rose to-neon-fuchsia text-white hover:shadow-neon-rose/10 transition mt-4 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 animate-bounce" />
                  {isRewriting ? 'Rewriting Text paragraphs...' : 'Trigger Agent Auto-Rewrite (< 10%)'}
                </button>
              )}
            </GlassCard>
          )}

          {/* Paraphrasing comparison panel */}
          {rewriteResult && (
            <GlassCard title="Agent Auto-Rewrite Comparison" glowColor="emerald" className="min-h-[410px] flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                {/* New compliance header */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neon-emerald/5 border border-neon-emerald/20">
                  <div className="w-12 h-12 rounded-full border-4 border-neon-emerald flex items-center justify-center shrink-0 font-extrabold text-neon-emerald text-xs">
                    {rewriteResult.newSimilarityPercentage}%
                  </div>
                  <div>
                    <h4 className="font-bold text-white tracking-tight">Compliance Threshold Reached</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5 leading-snug">
                      Plagiarism successfully reduced to {rewriteResult.newSimilarityPercentage}% (under 10% ceiling).
                    </p>
                  </div>
                </div>

                {/* Side-by-Side scrolling windows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest">
                      Original draft
                    </span>
                    <div className="bg-space-950 rounded-xl p-3 border border-white/5 text-[11px] leading-relaxed text-slate-400 h-44 overflow-y-auto font-sans line-through opacity-70">
                      {rewriteResult.originalContent}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neon-cyan block tracking-widest flex items-center gap-1">
                      Paraphrased draft
                    </span>
                    <div className="bg-space-950 rounded-xl p-3 border border-neon-cyan/20 text-[11px] leading-relaxed text-slate-200 h-44 overflow-y-auto font-sans shadow-inner">
                      {rewriteResult.rewrittenContent}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action back buttons */}
              <div className="flex gap-2.5 mt-4">
                <button
                  onClick={() => {
                    setContent(rewriteResult.rewrittenContent);
                    setRewriteResult(null);
                    setReport(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-space-900 border border-white/5 text-slate-300 hover:text-white transition text-xs"
                >
                  Use Rewrite Content
                </button>
                <button
                  onClick={() => setRewriteResult(null)}
                  className="px-4 py-3 rounded-xl font-bold border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition text-xs"
                >
                  Back
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
