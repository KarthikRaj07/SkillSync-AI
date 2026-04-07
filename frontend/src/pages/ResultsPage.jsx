import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  GraduationCap, 
  BadgeCheck,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const ResultsPage = () => {
  const location = useLocation();
  const { results, resumeData } = location.state || {};

  if (!results) {
    return <Navigate to="/dashboard" />;
  }

  const { match_score, matched_skills, missing_skills, suggestions } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`lg:col-span-1 p-8 rounded-3xl border flex flex-col items-center justify-center text-center space-y-6 ${getScoreBg(match_score)}`}
        >
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                strokeDashoffset={552.92 - (552.92 * match_score) / 100}
                className={`transition-all duration-1000 ease-out ${getScoreColor(match_score)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(match_score)}`}>{Math.round(match_score)}%</span>
              <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Match Score</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              {match_score >= 70 ? <TrendingUp className="text-emerald-400" /> : <TrendingDown className="text-red-400" />}
              <h3 className="text-xl font-bold text-white">
                {match_score >= 80 ? 'Excellent Match!' : match_score >= 50 ? 'Good Potential' : 'Needs Improvement'}
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              Your profile alignment with the job description.
            </p>
          </div>
        </motion.div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Skills Breakdown */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                <BadgeCheck className="text-emerald-400" />
                Matched Skills
              </div>
              <div className="flex flex-wrap gap-3">
                {matched_skills.length > 0 ? matched_skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
                    {skill}
                  </span>
                )) : <p className="text-gray-500 text-sm">No direct skill matches found.</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                <AlertCircle className="text-red-400" />
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-3">
                {missing_skills.length > 0 ? missing_skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                    {skill}
                  </span>
                )) : <p className="text-gray-500 text-sm italic">You have all the required skills mentioned!</p>}
              </div>
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8"
          >
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
              <Sparkles className="text-indigo-400" />
              SkillSync AI Recommendations
            </div>
            <ul className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <div className="mt-1 p-1 bg-indigo-500/20 rounded text-indigo-400">
                    <CheckCircle2 size={14} />
                  </div>
                  <span>{suggestion}</span>
                </li>
              ))}
              <li className="pt-4 border-t border-white/5 flex items-center gap-4 text-indigo-400 text-sm font-medium">
                <GraduationCap size={20} />
                <span>Personalized learning paths generated based on your gap.</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
