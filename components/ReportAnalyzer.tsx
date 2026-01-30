
import React, { useState, useRef, useEffect } from 'react';
import { analyzeMedicalImage } from '../services/geminiService';

const ReportAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (isAnalyzing) {
      const steps = [
        { threshold: 20, status: "Uploading image safely..." },
        { threshold: 45, status: "Identifying medical markers..." },
        { threshold: 75, status: "Analyzing values against clinical ranges..." },
        { threshold: 95, status: "Finalizing clinical summary..." }
      ];

      interval = window.setInterval(() => {
        setProgress(prev => {
          const next = prev + (prev < 90 ? Math.random() * 5 : 0.5);
          const currentStep = steps.find(s => next < s.threshold) || steps[steps.length - 1];
          setStatus(currentStep.status);
          return Math.min(next, 99);
        });
      }, 400);
    } else {
      setProgress(0);
      setStatus("");
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      try {
        const result = await analyzeMedicalImage(
          base64Data,
          selectedFile.type,
          "Analyze this medical image. Identify key findings, abnormal values, and explain them in simple language."
        );
        setAnalysis(result);
      } catch (err) {
        setAnalysis("Failed to analyze. Please try again with a clearer image.");
      } finally {
        setIsAnalyzing(false);
        setProgress(100);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400">Upload a lab report, prescription, or visual symptom for AI analysis.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors h-64 relative overflow-hidden ${selectedFile ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className={`max-h-full max-w-full rounded-lg object-contain transition-opacity ${isAnalyzing ? 'opacity-30' : 'opacity-100'}`} />
                {!isAnalyzing && (
                  <button onClick={clearSelection} className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6">
                    <div className="w-full bg-white/50 dark:bg-gray-800/50 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-teal-600 transition-all duration-300 shadow-[0_0_10px_#0d9488]" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-widest animate-pulse">{status}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <h3 className="font-medium text-gray-900 dark:text-white">Click to upload</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={!!selectedFile} />
              </>
            )}
          </div>
          <button onClick={handleAnalyze} disabled={!selectedFile || isAnalyzing} className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all ${!selectedFile || isAnalyzing ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : 'Analyze Report'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 min-h-[300px] flex flex-col">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><svg className="w-5 h-5 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>Analysis Results</h3>
          {isAnalyzing ? (
            <div className="space-y-4 flex-1">
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-pulse"></div>
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-pulse"></div>
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm prose-teal dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap flex-1">{analysis}</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 text-sm"><svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg><p>Upload an image to see results here</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportAnalyzer;
