import React from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiShield, FiZap, FiActivity } from 'react-icons/fi';

const RecommendationCard = ({ recommendations }) => {
  if (!recommendations) return null;

  const diseaseRecs = recommendations.disease_recommendations || [];
  const recList = recommendations.recommendations || [];
  const generalAdvice = recommendations.general_advice || [];
  const positiveNotes = recommendations.positive_notes || '';
  const summary = recommendations.overall_summary || recommendations.risk_summary?.primary_risk || '';
  const mostUrgent = recommendations.most_urgent || '';
  const source = recommendations.source || 'Clinical Engine';
  const modelUsed = recommendations.model_used || 'meta-llama/llama-3.1-8b-instruct';
  const isOpenRouter = source === 'OpenRouter AI' || recommendations.ai_powered === true;

  return (
    <div className="bg-white dark:bg-[#111B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 transition-all">
      {/* Header: Clean alignment between title, AI badge, and urgency pill */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FiShield className="text-teal-600 dark:text-teal-400 flex-shrink-0" size={20} />
            <span>AI Clinical Decision Support & Recommendations</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized clinical pathway generated via {source}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {isOpenRouter ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shadow-xs whitespace-nowrap">
              <FiZap className="text-teal-600 dark:text-teal-400" size={13} />
              <span>OpenRouter AI ({modelUsed.split('/')[1] || modelUsed})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
              <FiActivity size={13} />
              <span>Expert Rule Engine</span>
            </span>
          )}

          {mostUrgent && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 whitespace-nowrap">
              <FiClock size={13} />
              <span>{mostUrgent}</span>
            </span>
          )}
        </div>
      </div>

      {/* Structured Section 1: Diagnostic Synthesis */}
      {summary && (
        <div className="p-5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/50 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
            <FiAlertTriangle size={15} className="text-teal-700 dark:text-teal-400 flex-shrink-0" />
            <span>Diagnostic Synthesis & Evaluation</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words font-medium">
            {summary}
          </p>
        </div>
      )}

      {/* Structured Section 2: Positive Clinical Indicators */}
      {positiveNotes && (
        <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            <FiCheckCircle size={15} className="text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
            <span>Positive Clinical Indicators</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words font-medium">
            {positiveNotes}
          </p>
        </div>
      )}

      {/* Structured Section 3: Individual Disease Risk Pathways */}
      {diseaseRecs.length > 0 ? (
        <div className="space-y-4 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Condition-Specific Clinical Action Plans
          </h4>
          <div className="space-y-4">
            {diseaseRecs.map((rec, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-4">
                {/* Header: Name and Compact Aligned Badge */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{rec.disease_name}</span>
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                    {rec.risk_level} RISK
                  </span>
                </div>

                {/* Clinical Explanation */}
                {rec.explanation && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                    {rec.explanation}
                  </p>
                )}

                {/* Key Risk Factors */}
                {rec.key_risk_factors && rec.key_risk_factors.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Identified Clinical Risk Factors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rec.key_risk_factors.map((factor, i) => (
                        <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Diagnostic Tests */}
                {rec.tests_recommended && rec.tests_recommended.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Recommended Diagnostic Tests:
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {rec.tests_recommended.map((test, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle & Clinical Advice */}
                {rec.lifestyle_changes && rec.lifestyle_changes.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Lifestyle & Clinical Management Advice:
                    </span>
                    <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      {rec.lifestyle_changes.map((item, i) => (
                        <li key={i} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Medications Note */}
                {rec.medications_note && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    <span className="font-bold block mb-0.5">Clinical Prescribing Note:</span>
                    {rec.medications_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : recList.length > 0 ? (
        <div className="space-y-3">
          {recList.map((rec, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-teal-900 dark:text-teal-300">{rec.category || 'General Care'}</span>
                <span className="font-mono text-xs text-slate-500 font-semibold">PRIORITY: {rec.priority || 'NORMAL'}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{rec.advice || rec.action || JSON.stringify(rec)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Structured Section 4: Recommended Action Checklist */}
      {generalAdvice.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block px-1">
            Recommended Action Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generalAdvice.map((advice, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                <FiCheckCircle className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" size={17} />
                <span className="leading-relaxed">{advice}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
