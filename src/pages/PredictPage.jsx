import { useState } from 'react';
import PredictForm from '../components/predict/PredictForm';
import RecommendationCard from '../components/predict/RecommendationCard';
import { usePredictMutation } from '../hooks/useMedicalQueries';
import { downloadPDFReport } from '../api/predictionApi';
import { toast } from 'react-toastify';
import { FiDownload, FiCheckCircle } from 'react-icons/fi';

const initialFormData = {
  age: 55,
  gender: '1',
  bloodPressure: 145,
  cholesterol: 240,
  heartRate: 78,
  glucose: 110,
  bmi: 27.5,
  smoking: '1',
  diabetesHistory: '1',
  familyHistory: '0',
  creatinine: 1.1,
  hemoglobin: 14.0,
  bilirubin: 0.8,
  altEnzyme: 35,
  albumin: 4.2,
  potassium: 4.5,
  sodium: 140,
  urea: 25,
};

const PredictPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const predictMutation = usePredictMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const featureList = [
      parseFloat(formData.age),
      parseFloat(formData.gender),
      parseFloat(formData.bloodPressure),
      parseFloat(formData.cholesterol),
      parseFloat(formData.heartRate),
      parseFloat(formData.glucose),
      parseFloat(formData.bmi),
      parseFloat(formData.smoking),
      parseFloat(formData.diabetesHistory),
      parseFloat(formData.familyHistory),
      parseFloat(formData.creatinine),
      parseFloat(formData.hemoglobin),
      parseFloat(formData.bilirubin),
      parseFloat(formData.altEnzyme),
      parseFloat(formData.albumin),
      parseFloat(formData.potassium),
      parseFloat(formData.sodium),
      parseFloat(formData.urea),
    ];

    try {
      const data = await predictMutation.mutateAsync({
        patientId: formData.patientId || 1,
        features: featureList,
      });

      setResult(data);
      toast.success('Federated multi-disease risk evaluation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    try {
      setDownloadingPdf(true);
      await downloadPDFReport(formData.patientId || 1, {
        predictions: result.predictions || [],
        recommendations: result.recommendations || {},
        modelVersion: result.modelVersion || 'v1.0',
      });
      toast.success('Medical report downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#111B2E] p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            AI Diagnosis & Multi-Disease Risk Calculator
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Evaluate real-time risk scores simultaneously across Heart, Diabetes, Kidney, Liver, and Stroke conditions.
          </p>
        </div>

        {result && (
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 h-11 px-5 text-sm font-semibold text-teal-900 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 rounded-xl transition-colors shadow-xs flex-shrink-0"
          >
            <FiDownload size={16} />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download Diagnostic Report'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 xl:col-span-5">
          <PredictForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={predictMutation.isPending}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-8">
          {result ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Prediction Results Card — Risk Stratification */}
              <div className="bg-white dark:bg-[#111B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FiCheckCircle className="text-teal-600 dark:text-teal-400 flex-shrink-0" size={20} />
                      <span>Multi-Disease Risk Stratification</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Clinical risk assessment evaluated across 5 federated diagnostic models
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-mono font-bold border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                    Model: {result.modelVersion || 'v1.0'}
                  </span>
                </div>

                <div className="space-y-3">
                  {(result.predictions || []).map((pred, idx) => {
                    const isHigh = pred.risk_level === 'HIGH';
                    const isModerate = pred.risk_level === 'MODERATE';
                    return (
                      <div
                        key={idx}
                        className={`px-4 py-3.5 rounded-xl border flex items-center justify-between gap-4 min-h-[58px] transition-colors ${
                          isHigh
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                            : isModerate
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                            : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {pred.disease_name || pred.diseaseType}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                            {pred.prediction_label}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg border whitespace-nowrap ${
                              isHigh
                                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                                : isModerate
                                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                            }`}
                          >
                            {pred.risk_level} ({(pred.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Recommendations Card */}
              <RecommendationCard recommendations={result.recommendations} />
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4 flex flex-col items-center justify-center min-h-[460px] shadow-sm">
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center text-3xl shadow-xs">
                🩺
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Ready for Clinical Risk Evaluation</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Adjust the clinical vitals on the left and click <strong>Run Multi-Disease Evaluation</strong> to trigger privacy-budgeted federated model inference and AI clinical decision support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;