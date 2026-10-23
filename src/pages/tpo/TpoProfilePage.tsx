import { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Briefcase, 
  Sliders, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tpoApi } from '../../api/tpo';
import { TpoProfile } from '../../types';

export default function TpoProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TpoProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Head of Training & Placement');
  const [institutionName, setInstitutionName] = useState('Apex Institute of Technology & Management');
  const [department, setDepartment] = useState('Corporate Relations & Placement Cell');
  const [empId, setEmpId] = useState('TPO-DIR-2024');
  const [officeRoom, setOfficeRoom] = useState('Admin Block, Room 204');
  const [officialPhone, setOfficialPhone] = useState('+91 98765 12340');
  const [officeHours, setOfficeHours] = useState('Mon - Fri, 9:00 AM - 5:30 PM');
  const [placementSeason, setPlacementSeason] = useState('2025 - 2026 Placement Season');
  const [bio, setBio] = useState('Committed to facilitating tier-1 corporate partnerships and elevating student career readiness.');
  const [minCgpaCutoff, setMinCgpaCutoff] = useState(7.0);
  const [targetGradBatches, setTargetGradBatches] = useState('2025, 2026, 2027');

  useEffect(() => {
    fetchTpoProfile();
  }, []);

  const fetchTpoProfile = async () => {
    setLoading(true);
    try {
      const data = await tpoApi.getProfile();
      setProfile(data);
      setFullName(data.full_name || user?.name || '');
      setDesignation(data.designation || 'Head of Training & Placement');
      setInstitutionName(data.institution_name || 'Apex Institute of Technology & Management');
      setDepartment(data.department || 'Corporate Relations & Placement Cell');
      setEmpId(data.emp_id || 'TPO-DIR-2024');
      setOfficeRoom(data.office_room || 'Admin Block, Room 204');
      setOfficialPhone(data.official_phone || '+91 98765 12340');
      setOfficeHours(data.office_hours || 'Mon - Fri, 9:00 AM - 5:30 PM');
      setPlacementSeason(data.placement_season || '2025 - 2026 Placement Season');
      setBio(data.bio || '');
      setMinCgpaCutoff(data.min_cgpa_cutoff ?? 7.0);
      setTargetGradBatches(data.target_grad_batches || '2025, 2026, 2027');
    } catch (err: any) {
      console.warn('Could not fetch TPO profile:', err);
      setErrorMessage('Failed to load profile. Default parameters loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const updated = await tpoApi.updateProfile({
        full_name: fullName.trim(),
        designation: designation.trim(),
        institution_name: institutionName.trim(),
        department: department.trim(),
        emp_id: empId.trim(),
        office_room: officeRoom.trim(),
        official_phone: officialPhone.trim(),
        office_hours: officeHours.trim(),
        placement_season: placementSeason.trim(),
        bio: bio.trim(),
        min_cgpa_cutoff: Number(minCgpaCutoff),
        target_grad_batches: targetGradBatches.trim(),
      });
      setProfile(updated);
      setSuccessMessage('Officer profile & placement policies updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Officer Profile & Placement Directorate...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-extrabold text-xl sm:text-2xl">
                {fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TP'}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{fullName || 'Training & Placement Officer'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Placement Officer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-300/90 font-semibold flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{designation}</span>
                <span className="text-slate-500">•</span>
                <span>{institutionName}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-2 pt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile?.email || user?.email}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-emerald-400">ID: {empId}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/tpo"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Open Placement Portal</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Placement Oversight Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Supervised Pool</span>
            <span className="text-2xl font-black text-slate-900">{profile?.total_supervised_students || 0}</span>
            <span className="text-[11px] text-blue-600 font-semibold block">Registered Candidates</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Batch Readiness</span>
            <span className="text-2xl font-black text-slate-900">{profile?.batch_average_readiness || 0}%</span>
            <span className="text-[11px] text-emerald-600 font-semibold block">Campus Average</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Eligible Pool</span>
            <span className="text-2xl font-black text-slate-900">{profile?.eligible_students_count || 0}</span>
            <span className="text-[11px] text-amber-600 font-semibold block">≥ {minCgpaCutoff} CGPA Criteria</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Season</span>
            <span className="text-lg font-black text-slate-900 truncate block">{placementSeason.split(' ')[0]}</span>
            <span className="text-[11px] text-purple-600 font-semibold block">Recruitment Drives</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Official Officer Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Placement Officer Identity & Institutional Details</h2>
                <p className="text-xs text-slate-500">Official details visible to recruiters and university students</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Executive Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Officer Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="e.g. Dr. Priya Sharma"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Official Designation / Title
              </label>
              <input
                type="text"
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="e.g. Head of Training & Placement"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Institution / University
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. Apex Institute of Technology & Management"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Department / Cell Name
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                placeholder="e.g. Corporate Relations & Placement Directorate"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Official Employee / Officer ID
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. TPO-DIR-2024"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Placement Season Cycle
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={placementSeason}
                  onChange={(e) => setPlacementSeason(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. 2025 - 2026 Season"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Office Location */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Office Location & Contact Coordination</h2>
                <p className="text-xs text-slate-500">How corporate recruiters and students can reach the placement desk</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Desk</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Official Phone / Direct Line
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={officialPhone}
                  onChange={(e) => setOfficialPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="+91 98765 12340"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Office / Cabin Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={officeRoom}
                  onChange={(e) => setOfficeRoom(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Admin Block, Room 204"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Student & Recruiter Consultation Hours
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="Mon - Fri, 9:00 AM - 5:30 PM"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Placement Cell Note / Officer Message
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-normal"
              placeholder="Officer message or placement advisory for registered students..."
            />
          </div>
        </div>

        {/* Section 3: Campus Recruitment Drive Policy Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Campus Recruitment Eligibility Criteria</h2>
                <p className="text-xs text-slate-500">Benchmark minimum eligibility rules applied across campus placement drives</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Policy Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Minimum CGPA Cutoff for Tier-1 Companies
                </label>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {minCgpaCutoff} CGPA
                </span>
              </div>
              <input
                type="range"
                min={5.0}
                max={9.5}
                step={0.1}
                value={minCgpaCutoff}
                onChange={(e) => setMinCgpaCutoff(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Students below this threshold will be flagged for targeted skill upliftment programs before drive registrations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Eligible Graduating Batches
              </label>
              <input
                type="text"
                value={targetGradBatches}
                onChange={(e) => setTargetGradBatches(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="2025, 2026, 2027"
              />
              <p className="text-[11px] text-slate-500">
                Comma-separated graduating years currently active for campus recruitment drives.
              </p>
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Placement Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Officer Profile & Policies</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
