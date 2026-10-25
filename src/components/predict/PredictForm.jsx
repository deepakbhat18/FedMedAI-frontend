import React from 'react';
import { FiActivity, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const PredictForm = ({ formData, onChange, onSubmit, loading }) => {
  const fields = [
    { name: 'age', label: 'Age (Years)', min: 1, max: 120, step: 1, unit: 'yrs' },
    { name: 'gender', label: 'Gender (0: Female, 1: Male)', min: 0, max: 1, step: 1, unit: 'code' },
    { name: 'bloodPressure', label: 'Blood Pressure (mmHg)', min: 60, max: 250, step: 1, unit: 'mmHg' },
    { name: 'cholesterol', label: 'Cholesterol (mg/dL)', min: 100, max: 500, step: 1, unit: 'mg/dL' },
    { name: 'heartRate', label: 'Heart Rate (bpm)', min: 40, max: 200, step: 1, unit: 'bpm' },
    { name: 'glucose', label: 'Blood Glucose (mg/dL)', min: 50, max: 400, step: 1, unit: 'mg/dL' },
    { name: 'bmi', label: 'BMI (kg/m²)', min: 10, max: 60, step: 0.1, unit: 'kg/m²' },
    { name: 'smoking', label: 'Smoking History (0: No, 1: Yes)', min: 0, max: 1, step: 1, unit: '0/1' },
    { name: 'diabetesHistory', label: 'Diabetes History (0: No, 1: Yes)', min: 0, max: 1, step: 1, unit: '0/1' },
    { name: 'familyHistory', label: 'Family History (0: No, 1: Yes)', min: 0, max: 1, step: 1, unit: '0/1' },
    { name: 'creatinine', label: 'Serum Creatinine (mg/dL)', min: 0.2, max: 10.0, step: 0.1, unit: 'mg/dL' },
    { name: 'hemoglobin', label: 'Hemoglobin (g/dL)', min: 5.0, max: 20.0, step: 0.1, unit: 'g/dL' },
    { name: 'bilirubin', label: 'Bilirubin (mg/dL)', min: 0.1, max: 15.0, step: 0.1, unit: 'mg/dL' },
    { name: 'altEnzyme', label: 'ALT Enzyme (U/L)', min: 5, max: 500, step: 1, unit: 'U/L' },
    { name: 'albumin', label: 'Albumin (g/dL)', min: 1.0, max: 6.0, step: 0.1, unit: 'g/dL' },
    { name: 'potassium', label: 'Potassium (mEq/L)', min: 2.0, max: 8.0, step: 0.1, unit: 'mEq/L' },
    { name: 'sodium', label: 'Sodium (mEq/L)', min: 110, max: 160, step: 1, unit: 'mEq/L' },
    { name: 'urea', label: 'Blood Urea (mg/dL)', min: 5, max: 200, step: 1, unit: 'mg/dL' },
  ];

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiActivity className="text-teal-600" size={19} />
            <span>Patient Clinical Parameters</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            18 standardized vitals and laboratory biomarkers fed into trained federated models.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70">
          5-Disease Simultaneous Inference
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <label className="font-semibold text-slate-700 truncate" title={field.label}>
                {field.label.split('(')[0].trim()}
              </label>
              <span className="text-xs font-mono text-slate-400 font-medium">
                {field.unit}
              </span>
            </div>
            <input
              type="number"
              name={field.name}
              value={formData[field.name] ?? ''}
              onChange={onChange}
              min={field.min}
              max={field.max}
              step={field.step}
              required
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-mono"
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-slate-400">
          Evaluated locally using privacy-preserving federated weights.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? (
            <>
              <FiRefreshCw size={15} className="animate-spin" />
              <span>Evaluating Network Weights...</span>
            </>
          ) : (
            <>
              <FiCheckCircle size={16} />
              <span>Run Multi-Disease Evaluation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PredictForm;
