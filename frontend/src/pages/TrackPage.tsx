import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, MessageSquare, Building2, Briefcase, Calendar } from 'lucide-react';
import { applications, communications, profile } from '../api';
import { StatusPill } from '../components/StatusPill';
import { Drawer } from '../components/ui/Drawer';
import { Modal } from '../components/ui/Modal';
import { JobCard } from '../components/JobCard';
import { useToastStore } from '../components/ui/Toast';
import type { Application, ApplicationStatus } from '../types';

export function TrackPage() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generatedReply, setGeneratedReply] = useState('');
  const { addToast } = useToastStore();

  const { data: appsList = [], refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applications.list(),
  });

  // Filter to only show applied applications (not drafts)
  // Filter to only show applied applications (not drafts) and sort them
  const appliedApps = appsList
    .filter((app) => app.stage !== 'draft')
    .sort((a, b) => {
      // First, sort by date (newest first)
      const dateA = new Date(a.date_applied || '1970-01-01').getTime();
      const dateB = new Date(b.date_applied || '1970-01-01').getTime();
      
      if (dateB !== dateA) {
        return dateB - dateA; // Newest first
      }
      
      // If dates are equal, sort alphabetically by company name
      return a.job.company.localeCompare(b.job.company);
    });

  const { data: comms = [] } = useQuery({
    queryKey: ['communications', selectedApplication?.id],
    queryFn: () => communications.list(selectedApplication?.id!),
    enabled: !!selectedApplication?.id,
  });

  const handleStatusChange = async (appId: string, stage: ApplicationStatus) => {
    try {
      await applications.updateStatus(appId, stage);
      await refetch(); // Wait for refetch to complete
      addToast('Status updated successfully', 'success');
    } catch (error) {
      console.error('Status update error:', error);
      addToast('Failed to update status', 'error');
    }
  };

  const handleView = (app: Application) => {
    setSelectedApplication(app);
    setShowModal(true);
  };

  const handleResponses = (app: Application) => {
    setSelectedApplication(app);
    setShowDrawer(true);
  };

  const handleGenerateReply = async () => {
    if (!selectedApplication) return;
    
    try {
      // Get user profile to get the name
      const userProfile = await profile.get();
      const userName = userProfile.name || 'Bhuvnesh';
      
      const genericReply = `Thank you, for reaching out regarding the position at your company. I am very interested in this opportunity and would be happy to discuss how my skills and experience align with your needs. Please let me know when would be a convenient time to connect.

  Best Regards,
  ${userName}`;
      
      setGeneratedReply(genericReply);
    } catch {
      // Fallback if profile fetch fails
      const genericReply = `Thank you for reaching out regarding the position at your company. I am very interested in this opportunity and would be happy to discuss how my skills and experience align with your needs. Please let me know when would be a convenient time to connect.
  Best Regards,
  Bhuvnesh`;
      setGeneratedReply(genericReply);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Application Tracker</h1>
        <p className="text-muted-foreground">Track and manage your job applications</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden shadow-sm min-h-[500px] flex flex-col">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Company</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Position</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Date Applied</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appliedApps.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Briefcase size={48} className="opacity-50" />
                    <p className="text-base font-medium">No applications yet</p>
                    <p className="text-sm">Start applying to jobs to track your progress</p>
                  </div>
                </td>
              </tr>
            ) : (
              appliedApps.map((app) => (
                <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-muted-foreground" />
                      <span className="font-medium">{app.job.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{app.job.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {app.date_applied}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={app.stage}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value as ApplicationStatus)
                      }
                      className="bg-background border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejection">Rejection</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(app)}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        aria-label="View job"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleResponses(app)}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        aria-label="View responses"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {appliedApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p>No applications yet</p>
          </div>
        ) : (
          appliedApps.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{app.job.title}</h3>
                  <p className="text-muted-foreground">{app.job.company}</p>
                </div>
                <StatusPill status={app.stage} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar size={14} />
                <span>Applied {app.date_applied}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <select
                  value={app.stage}
                  onChange={(e) =>
                    handleStatusChange(app.id, e.target.value as ApplicationStatus)
                  }
                  className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejection">Rejection</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(app)}
                  className="flex-1 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={() => handleResponses(app)}
                  className="flex-1 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Responses
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Job Details"
        size="lg"
      >
        {selectedApplication && (
          <JobCard job={selectedApplication.job} detailed={true} />
        )}
      </Modal>

      {/* Communications Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setSelectedApplication(null);
          setGeneratedReply('');
        }}
        title="Communication Log"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{selectedApplication.job.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedApplication.job.company}</p>
            </div>

            <div className="space-y-4">
              {/* Always show generic HR response */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Application Received</span>
                  <span className="text-xs text-muted-foreground">{selectedApplication.date_applied || 'Recent'}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Type: email | Contact: HR Team
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  Hello Bhuvnesh,
                  {'\n\n'}
                  Thank you for your interest in a new opportunity with {selectedApplication.job.company} and for applying to the {selectedApplication.job.title}.
                  {'\n\n'}
                  We're excited to learn more about you! Our Talent Acquisition team will be reviewing your experience and qualifications. If selected to progress in the process, we will be in touch with next steps.
                  {'\n\n'}
                  You can also track status of your application within your candidate profile at our website.
                  {'\n\n'}
                  Thank you,
                  {'\n'}
                  HR team
                </p>
              </div>
              
            {/* Show other communications if any */}
            {comms.map((comm) => (
              <div key={comm.id} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comm.summary}</span>
                  <span className="text-xs text-muted-foreground">{comm.received_at}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Type: {comm.response_type} {comm.contact && `| Contact: ${comm.contact}`}
                </p>
                <p className="text-sm whitespace-pre-wrap">{comm.details}</p>
              </div>
            ))}
          </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={handleGenerateReply}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Generate Reply
              </button>
              {generatedReply && (
                <textarea
                  value={generatedReply}
                  onChange={(e) => setGeneratedReply(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={8}
                  placeholder="Generated reply will appear here..."
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}