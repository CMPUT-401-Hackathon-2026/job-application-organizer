import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { profile, auth } from '../api';
import { useToastStore } from '../components/ui/Toast';
import { useAuthStore } from '../store/authStore';
import type { Profile, Education, Experience, Project, Link } from '../types';

export function ProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showTechInput, setShowTechInput] = useState(false);
  const [techInputValue, setTechInputValue] = useState('');
  const [showFrameworkInput, setShowFrameworkInput] = useState(false);
  const [frameworkInputValue, setFrameworkInputValue] = useState('');
  const [showLibraryInput, setShowLibraryInput] = useState(false);
  const [libraryInputValue, setLibraryInputValue] = useState('');
  const [showLanguageInput, setShowLanguageInput] = useState(false);
  const [languageInputValue, setLanguageInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const [formData, setFormData] = useState<Profile>({
    id: '',
    name: '',
    email: '',
    education: [],
    experience: [],
    projects: [],
    techStack: [],
    frameworks: [],
    libraries: [],
    programmingLanguages: [],
    links: [],
  });
  useEffect(() => {
    // Only load profile if authenticated, otherwise start with empty form for new account
    if (isAuthenticated) {
      loadProfile();
    } else {
      // For new users, set hasLoadedProfile to true so password fields show
      setHasLoadedProfile(true);
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const data = await profile.get();
      // Ensure all fields are present with defaults
      setFormData({
        ...data,
        frameworks: data.frameworks || [],
        libraries: data.libraries || [],
        programmingLanguages: data.programmingLanguages || [],
        techStack: data.techStack || [],
        education: data.education || [],
        experience: data.experience || [],
        projects: data.projects || [],
        links: data.links || [],
      });
      setHasLoadedProfile(true);
    } catch {
      addToast('Failed to load profile', 'error');
      setHasLoadedProfile(true);
    }
  };

  const validateProfile = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!isAuthenticated) {
      // For new accounts, password is required
      if (!password.trim()) {
        return 'Password is required';
      }
      if (password.length < 6) {
        return 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
    }
    if (formData.education.length === 0) {
      return 'At least one education entry is required';
    }
    for (const edu of formData.education) {
      if (!edu.school.trim() || !edu.degree.trim() || !edu.field.trim()) {
        return 'All education fields (school, degree, field) are required';
      }
    }
    //if (formData.techStack.length === 0) {
    //  return 'At least one technology in tech stack is required';
    //}
    return null;
  };

  const handleSave = async () => {
    const validationError = validateProfile();
    if (validationError) {
      addToast(validationError, 'error');
      return;
    }

    setLoading(true);
    const wasAuthenticated = isAuthenticated;
    try {
      // If not authenticated, create an account first using the email and password from profile
      if (!isAuthenticated) {
        try {
          const { user, token } = await auth.signup(formData.email, formData.name, password);
          setAuth(user, token);
        } catch {
          addToast('Failed to create account. Please try again.', 'error');
          setLoading(false);
          return;
        }
      }
      
      // Save the profile
      await profile.save(formData);
      
      addToast(wasAuthenticated ? 'Profile saved successfully' : 'Account and profile created successfully', 'success');
      
      // Use setTimeout to ensure localStorage is written and state updates complete before navigation
      setTimeout(() => {
        navigate('/fyp', { replace: true });
      }, 200);
    } catch {
      addToast('Failed to save profile', 'error');
      setLoading(false);
    }
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          id: Date.now().toString(),
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    });
  };

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      education: formData.education.filter((e) => e.id !== id),
    });
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setFormData({
      ...formData,
      education: formData.education.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: [],
        },
      ],
    });
  };

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((e) => e.id !== id),
    });
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setFormData({
      ...formData,
      experience: formData.experience.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          technologies: [],
          url: '',
        },
      ],
    });
  };

  const removeProject = (id: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((p) => p.id !== id),
    });
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setFormData({
      ...formData,
      projects: formData.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const addTechStackItem = () => {
    setShowTechInput(true);
  };

  const handleTechInputSubmit = () => {
    if (techInputValue.trim()) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInputValue.trim()],
      });
      setTechInputValue('');
      setShowTechInput(false);
    }
  };

  const handleTechInputCancel = () => {
    setTechInputValue('');
    setShowTechInput(false);
  };

  const removeTechStackItem = (index: number) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((_, i) => i !== index),
    });
  };

  const addFrameworkItem = () => {
    setShowFrameworkInput(true);
  };

  const handleFrameworkSubmit = () => {
    if (frameworkInputValue.trim()) {
      setFormData({
        ...formData,
        frameworks: [...formData.frameworks, frameworkInputValue.trim()],
      });
      setFrameworkInputValue('');
      setShowFrameworkInput(false);
    }
  };

  const handleFrameworkCancel = () => {
    setFrameworkInputValue('');
    setShowFrameworkInput(false);
  };

  const removeFrameworkItem = (index: number) => {
    setFormData({
      ...formData,
      frameworks: formData.frameworks.filter((_, i) => i !== index),
    });
  };

  const addLibraryItem = () => {
    setShowLibraryInput(true);
  };

  const handleLibrarySubmit = () => {
    if (libraryInputValue.trim()) {
      setFormData({
        ...formData,
        libraries: [...formData.libraries, libraryInputValue.trim()],
      });
      setLibraryInputValue('');
      setShowLibraryInput(false);
    }
  };

  const handleLibraryCancel = () => {
    setLibraryInputValue('');
    setShowLibraryInput(false);
  };

  const removeLibraryItem = (index: number) => {
    setFormData({
      ...formData,
      libraries: formData.libraries.filter((_, i) => i !== index),
    });
  };

    const addLanguageItem = () => {
    setShowLanguageInput(true);
  };

  const handleLanguageSubmit = () => {
    if (languageInputValue.trim()) {
      setFormData({
        ...formData,
        programmingLanguages: [...formData.programmingLanguages, languageInputValue.trim()],
      });
      setLanguageInputValue('');
      setShowLanguageInput(false);
    }
  };

  const handleLanguageCancel = () => {
    setLanguageInputValue('');
    setShowLanguageInput(false);
  };

  const removeLanguageItem = (index: number) => {
    setFormData({
      ...formData,
      programmingLanguages: formData.programmingLanguages.filter((_, i) => i !== index),
    });
  };

  
  const addLink = () => {
    setFormData({
      ...formData,
      links: [
        ...formData.links,
        {
          id: Date.now().toString(),
          label: '',
          url: '',
        },
      ],
    });
  };

  const removeLink = (id: string) => {
    setFormData({
      ...formData,
      links: formData.links.filter((l) => l.id !== id),
    });
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    setFormData({
      ...formData,
      links: formData.links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Profile Setup</h1>
        <p className="text-muted-foreground">Complete your profile to get started</p>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {!isAuthenticated && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Re-enter password"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Education <span className="text-red-500 text-base">*</span></h2>
            <button
              onClick={addEducation}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {(formData.education || []).map((edu) => (
              <div key={edu.id} className="p-4 border border-border rounded-md space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="p-1 hover:bg-muted rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="School"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Field"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Start Date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                      className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="End Date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                      className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Description"
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <button
              onClick={addExperience}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {(formData.experience || []).map((exp) => (
              <div key={exp.id} className="p-4 border border-border rounded-md space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="p-1 hover:bg-muted rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <textarea
                  placeholder="Description (one bullet per line)"
                  value={exp.description.join('\n')}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      description: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <button
              onClick={addProject}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {(formData.projects || []).map((proj) => (
              <div key={proj.id} className="p-4 border border-border rounded-md space-y-3">
                <div className="flex justify-end">
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="p-1 hover:bg-muted rounded-md"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Description"
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Technologies (comma separated)"
                  value={proj.technologies.join(', ')}
                  onChange={(e) =>
                    updateProject(proj.id, {
                      technologies: e.target.value.split(',').map((t) => t.trim()),
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={proj.url}
                  onChange={(e) => updateProject(proj.id, { url: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tech Stack <span className="text-red-500 text-base">*</span></h2>
            {!showTechInput && (
              <button
                onClick={addTechStackItem}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                type="button"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          {showTechInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={techInputValue}
                onChange={(e) => setTechInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTechInputSubmit();
                  } else if (e.key === 'Escape') {
                    handleTechInputCancel();
                  }
                }}
                placeholder="Enter technology name"
                autoFocus
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleTechInputSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                type="button"
              >
                Add
              </button>
              <button
                onClick={handleTechInputCancel}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(formData.techStack || []).map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-md flex items-center gap-2"
              >
                {tech}
                <button
                  onClick={() => removeTechStackItem(index)}
                  className="hover:text-red-500"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Framework <span className="text-red-500 text-base">*</span></h2>
            {!showFrameworkInput && (
              <button
                onClick={addFrameworkItem}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                type="button"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          {showFrameworkInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={frameworkInputValue}
                onChange={(e) => setFrameworkInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFrameworkSubmit();
                  } else if (e.key === 'Escape') {
                    handleFrameworkCancel();
                  }
                }}
                placeholder="Enter framework name"
                autoFocus
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleFrameworkSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                type="button"
              >
                Add
              </button>
              <button
                onClick={handleFrameworkCancel}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(formData.frameworks || []).map((framework, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-md flex items-center gap-2"
              >
                {framework}
                <button
                  onClick={() => removeFrameworkItem(index)}
                  className="hover:text-red-500"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>


        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Library <span className="text-red-500 text-base">*</span></h2>
            {!showLibraryInput && (
              <button
                onClick={addLibraryItem}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                type="button"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          {showLibraryInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={libraryInputValue}
                onChange={(e) => setLibraryInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFrameworkSubmit();
                  } else if (e.key === 'Escape') {
                    handleFrameworkCancel();
                  }
                }}
                placeholder="Enter library name"
                autoFocus
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleLibrarySubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                type="button"
              >
                Add
              </button>
              <button
                onClick={handleLibraryCancel}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(formData.libraries || []).map((library, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-md flex items-center gap-2"
              >
                {library}
                <button
                  onClick={() => removeLibraryItem(index)}
                  className="hover:text-red-500"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Languages <span className="text-red-500 text-base">*</span></h2>
            {!showLanguageInput && (
              <button
                onClick={addLanguageItem}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                type="button"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
          {showLanguageInput && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={languageInputValue}
                onChange={(e) => setLanguageInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFrameworkSubmit();
                  } else if (e.key === 'Escape') {
                    handleFrameworkCancel();
                  }
                }}
                placeholder="Enter language name"
                autoFocus
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleLanguageSubmit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                type="button"
              >
                Add
              </button>
              <button
                onClick={handleLanguageCancel}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(formData.programmingLanguages || []).map((language, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-md flex items-center gap-2"
              >
                {language}
                <button
                  onClick={() => removeLanguageItem(index)}
                  className="hover:text-red-500"
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Links</h2>
            <button
              onClick={addLink}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-3">
            {formData.links.map((link) => (
              <div key={link.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="url"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => removeLink(link.id)}
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
