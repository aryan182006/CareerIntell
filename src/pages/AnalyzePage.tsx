import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, File, X, Briefcase, Zap, CheckCircle2, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { resumesApi, ResumeUploadResult } from '../api/resumes';
import { intelligenceApi, JDAnalysisResponse, SkillGapAnalysisResponse } from '../api/intelligence';
import { useAuth } from '../context/AuthContext';

export default function AnalyzePage() {
  const { refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('Data Scientist');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadResult, setResumeUploadResult] = useState<ResumeUploadResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysisResponse | null>(null);
  const [gapResults, setGapResults] = useState<SkillGapAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_WORDS = 500;
  const wordCount = jobDescription.trim() ? (jobDescription.trim().match(/\S+/g)?.length || 0) : 0;

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const words = val.trim().match(/\S+/g) || [];

    if (words.length <= MAX_WORDS) {
      setJobDescription(val);
    } else {
      let count = 0;
      let endIdx = val.length;
      const regex = /\S+/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(val)) !== null) {
        count++;
        if (count === MAX_WORDS) {
          endIdx = match.index + match[0].length;
          break;
        }
      }
      setJobDescription(val.slice(0, endIdx));
    }
  };

  const roles = [
    'Data Scientist', 'Machine Learning Engineer', 'Full Stack Developer', 'Data Analyst', 'Cloud / DevOps Engineer'
  ];

  // Load latest resume on mount if available
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await resumesApi.getLatestResume();
        if (latest && latest.id) {
          setResumeUploadResult({
            resume_id: latest.id,
            file_name: latest.file_name || 'My_Resume.pdf',
            file_size: latest.file_size || 0,
            uploaded_at: latest.uploaded_at || '',
            skills_extracted: latest.skills_extracted || [],
            sections_detected: latest.sections_detected || {},
            word_count: 0,
            raw_text_snippet: latest.raw_text_snippet || ''
          });
        }
      } catch (e) {
        console.warn('Could not fetch existing resume:', e);
      }
    };
    fetchLatest();
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a PDF document for accurate NLP text and skill extraction.');
      return;
    }
    setFile(selectedFile);
    setErrorMessage('');
    setIsUploadingResume(true);

    try {
      const result = await resumesApi.uploadResume(selectedFile);
      setResumeUploadResult(result);
      console.log(
        `%c[CAREERINTELL NLP] Resume Ingested & Parsed: ${result.file_name} (${result.word_count} words, ${result.skills_extracted?.length || 0} skills detected)`,
        "color: #065f46; font-weight: bold; font-size: 13px; background: #d1fae5; padding: 4px 8px; border-radius: 4px; border: 1px solid #6ee7b7;"
      );
      await refreshProfile();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to parse resume PDF. Please ensure file is valid.';
      setErrorMessage(msg);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage('Please paste job description text before running diagnostics.');
      return;
    }
    
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      // 1. Analyze Job Description via Backend NLP
      const jdData = await intelligenceApi.analyzeJobDescription(jobDescription, targetRole);
      setJdAnalysis(jdData);

      // Build custom requirements from JD
      const customSkills = [
        ...jdData.required_skills.map((s) => ({ name: s, importance: 'Required', required_level: 80 })),
        ...jdData.preferred_skills.map((s) => ({ name: s, importance: 'Preferred', required_level: 70 }))
      ];

      // 2. Perform live skill gap matching against student profile
      const gaps = await intelligenceApi.analyzeMatch({
        role_title: jdData.title || targetRole,
        custom_skills: customSkills.length > 0 ? customSkills : undefined
      });
      setGapResults(gaps);

      // Print highlighted accuracy log to browser console for mentor evaluation
      if (gaps.model_accuracy) {
        console.log(
          `%c[CAREERINTELL AI] Live Diagnostic Model Accuracy: ${gaps.model_accuracy.overall_accuracy}% [${gaps.model_accuracy.evaluation_label}]`,
          "color: #1e40af; font-weight: bold; font-size: 14px; background: #dbeafe; padding: 5px 10px; border-radius: 6px; border: 1px solid #93c5fd;"
        );
        console.table({
          "Target Role": gaps.target_role,
          "Overall Model Accuracy": `${gaps.model_accuracy.overall_accuracy}%`,
          "Layout Extraction Quality": `${gaps.model_accuracy.layout_accuracy}%`,
          "Skill Token Confidence (Mean)": `${gaps.model_accuracy.skill_confidence}%`,
          "Section Structural Completeness": `${gaps.model_accuracy.structural_completeness}%`,
          "Semantic Match Precision": `${gaps.model_accuracy.semantic_precision}%`,
          "Evaluation Grade": gaps.model_accuracy.evaluation_label,
          "Document Analyzed": gaps.model_accuracy.details?.file_name || 'Resume'
        });
      }

      setAnalysisComplete(true);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage('Failed to run AI gap diagnostics. Please ensure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume & JD Analyzer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resume & Job Description Analysis
          </h1>
          <p className="text-sm text-slate-600 mt-1">Extract verified competencies with PyMuPDF and calculate instant compatibility against job requirements.</p>
        </div>

        <Link
          to="/dashboard"
          className="self-start sm:self-auto px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
        >
          Back to Dashboard
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!analysisComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Resume Upload */}
          <div className="pro-panel p-6 sm:p-8 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Step 1: Upload Resume (PyMuPDF NLP Parser)
              </h2>
              
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])} 
                  accept=".pdf" 
                  className="hidden" 
                />
                
                {isUploadingResume ? (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm font-semibold text-slate-700">Extracting text & identifying skills with NLP...</p>
                  </div>
                ) : file || resumeUploadResult ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-xl text-left w-full justify-between shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <File className="h-8 w-8 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {file ? file.name : resumeUploadResult?.file_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {file ? (file.size / 1024).toFixed(1) + ' KB' : 'Active Parsed Resume'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); setResumeUploadResult(null); }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {resumeUploadResult && resumeUploadResult.skills_extracted?.length > 0 && (
                      <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-left">
                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1.5">
                          Extracted & Inferred Skills ({resumeUploadResult.skills_extracted.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                          {resumeUploadResult.skills_extracted.map((s, idx) => (
                            <span 
                              key={idx} 
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                s.source === 'implied'
                                  ? 'bg-purple-50 border-purple-200 text-purple-800'
                                  : 'bg-white border-blue-200 text-blue-800'
                              }`}
                            >
                              {s.name} ({Math.round(s.confidence * 100)}%)
                              {s.source === 'implied' && (
                                <span className="ml-1 text-[9px] text-purple-600 font-bold uppercase">implied</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500">PDF Document (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Format: PDF with selectable text</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PyMuPDF Extractor
              </span>
            </div>
          </div>

          {/* Right: Target Role & Job Description */}
          <div className="pro-panel p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" />
                Step 2: Target Role & Job Description
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Target Role</label>
                  <select 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Paste Job Description</label>
                  <textarea 
                    rows={5}
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    placeholder="Paste job posting text (responsibilities, requirements, qualifications)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                  <div className="flex justify-between items-center mt-1.5 px-0.5">
                    <span className="text-[11px] text-slate-400">
                      {wordCount >= MAX_WORDS ? (
                        <span className="text-amber-600 font-medium">Maximum 500 words limit reached</span>
                      ) : (
                        'Max limit: 500 words'
                      )}
                    </span>
                    <span className={`text-xs font-medium ${wordCount >= MAX_WORDS ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                      {wordCount} / {MAX_WORDS} words
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                !jobDescription.trim() || isAnalyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                  Running AI Gap Diagnostics & NLP Extraction...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-blue-200" />
                  Run AI Gap Diagnostics
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Genuine Analysis Results Display */
        <div className="space-y-6 animate-fadeIn">
          <div className="pro-panel p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    Diagnostic Evaluation Complete
                  </span>
                  {gapResults?.model_accuracy && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Model Accuracy: <strong className="font-bold">{gapResults.model_accuracy.overall_accuracy}%</strong>
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Compatibility Analysis: {jdAnalysis?.title || targetRole}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Required Experience: {jdAnalysis?.min_experience_years || 0}+ Years • {jdAnalysis?.education_level || "Bachelor's Degree"}
                </p>
              </div>

              <button
                onClick={() => { setAnalysisComplete(false); setJobDescription(''); }}
                className="px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
              >
                Analyze Another Job
              </button>
            </div>

            {/* Restored Original 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="pro-card p-5 text-center bg-slate-50/50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Target Compatibility</span>
                <span className="text-4xl font-extrabold text-blue-600">{gapResults?.match_score || 75}%</span>
                <span className="text-xs text-emerald-700 block mt-1 font-bold">
                  {(gapResults?.match_score || 0) >= 75 ? 'Strong Placement Alignment' : 'Bridge Required Gaps'}
                </span>
              </div>

              <div className="pro-card p-5 text-center bg-slate-50/50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Satisfied Competencies</span>
                <span className="text-4xl font-extrabold text-emerald-600">
                  {((gapResults?.matched_count || 0) + (gapResults?.equivalent_count || 0) + (gapResults?.implied_count || 0))} / {gapResults?.total_required || 0}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {gapResults?.matched_count || 0} Direct · {gapResults?.equivalent_count || 0} Equiv · {gapResults?.implied_count || 0} Implied
                </span>
              </div>

              <div className="pro-card p-5 text-center bg-slate-50/50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-semibold block mb-1">Skill Gaps Identified</span>
                <span className={`text-4xl font-extrabold ${(gapResults?.missing_count || 0) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {gapResults?.missing_count || 0} Missing
                </span>
                <span className={`text-xs block mt-1 font-semibold ${(gapResults?.missing_count || 0) === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {(gapResults?.missing_count || 0) === 0 ? 'All Requirements Met' : 'Add to Roadmap'}
                </span>
              </div>
            </div>

            {/* Small Compact Model Prediction & Accuracy Box */}
            {gapResults?.model_accuracy && (
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 font-bold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Model Prediction Accuracy:</span>
                    <span className="text-sm font-extrabold text-indigo-700">{gapResults.model_accuracy.overall_accuracy}%</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200/60 uppercase">
                    {gapResults.model_accuracy.evaluation_label || 'EXCELLENT'} Confidence
                  </span>
                  <span className="hidden lg:inline text-slate-300">|</span>
                  <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600">
                    <span>Layout: <strong className="text-slate-800">{gapResults.model_accuracy.layout_accuracy}%</strong></span>
                    <span>•</span>
                    <span>Token Confidence: <strong className="text-slate-800">{gapResults.model_accuracy.skill_confidence}%</strong></span>
                    <span>•</span>
                    <span>Structure: <strong className="text-slate-800">{gapResults.model_accuracy.structural_completeness}%</strong></span>
                    <span>•</span>
                    <span>Precision: <strong className="text-slate-800">{gapResults.model_accuracy.semantic_precision}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    ⚡ Live Telemetry
                  </span>
                </div>
              </div>
            )}

            {/* Gap List from live match */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Skill Comparison & Placement Gap Breakdown
                </h3>
                <span className="text-xs text-slate-500">
                  Semantic & Implied Equivalencies Active
                </span>
              </div>
              
              <div className="space-y-3">
                {gapResults?.gaps?.map((gap, i) => {
                  const isSatisfied = gap.status === 'MATCHED' || gap.status === 'EQUIVALENT' || gap.status === 'IMPLIED';
                  return (
                    <div key={i} className="pro-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-200 rounded-xl bg-white shadow-xs">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{gap.skill_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            gap.status === 'MATCHED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : gap.status === 'EQUIVALENT'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : gap.status === 'IMPLIED'
                              ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              : gap.status === 'PARTIAL'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {gap.status === 'EQUIVALENT' ? 'EQUIVALENT STACK' : gap.status === 'IMPLIED' ? 'IMPLIED COMPETENCY' : gap.status}
                          </span>
                          {gap.satisfied_by && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              via {gap.satisfied_by}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500">
                            {gap.importance} • Target {gap.required_level}%
                          </span>
                        </div>
                        {gap.justification ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-slate-700 font-medium">{gap.justification}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 mt-1">
                            Current proficiency level: {gap.current_level}%. 
                            {isSatisfied
                              ? ' Meets target standard for this position.'
                              : ` Focus on bridging this ${gap.status.toLowerCase()} gap before interview stage.`}
                          </p>
                        )}
                      </div>

                      {!isSatisfied && (
                        <Link
                          to="/roadmap"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold self-start sm:self-auto flex items-center gap-1 shadow-sm shrink-0"
                        >
                          Add to Roadmap <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Link
                to="/roadmap"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>View My Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/intelligence"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <span>View Intelligence Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
