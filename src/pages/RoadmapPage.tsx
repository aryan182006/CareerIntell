import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { intelligenceApi, RoadmapResponse, RoadmapItem } from '../api/intelligence';
import { CheckCircle2, Circle, Clock, Sparkles, ExternalLink, Loader2, Check, Briefcase } from 'lucide-react';
import { cn } from '../utils/helpers';
import { Link } from 'react-router-dom';

export default function RoadmapPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const data = await intelligenceApi.getRoadmap();
        setRoadmap(data);
      } catch (e) {
        console.error('Failed to load roadmap:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleToggleStatus = async (item: RoadmapItem) => {
    if (updatingItemId) return;
    setUpdatingItemId(item.id);

    const nextStatus = item.status === 'NOT_STARTED' 
      ? 'IN_PROGRESS' 
      : item.status === 'IN_PROGRESS' 
      ? 'COMPLETED' 
      : 'NOT_STARTED';

    try {
      const updated = await intelligenceApi.updateRoadmapItemStatus(item.id, nextStatus);
      setRoadmap(updated);
    } catch (e) {
      console.error('Failed to update task status:', e);
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Group items by phase
  const groupedPhases: Record<string, RoadmapItem[]> = {};
  if (roadmap?.items) {
    for (const item of roadmap.items) {
      if (!groupedPhases[item.phase]) {
        groupedPhases[item.phase] = [];
      }
      groupedPhases[item.phase].push(item);
    }
  }

  const phaseKeys = Object.keys(groupedPhases);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Learning Pathway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Career Roadmap
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Target Role: <strong className="text-slate-900">{roadmap?.target_role_title || user?.targetRole || 'Data Scientist'}</strong> • Interactive milestone tracking to achieve placement readiness.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl pro-card text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Progress Bar Card */}
      <div className="pro-panel p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Roadmap Progress</span>
          <span className="text-sm font-extrabold text-purple-700">{roadmap?.completion_percentage || 0}% Completed</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 transition-all duration-700"
            style={{ width: `${roadmap?.completion_percentage || 0}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Tip: Click any milestone item below to toggle its status (<span className="text-slate-700 font-semibold">Not Started → In Progress → Completed</span>).
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 text-purple-600 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Synthesizing personalized learning milestones...</span>
        </div>
      )}

      {/* Phased Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-12 pl-2">
        {phaseKeys.map((phaseName, pIdx) => {
          const items = groupedPhases[phaseName];
          const allCompleted = items.every((i) => i.status === 'COMPLETED');
          const anyInProgress = items.some((i) => i.status === 'IN_PROGRESS');

          return (
            <div key={phaseName} className="relative pl-8">
              {/* Timeline node */}
              <div
                className={cn(
                  'absolute -left-[21px] top-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 shadow-md',
                  allCompleted
                    ? 'bg-emerald-600 text-white'
                    : anyInProgress
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {allCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : anyInProgress ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>

              {/* Card Content */}
              <div className="pro-panel p-6 sm:p-8 space-y-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Phase {pIdx + 1}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{phaseName}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {phaseName.toLowerCase().includes('placement') && (
                      <Link
                        to="/interview-prep"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-800 border border-amber-400/40 text-xs font-bold hover:bg-amber-500/25 transition-colors shadow-sm"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                        <span>Practice Interview Questions ➔</span>
                      </Link>
                    )}

                    <span
                      className={cn(
                        'text-xs px-3 py-1 rounded-full font-bold border',
                        allCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : anyInProgress
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      )}
                    >
                      {allCompleted ? 'Completed' : anyInProgress ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Milestone Deliverables</h4>

                  <div className="space-y-3">
                    {items.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleStatus(task)}
                        className={`pro-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-xl cursor-pointer transition-all ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-50/40 border-blue-200 hover:bg-blue-50/70'
                            : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 p-1 rounded-md border flex items-center justify-center shrink-0 ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-300 border-slate-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {task.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{task.description}</p>

                            {/* Resource Links */}
                            {task.resources && task.resources.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {task.resources.map((res, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
                                  >
                                    <span>{res.provider}: {res.title}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className="text-xs text-slate-500">{task.duration}</span>
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded font-bold border transition-colors ${
                              task.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-slate-200/80 text-slate-600 border-slate-300'
                            }`}
                          >
                            {updatingItemId === task.id ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              task.status.replace('_', ' ')
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

