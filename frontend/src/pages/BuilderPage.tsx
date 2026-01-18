import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, Check, X, FileDown, Scan, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resume, jobs } from '../api';
import { useToastStore } from '../components/ui/Toast';
import type { Resume } from '../types';

function isResumeComplete(resumeData: any): boolean {
  // Check if resume has all the required fields
  return !!(
    resumeData?.header &&
    resumeData?.education &&
    resumeData?.experience &&
    Array.isArray(resumeData.education) &&
    Array.isArray(resumeData.experience)
  );
}

export function BuilderPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { addToast } = useToastStore();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Partial<Resume>>({});
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsDetails, setAtsDetails] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Load the JOB details (not application)
  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', applicationId],
    queryFn: () => jobs.get(applicationId!),
    enabled: !!applicationId,
  });

  // First try to get existing resume
  const { data: existingResume, isLoading: isLoadingExisting, error: existingError } = useQuery({
    queryKey: ['resume', applicationId],
    queryFn: () => resume.get(applicationId!),
    enabled: !!applicationId,
    retry: false,
  });

  // Check if existing resume is incomplete
  const needsRebuild = existingResume && !isResumeComplete(existingResume);

  // If no resume exists OR resume is incomplete, build one
  const { data: builtResume, isLoading: isBuilding } = useQuery({
    queryKey: ['resume-build', applicationId],
    queryFn: async () => {
      console.log('Building resume...');
      const result = await resume.build(applicationId!);
      console.log('Build result:', result);
      return result;
    },
    enabled: !!applicationId && (!existingResume || needsRebuild) && !isLoadingExisting,
  });

  const resumeData = (needsRebuild ? builtResume : existingResume) || builtResume;
  const isLoading = isLoadingExisting || isBuilding || isLoadingJob;

  // Debug logging
  useEffect(() => {
    console.log('BuilderPage state:', {
      applicationId,
      hasJob: !!job,
      existingResume,
      needsRebuild,
      builtResume,
      resumeData,
      isLoading,
      isBuilding,
    });
  }, [applicationId, job, existingResume, needsRebuild, builtResume, resumeData, isLoading, isBuilding]);

  // Mutation for updating resume
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Resume>) => resume.update(applicationId!, data),
    onSuccess: (updatedResume) => {
      addToast('Resume updated successfully', 'success');
      setEditingSection(null);
      // Update the cache with the new data
      queryClient.setQueryData(['resume', applicationId], updatedResume);
    },
    onError: () => {
      addToast('Failed to update resume', 'error');
    },
  });

  useEffect(() => {
    if (resumeData && isResumeComplete(resumeData)) {
      setEditedContent(resumeData);
    }
  }, [resumeData]);

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          {isLoadingJob ? 'Loading job...' : 'Job not found'}
        </div>
      </div>
    );
  }

  if (isLoading || !resumeData || !isResumeComplete(resumeData)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          {isBuilding ? 'Building your tailored resume...' : 'Loading resume...'}
          {needsRebuild && <p className="text-xs mt-2">Incomplete resume detected, rebuilding...</p>}
        </div>
      </div>
    );
  }

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    await updateMutation.mutateAsync(editedContent);
  };

  const handleCancelEdit = () => {
    setEditedContent(resumeData);
    setEditingSection(null);
  };

  const handleATSScan = async () => {
    if (!applicationId) return;
    
    setIsScanning(true);
    try {
      const result = await resume.atsScan(applicationId);
      setAtsScore(result.score);
      setAtsDetails(result);
      addToast(`ATS Score: ${result.score}/100`, 'success');
    } catch (error) {
      addToast('Failed to perform ATS scan', 'error');
      console.error('ATS scan error:', error);
    } finally {
      setIsScanning(false);
    }
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

  const handleDownloadPdf = async () => {
    if (!applicationId) return;
    try {
      await resume.downloadPdf(applicationId);
      addToast('PDF downloaded successfully', 'success');
    } catch (error: any) {
      addToast(error?.message || 'Failed to download PDF', 'error');
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

            {/* Summary Section */}
            {currentData.summary && (
              <section className="mb-6 pb-6 border-b border-border">
                {editingSection === 'summary' ? (
                  <div className="space-y-2">
                    <textarea
                      value={currentData.summary || ''}
                      onChange={(e) =>
                        setEditedContent({ ...editedContent, summary: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <p className="text-sm text-muted-foreground">{currentData.summary}</p>
                    <button
                      onClick={() => handleEditSection('summary')}
                      className="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </section>
            )}

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
                        placeholder="One bullet per line"
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
            {currentData.projects && currentData.projects.length > 0 && (
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
                      <div key={proj.id} className="space-y-2 p-2 border border-border rounded-md">
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
                          rows={3}
                          placeholder="Description"
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
            )}

            {/* Technical Skills */}
            <section>
              <h2 className="text-lg font-semibold mb-3">Technical Skills</h2>
              <div className="space-y-2 text-sm">
                {currentData.programmingLanguages && currentData.programmingLanguages.length > 0 && (
                  <p>
                    <span className="font-semibold">Languages:</span>{' '}
                    {currentData.programmingLanguages.join(', ')}
                  </p>
                )}
                {currentData.frameworks && currentData.frameworks.length > 0 && (
                  <p>
                    <span className="font-semibold">Frameworks:</span>{' '}
                    {currentData.frameworks.join(', ')}
                  </p>
                )}
                {currentData.libraries && currentData.libraries.length > 0 && (
                  <p>
                    <span className="font-semibold">Libraries:</span>{' '}
                    {currentData.libraries.join(', ')}
                  </p>
                )}
                {currentData.techStack && currentData.techStack.length > 0 && (
                  <p>
                    <span className="font-semibold">Tools:</span>{' '}
                    {currentData.techStack.join(', ')}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <button
              onClick={handleATSScan}
              disabled={isScanning}
              className="bg-secondary text-secondary-foreground py-3 rounded-md font-medium hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Scan size={20} />
              {isScanning ? 'Scanning...' : 'ATS Scan'}
            </button>
            <button
              onClick={handleDownloadLatex}
              className="border border-border bg-background py-3 rounded-md font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
            >
              <FileDown size={20} />
              LaTeX
            </button>
            <button
              onClick={handleDownloadPdf}
              className="bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
            >
              <Download size={20} />
              PDF
            </button>
          </div>
        </div>

        {/* Side Panel - ATS Results */}
        <div className="lg:col-span-1">
          {atsScore !== null && atsDetails && (
            <div className="bg-card border border-border rounded-lg p-4 sticky top-4">
              <h3 className="font-semibold mb-4">ATS Analysis</h3>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary mb-1">
                  {atsScore}/100
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
              </div>

              {atsDetails.matched_keywords && atsDetails.matched_keywords.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Matched Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {atsDetails.matched_keywords.slice(0, 10).map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {atsDetails.missing_keywords && atsDetails.missing_keywords.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {atsDetails.missing_keywords.slice(0, 10).map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {atsDetails.improvements && atsDetails.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Suggestions</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {atsDetails.improvements.slice(0, 5).map((suggestion: string, i: number) => (
                      <li key={i}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
  );
}