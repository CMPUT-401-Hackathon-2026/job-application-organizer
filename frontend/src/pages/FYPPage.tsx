import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobs } from '../api';
import { JobCard } from '../components/JobCard';

export function FYPPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recommendations = [] } = useQuery({
    queryKey: ['jobs', 'recommendations'],
    queryFn: () => jobs.search('React'),
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-12 text-center border border-border">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find a job that fits you</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover opportunities tailored to your skills and interests
          </p>
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">For You</h2>
        {recommendations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recommendations available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} onClick={() => navigate(`/search?jobId=${job.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* About Us Section */}
      <section className="mb-12">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">About Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to the Job Application Organizer, a project built by the CMPUT 401 team for the hackathon.
                This application helps job seekers efficiently organize their job applications, track their progress,
                and build professional resumes tailored to each opportunity. Our goal is to make the job search
                process more manageable and successful.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
