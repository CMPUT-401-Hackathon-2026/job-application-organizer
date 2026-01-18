import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, Check, X, FileDown, Scan, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { resume, applications } from '../api';
import { useToastStore } from '../components/ui/Toast';
import { ATSScoreCard } from '../components/ATSScoreCard';
import type { Resume } from '../types';

export function BuilderPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { addToast } = useToastStore();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Partial<Resume>>({});

  const { data: application } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applications.list().then((apps) => apps.find((a) => a.id === applicationId)),
    enabled: !!applicationId,
  });

  // const { data: resumeData, refetch } = useQuery({
  //   queryKey: ['resume', applicationId],
  //   queryFn: () => resume.build(applicationId!),
  //   enabled: !!applicationId,
  // });

//   const {
//   data: resumeData,
//   refetch,
//   isLoading: isResumeLoading,
// } = useQuery({
//   queryKey: ['resume', applicationId],
//   queryFn: () => resume.get(applicationId!), // GET only
//   enabled: !!applicationId,
//   retry: false,
// });
const { data: resumeData, refetch } = useQuery({
  queryKey: ['resume', applicationId],
  queryFn: () => resume.get(applicationId!),
  enabled: !!applicationId,
});



  useEffect(() => {
    if (resumeData) {
      setEditedContent(resumeData);
    }
  }, [resumeData]);

  if (!application || !resumeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Loading resume...</div>
      </div>
    );
  }

  const job = application.job;
  const jobKeywords = job.tags;

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveSection = async () => {
    if (!applicationId || !editingSection) return;
    try {
      await resume.update(applicationId, editedContent);
      addToast('Resume updated successfully', 'success');
      setEditingSection(null);
      refetch();
    } catch {
      addToast('Failed to update resume', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(resumeData);
    setEditingSection(null);
  };

  const handleATSScan = async () => {
    if (!applicationId) return;
    // ATS scan is handled by ATSScoreCard component
  };

  const handleDownloadLatex = async () => {
    if (!applicationId) return;
    try {
      await resume.downloadLatex(applicationId);
      addToast('LaTeX file downloaded', 'success');
    } catch {
      addToast('Failed to download LaTeX file', 'error');
    }
  };

  const currentData = editedContent || resumeData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
        <p className="text-muted-foreground">
          {job.title} at {job.company}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Resume Preview */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 border border-border rounded-lg p-8 shadow-lg min-h-[842px]">
            {/* Header Section */}
            <section className="mb-6 pb-6 border-b border-border">
              {editingSection === 'header' ? (
                <div className="space-y-2">
                  <textarea
                    value={currentData.header || ''}
                    onChange={(e) =>
                      setEditedContent({ ...editedContent, header: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-xl"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 border border-border rounded-md hover:bg-muted"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <pre className="font-semibold text-xl whitespace-pre-wrap">{currentData.header}</pre>
                  <button
                    onClick={() => handleEditSection('header')}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </section>

            {/* Education Section */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Education</h2>
                {editingSection !== 'education' && (
                  <button
                    onClick={() => handleEditSection('education')}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              {editingSection === 'education' ? (
                <div className="space-y-3">
                  {currentData.education?.map((edu, index) => (
                    <div key={edu.id} className="space-y-2 p-2 border border-border rounded-md">
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const newEducation = [...(currentData.education || [])];
                          newEducation[index] = { ...edu, school: e.target.value };
                          setEditedContent({ ...editedContent, education: newEducation });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="School/University"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = [...(currentData.education || [])];
                            newEducation[index] = { ...edu, degree: e.target.value };
                            setEditedContent({ ...editedContent, education: newEducation });
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => {
                            const newEducation = [...(currentData.education || [])];
                            newEducation[index] = { ...edu, field: e.target.value };
                            setEditedContent({ ...editedContent, education: newEducation });
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Field of Study"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 border border-border rounded-md hover:bg-muted"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentData.education?.map((edu) => (
                    <div key={edu.id} className="text-sm">
                      <p className="font-semibold">{edu.school}</p>
                      <p className="text-muted-foreground">
                        {edu.degree} in {edu.field}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Experience Section */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Experience</h2>
                {editingSection !== 'experience' && (
                  <button
                    onClick={() => handleEditSection('experience')}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              {editingSection === 'experience' ? (
                <div className="space-y-3">
                  {currentData.experience?.map((exp, index) => (
                    <div key={exp.id} className="space-y-2 p-2 border border-border rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExperience = [...(currentData.experience || [])];
                            newExperience[index] = { ...exp, company: e.target.value };
                            setEditedContent({ ...editedContent, experience: newExperience });
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExperience = [...(currentData.experience || [])];
                            newExperience[index] = { ...exp, position: e.target.value };
                            setEditedContent({ ...editedContent, experience: newExperience });
                          }}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Position"
                        />
                      </div>
                      <textarea
                        value={exp.description.join('\n')}
                        onChange={(e) => {
                          const newExperience = [...(currentData.experience || [])];
                          newExperience[index] = {
                            ...exp,
                            description: e.target.value.split('\n').filter((l) => l.trim()),
                          };
                          setEditedContent({ ...editedContent, experience: newExperience });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        placeholder="One bullet per line (press Enter for new line)"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 border border-border rounded-md hover:bg-muted"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentData.experience?.map((exp) => (
                    <div key={exp.id} className="text-sm">
                      <p className="font-semibold">{exp.company}</p>
                      <p className="text-muted-foreground mb-1">{exp.position}</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        {exp.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Projects Section */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Projects</h2>
                {editingSection !== 'projects' && (
                  <button
                    onClick={() => handleEditSection('projects')}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              {editingSection === 'projects' ? (
                <div className="space-y-3">
                  {currentData.projects?.map((proj, index) => (
                    <div key={proj.id} className="space-y-2">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const newProjects = [...(currentData.projects || [])];
                          newProjects[index] = { ...proj, name: e.target.value };
                          setEditedContent({ ...editedContent, projects: newProjects });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Project name"
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) => {
                          const newProjects = [...(currentData.projects || [])];
                          newProjects[index] = { ...proj, description: e.target.value };
                          setEditedContent({ ...editedContent, projects: newProjects });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        placeholder="Description (press Enter for new line)"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 border border-border rounded-md hover:bg-muted"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentData.projects?.map((proj) => (
                    <div key={proj.id} className="text-sm">
                      <p className="font-semibold">{proj.name}</p>
                      <p className="text-muted-foreground">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Tech Stack Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Technical Skills</h2>
                {editingSection !== 'techStack' && (
                  <button
                    onClick={() => handleEditSection('techStack')}
                    className="p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              {editingSection === 'techStack' ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={currentData.techStack?.join(', ') || ''}
                    onChange={(e) =>
                      setEditedContent({
                        ...editedContent,
                        techStack: e.target.value.split(',').map((t) => t.trim()),
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Comma separated"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSection}
                      className="p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 border border-border rounded-md hover:bg-muted"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{currentData.techStack?.join(', ')}</p>
              )}
            </section>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleATSScan}
              className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
            >
              <Scan size={20} />
              ATS Scan
            </button>
            <button
              onClick={handleDownloadLatex}
              className="flex-1 border border-border bg-background py-3 rounded-md font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
            >
              <FileDown size={20} />
              Download LaTeX
            </button>
          </div>
        </div>

        {/* Side Panel - Job Keywords */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-primary" />
              <h3 className="font-semibold">Job Keywords</h3>
            </div>
            <div className="space-y-2">
              {jobKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-block px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <ATSScoreCard applicationId={applicationId!} />
        </div>
      </div>
    </div>
  );
}
