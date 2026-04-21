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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Job Openings</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Find your next opportunity at RVSL</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-end w-full md:w-auto">
          <div className="relative w-full sm:w-auto sm:flex-1 md:w-64">
              <label htmlFor="job-search" className="sr-only">Search jobs</label>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="job-search"
                type="text"
                aria-label="Search jobs"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm md:text-base bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAiTip}
              className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors flex items-center gap-2 font-bold whitespace-nowrap min-h-[44px] sm:min-h-auto"
              aria-label="Get an AI career tip"
            >
              <Sparkles aria-hidden="true" className="w-4 h-4" />
              <span className="hidden sm:inline">AI Tip</span>
              <span className="sm:hidden">AI</span>
            </button>
            <label htmlFor="location-filter" className="sr-only">Filter by location</label>
            <select
              id="location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-600 dark:text-slate-400 min-h-[44px] sm:min-h-auto"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>

            <label htmlFor="type-filter" className="sr-only">Filter by job type</label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-600 dark:text-slate-400 min-h-[44px] sm:min-h-auto"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>

            {(searchTerm || locationFilter || typeFilter) && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter(''); }}
                className="px-3 py-2.5 text-slate-400 hover:text-orange-600 transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
                title="Clear filters"
                aria-label="Clear filters"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <span className="sr-only">Loading jobs</span>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" aria-hidden="true"></div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center" role="status" aria-live="polite">
          <Briefcase aria-hidden="true" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No jobs found matching your criteria.</p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter(''); }}
            className="mt-4 text-orange-600 font-bold hover:underline"
            aria-label="Clear all filters"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredJobs.map(job => (
            <article
              key={job.id}
              aria-labelledby={`job-title-${job.id}`}
              tabIndex={0}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 id={`job-title-${job.id}`} className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-2 flex-1">{job.title}</h3>
                  <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded uppercase whitespace-nowrap flex-shrink-0">
                    {job.type}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 flex-1">{job.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1 flex-shrink-0"><MapPin aria-hidden="true" className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{job.location}</span></div>
                  <div className="hidden sm:block">•</div>
                  <div className="flex items-center gap-1 font-bold text-orange-600 flex-shrink-0">{job.salaryRange}</div>
                </div>
              </div>

              <button
                type="button"
                aria-label={`Apply to ${job.title}`}
                className="w-full py-3 md:py-3.5 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 active:bg-orange-800 transition-colors min-h-[44px]"
              >
                Apply Now
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
