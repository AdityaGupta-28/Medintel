import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const triggerAnalysis = () => {
    setAnalyzing(true);
    setInsights(null);
    
    // Simulate API delay
    setTimeout(() => {
      setInsights({
        riskLevel: 'Moderate',
        score: 65,
        summary: 'Patient shows signs of elevated blood pressure over the last 3 visits. Recommended immediate lifestyle changes and a follow-up test in 2 weeks.',
        trends: [
          { metric: 'Blood Pressure', status: 'Warning', value: '140/90 mmHg' },
          { metric: 'Heart Rate', status: 'Stable', value: '72 bpm' },
          { metric: 'Cholesterol', status: 'Critical', value: '240 mg/dL' }
        ],
        recommendations: [
          'Schedule comprehensive lipid panel',
          'Prescribe anti-hypertensive medication review',
          'Dietary consultation for sodium reduction'
        ]
      });
      setAnalyzing(false);
    }, 2500);
  };

  useEffect(() => {
    // Automatically trigger analysis on mount for demonstration
    triggerAnalysis();
  }, []);

  return (
    <div className="flex-1 p-8 h-screen overflow-y-auto bg-slate-50">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Health Insights</h1>
          <p className="text-slate-500">Automated risk analysis and medical recommendations</p>
        </div>
        <button 
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCcw size={18} className={`mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          Re-Analyze Data
        </button>
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="h-16 w-16 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"
          />
          <p className="text-slate-600 font-medium">Processing patient records and history...</p>
        </div>
      ) : insights ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Risk Score Card */}
          <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Overall Risk Score</h3>
            <div className="relative h-40 w-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 440" }}
                  animate={{ strokeDasharray: `${(insights.score / 100) * 440} 440` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  className={insights.score > 70 ? 'text-red-500' : insights.score > 40 ? 'text-yellow-500' : 'text-green-500'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-800">{insights.score}</span>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              insights.riskLevel === 'High' ? 'bg-red-100 text-red-700' : 
              insights.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              {insights.riskLevel} Risk
            </span>
          </div>

          {/* Details & Recommendations */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Activity size={24} className="text-blue-400" />
                <h3 className="text-xl font-bold">AI Summary</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg">
                {insights.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><ShieldAlert size={18} className="mr-2 text-primary-500" /> Key Trends</h3>
                <div className="space-y-4">
                  {insights.trends.map((trend, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{trend.metric}</p>
                        <p className="text-xs text-slate-500">{trend.value}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                        trend.status === 'Critical' ? 'bg-red-50 text-red-600' : 
                        trend.status === 'Warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {trend.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><CheckCircle size={18} className="mr-2 text-primary-500" /> Recommendations</h3>
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="h-5 w-5 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-slate-600 leading-tight">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};

export default AIInsights;
