import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Briefcase, Zap, CheckCircle2, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jd) return alert("Please provide both a resume and a job description.");

    setLoading(true);
    try {
      // 1. Upload & Parse Resume
      const formData = new FormData();
      formData.append('resume', file);
      
      const uploadRes = await axios.post('/api/upload-resume', formData);
      const extractedSkills = uploadRes.data.extracted_data.skills;

      // 2. Match with JD
      const matchRes = await axios.post('/api/match-job', {
        resume_skills: extractedSkills,
        job_description: jd
      });

      // 3. Redirect to Results
      navigate('/results', { state: { results: matchRes.data, resumeData: uploadRes.data.extracted_data } });
    } catch (err) {
      console.error(err);
      alert("An error occurred during matching. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-2"
        >
          <Zap size={14} className="fill-current" />
          Powered by Advanced NLP
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Analyze Your <span className="text-gradient">Potential</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Upload your resume and the job description to see how well you match with the position.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Resume Upload */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-white font-semibold ml-1">
            <FileText size={20} className="text-indigo-400" />
            Resume Upload
          </div>
          <div 
            className={`relative h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all ${
              dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 scale-in">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-white font-medium mb-1 truncate max-w-[200px]">{file.name}</p>
                <p className="text-gray-500 text-sm">Click or drag to change file</p>
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="mt-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 mb-4">
                  <Upload size={32} />
                </div>
                <p className="text-white font-medium mb-1">Upload Resume</p>
                <p className="text-gray-500 text-sm">PDF or DOCX (Max 5MB)</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Job Description */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-white font-semibold ml-1">
            <Briefcase size={20} className="text-purple-400" />
            Job Description
          </div>
          <div className="h-64 relative group">
            <textarea 
              placeholder="Paste the job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-gray-600 resize-none"
            />
            <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                Typing...
              </span>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:col-span-2 pt-4"
        >
          <button 
            type="submit"
            disabled={loading || !file || !jd}
            className="w-full glass bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? (
              <>
                <div className="animate-spin h-6 w-6 border-3 border-white/30 border-t-white rounded-full" />
                <span>Processing with spaCy AI...</span>
              </>
            ) : (
              <>
                <span>Calculate Match Score</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default Dashboard;
