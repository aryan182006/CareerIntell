import { useState, useEffect } from 'react';
import { assessmentsApi, AssessmentItem, QuestionItem, AssessmentResult, AssessmentHistoryItem } from '../api/assessments';
import { useAuth } from '../context/AuthContext';
import { Award, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssessmentPage() {
  const { refreshProfile } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [aList, hList] = await Promise.all([
          assessmentsApi.listAssessments(),
          assessmentsApi.getHistory().catch(() => [])
        ]);
        setAssessments(aList);
        setHistory(hList);
      } catch (e) {
        console.error('Failed to load assessments:', e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!selectedAssessment || result || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAssessment, result, timeLeft]);

  const handleStartQuiz = async (assessment: AssessmentItem) => {
    setLoading(true);
    try {
      const qList = await assessmentsApi.getQuestions(assessment.id);
      setSelectedAssessment(assessment);
      setQuestions(qList);
      setCurrentQIndex(0);
      setAnswers({});
      setResult(null);
      setTimeLeft(assessment.time_limit_minutes * 60);
    } catch (e) {
      console.error('Failed to start quiz:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!selectedAssessment) return;
    setIsSubmitting(true);
    try {
      const timeSpent = selectedAssessment.time_limit_minutes * 60 - timeLeft;
      const res = await assessmentsApi.submitAssessment(selectedAssessment.id, answers, Math.max(10, timeSpent));
      setResult(res);
      await refreshProfile();
      // refresh history
      const hList = await assessmentsApi.getHistory();
      setHistory(hList);
    } catch (e) {
      console.error('Failed to submit assessment:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Skill Certification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Skill Assessments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Test and validate competencies across Python, ML, and SQL to earn verified credentials and elevate placement readiness.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="self-start sm:self-auto px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
        >
          Back to Dashboard
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-emerald-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading assessment center...</span>
        </div>
      )}

      {/* QUIZ ACTIVE VIEW */}
      {selectedAssessment && !result && questions.length > 0 && (
        <div className="pro-panel p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedAssessment.category} Assessment</span>
              <h2 className="text-xl font-bold text-slate-900">{selectedAssessment.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                timeLeft < 180 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
              </button>
            </div>
          </div>

          {/* Question Progress Tracker */}
          <div className="flex flex-wrap items-center gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQIndex(idx)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentQIndex === idx
                    ? 'bg-blue-600 text-white'
                    : answers[q.id] !== undefined
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Current Question */}
          {questions[currentQIndex] && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Question {currentQIndex + 1} of {questions.length}</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">Difficulty: {questions[currentQIndex].difficulty}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {questions[currentQIndex].question_text}
              </h3>

              <div className="space-y-3 pt-2">
                {questions[currentQIndex].options.map((opt, optIdx) => {
                  const isSelected = answers[questions[currentQIndex].id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(questions[currentQIndex].id, optIdx)}
                      className={`p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer border border-slate-200"
                >
                  Previous
                </button>

                {currentQIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Question <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    Submit Final Answers <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUIZ RESULT REPORT */}
      {result && selectedAssessment && (
        <div className="pro-panel p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
          <div className="text-center py-4 space-y-3">
            <div className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center ${
              result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">
              {result.passed ? 'Assessment Passed! Verified Skill Earned' : 'Assessment Completed'}
            </h2>
            <p className="text-xs text-slate-500">
              {result.passed
                ? `Congratulations! Your score of ${result.score_percentage}% validated your ${selectedAssessment.category} proficiency.`
                : `You scored ${result.score_percentage}%. Passing threshold is ${selectedAssessment.passing_percentage}%. Review recommendations below.`}
            </p>

            <div className="flex justify-center gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                <span className="text-xs text-slate-500 font-semibold block">Score</span>
                <span className="text-2xl font-extrabold text-blue-600">{result.score_percentage}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                <span className="text-xs text-slate-500 font-semibold block">Correct</span>
                <span className="text-2xl font-extrabold text-emerald-600">{result.correct_answers} / {result.total_questions}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[120px]">
                <span className="text-xs text-slate-500 font-semibold block">Time Spent</span>
                <span className="text-2xl font-extrabold text-purple-600">{Math.round(result.time_taken_seconds / 60)}m</span>
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Solution & Explanations</h3>

            <div className="space-y-3">
              {result.feedback.map((fb, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-left ${
                    fb.is_correct ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold text-sm text-slate-900">
                      {idx + 1}. {fb.question_text}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      fb.is_correct ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}>
                      {fb.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  {fb.explanation && (
                    <p className="text-xs text-slate-600 mt-2 bg-white/70 p-2.5 rounded-lg border border-slate-200">
                      <strong>Explanation:</strong> {fb.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => { setResult(null); setSelectedAssessment(null); }}
              className="px-5 py-2.5 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
            >
              Back to Assessments
            </button>
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <span>View Updated Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ASSESSMENT CATALOG & ATTEMPT HISTORY */}
      {!selectedAssessment && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((a) => (
              <div key={a.id} className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{a.category}</span>
                    <span>{a.time_limit_minutes} Mins</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{a.question_count} MCQs</span>
                    <span>Pass: {a.passing_percentage}%</span>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(a)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <span>Start Timed Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Past Attempts History */}
          {history.length > 0 && (
            <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Past Assessment Attempts & Verified Badges
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Assessment</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="py-3 px-4 font-bold text-slate-900">{h.assessment_title}</td>
                        <td className="py-3 px-4">{h.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{h.score_percentage}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {h.passed ? 'Verified Pass' : 'Needs Practice'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(h.completed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
