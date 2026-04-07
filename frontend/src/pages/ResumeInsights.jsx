import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, BookOpen, Briefcase, ClipboardList, CheckCircle2, ShieldCheck, Sparkles, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeInsights = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setText('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setError('Please upload a resume or paste resume text.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('job_description', jobDescription);
        response = await axios.post('/api/resume-insights', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post('/api/resume-insights', {
          text,
          job_description: jobDescription,
        });
      }
      setInsights(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Unable to fetch resume insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
            <ClipboardList size={18} />
            Resume Insights
          </div>
          <h1 className="mt-3 text-4xl font-bold text-white">Smart Skill-Based Resume Insights</h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Upload a resume or paste text to quickly see categorized skills, highlights, and match guidance.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen size={22} className="text-cyan-300" />
              <div>
                <h2 className="text-xl font-semibold text-white">Upload or paste resume</h2>
                <p className="text-sm text-gray-400">Use a PDF/DOCX file or paste plain resume text.</p>
              </div>
            </div>

            <label className="block rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center cursor-pointer transition hover:border-indigo-400/50 hover:bg-white/10">
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileChange} />
              <p className="text-sm text-gray-400">Click to upload a file.</p>
              {file && <p className="mt-3 text-sm text-white">Selected: {file.name}</p>}
            </label>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-5">
              <Briefcase size={22} className="text-indigo-300" />
              <div>
                <h2 className="text-xl font-semibold text-white">Resume text</h2>
                <p className="text-sm text-gray-400">Paste your resume if you prefer not to upload a file.</p>
              </div>
            </div>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#0d172f] px-5 py-4 text-white outline-none transition focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Paste resume text here..."
            />
          </div>

          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles size={22} className="text-emerald-300" />
              <div>
                <h2 className="text-xl font-semibold text-white">Job description (optional)</h2>
                <p className="text-sm text-gray-400">Add a job description to compare matched and missing skills.</p>
              </div>
            </div>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#0d172f] px-5 py-4 text-white outline-none transition focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Paste job description here..."
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
            className="inline-flex w-full items-center justify-center gap-3 rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Get Insights'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white">Key Highlights</h2>
            <p className="mt-3 text-sm text-gray-400">Minimal insight focusing on skills, education and experience.</p>
            {!insights ? (
              <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-gray-500">
                Run analysis to view a short resume summary.
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-gray-400">Education</p>
                    <p className="mt-3 text-lg font-semibold text-white">{insights.education || 'Not detected'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-gray-400">Experience</p>
                    <p className="mt-3 text-lg font-semibold text-white">{insights.experience || 'Not detected'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-gray-400">Projects detected</p>
                    <p className="mt-3 text-lg font-semibold text-white">{insights.projects || 0}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/70 p-5">
                    <p className="text-sm text-gray-400">Total skills</p>
                    <p className="mt-3 text-lg font-semibold text-white">{insights.total_skills}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {insights && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-5">
                <ClipboardList size={22} className="text-violet-300" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Skill Categories</h2>
                  <p className="text-sm text-gray-400">Skills grouped for quick review.</p>
                </div>
              </div>
              <div className="space-y-5">
                {Object.entries(insights.categories).map(([category, skills]) => (
                  <div key={category} className="rounded-3xl bg-[#0f172a]/80 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-white">{category}</h3>
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{skills.length} skills</span>
                    </div>
                    {skills.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500">No detected skills in this category.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle2 size={22} className="text-emerald-300" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Summary</h2>
                </div>
              </div>
              <p className="text-gray-300">{insights.summary}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck size={22} className="text-cyan-300" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Match Insight</h2>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Matched skills</p>
                  {insights.matched_skills.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {insights.matched_skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">No matched skills detected.</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Missing skills</p>
                  {insights.missing_skills.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {insights.missing_skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-red-500/10 px-3 py-2 text-sm text-red-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-500">No missing skills detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeInsights;
