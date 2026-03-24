import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Sparkles, X } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { assistant } from '../services/assistantService';
import toast from 'react-hot-toast';

export function JobFeed() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, 'jobs'), orderBy('postedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const title = job.title || '';
    const description = job.description || '';
    const location = job.location || '';
    const type = job.type || '';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || location === locationFilter;
    const matchesType = typeFilter === '' || type === typeFilter;
    return matchesSearch && matchesLocation && matchesType;
  });

  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(jobs.map(j => j.type).filter(Boolean)));

  const handleAiTip = async () => {
    const toastId = toast.loading('Consulting Real Assistant...');
    try {
      const tip = await assistant.chat("Give me a quick career tip for someone looking for a job in Nigeria.");
      toast.success(tip, { id: toastId, duration: 6000 });
    } catch (error) {
      toast.error('Failed to get AI tip', { id: toastId });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Job Openings</h2>
          <p className="text-slate-500 dark:text-slate-400">Find your next opportunity at RVSL</p>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleAiTip}
              className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Sparkles className="w-4 h-4" /> AI Tip
            </button>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm text-slate-600 dark:text-slate-400"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm text-slate-600 dark:text-slate-400"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>

            {(searchTerm || locationFilter || typeFilter) && (
              <button
                onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter(''); }}
                className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                title="Clear filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No jobs found matching your criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter(''); }}
            className="mt-4 text-orange-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded uppercase">
                  {job.type}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{job.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</div>
                <div className="flex items-center gap-1 font-bold text-orange-600">{job.salaryRange}</div>
              </div>
              <button className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
