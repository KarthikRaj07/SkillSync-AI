import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileSearch, GraduationCap, Briefcase, Sparkles, ListChecks, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeAnalysis = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setError('Please upload a resume or paste resume text to analyze.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        response = await axios.post('/api/analyze-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post('/api/analyze-resume', { text });
      }

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || 'Unable to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
            <FileSearch size={18} />
            Resume Analysis
          </div>
          <h1 className="mt-3 text-4xl font-bold text-white">Detailed Resume Insights</h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Upload a resume or paste the text to generate NLP-driven insights, extract skills, education, experience and a quality score.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          <UploadCloud size={16} /> Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-5">
              <UploadCloud size={22} className="text-indigo-300" />
              <div>
                <h2 className="text-xl font-semibold text-white">Upload resume</h2>
                <p className="text-sm text-gray-400">Choose a PDF or DOCX file for NLP-based resume analysis.</p>
              </div>
            </div>

            <label className="block rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center transition hover:border-indigo-400/50 hover:bg-white/10">
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
              <p className="text-sm text-gray-400">Click to upload or drag your file here.</p>
              {file && <p className="mt-3 text-sm text-white">Selected: {file.name}</p>}
            </label>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={22} className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold text-white">Or paste resume text</h2>
                <p className="text-sm text-gray-400">This is ideal when you have resume content ready to analyze.</p>
              </div>
            </div>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#0d172f] px-5 py-4 text-white outline-none transition focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Paste your resume text here..."
            />
          </div>

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-3 rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze Resume'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Overview</h2>
                <p className="text-sm text-gray-400">Quick resume metrics and quality score.</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-indigo-300">
                Instant NLP
              </div>
            </div>

            {!analysis ? (
              <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-gray-400">
                Upload a resume or paste text to see insights.
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-950/50 p-5">
                    <p className="text-sm text-gray-400">Word count</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{analysis.word_count}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/50 p-5">
                    <p className="text-sm text-gray-400">Skills detected</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{analysis.skills.length}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/50 p-5">
                    <p className="text-sm text-gray-400">Resume score</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{analysis.score}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm uppercase tracking-[0.2em] text-gray-500">Quality meter</span>
                    <span className="text-sm font-semibold text-white">{analysis.score}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${scoreColor(analysis.score)} rounded-full`} style={{ width: `${analysis.score}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {analysis && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="h-6 w-6 text-cyan-300" />
                  <h3 className="text-lg font-semibold text-white">Education</h3>
                </div>
                {analysis.education.length ? (
                  <ul className="space-y-3 text-gray-300">
                    {analysis.education.map((item, index) => (
                      <li key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No education details were detected.</p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="h-6 w-6 text-amber-300" />
                  <h3 className="text-lg font-semibold text-white">Experience</h3>
                </div>
                {analysis.experience.length ? (
                  <ul className="space-y-3 text-gray-300">
                    {analysis.experience.map((item, index) => (
                      <li key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No experience snippets were identified.</p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-violet-300" />
                  <h3 className="text-lg font-semibold text-white">Top keywords</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {analysis.keywords.length ? (
                    analysis.keywords.map((keyword, index) => (
                      <span key={index} className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Add more content to surface keywords.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ListChecks className="h-6 w-6 text-emerald-300" />
                  <h3 className="text-lg font-semibold text-white">Suggestions</h3>
                </div>
                <div className="space-y-3 text-gray-300">
                  {analysis.suggestions.map((tip, index) => (
                    <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                      <ShieldCheck className="mt-1 h-5 w-5 text-indigo-300" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResumeAnalysis;
