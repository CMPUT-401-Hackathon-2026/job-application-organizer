import requests
from django.conf import settings


class ResumeGeneratorService:
    """Service to generate tailored resumes using DeepSeek R1 via OpenRouter API."""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.API_BASE_URL
        self.model = settings.MODEL_NAME
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in environment variables")
    
    def generate_resume(self, profile_data: dict, job_description: str) -> str:
        """
        Generate a tailored resume based on profile data and job description.
        
        Args:
            profile_data (dict): Complete profile data from ProfileSerializer (master resume)
            job_description (str): The job description to tailor the resume for
            
        Returns:
            str: The generated tailored resume content
        """
        
        # Create the prompt for the AI
        prompt = self._create_prompt(profile_data, job_description)
        
        # Call OpenRouter API
        response = self._call_api(prompt)
        
        return response
    
    def _create_prompt(self, profile_data: dict, job_description: str) -> str:
        """Create the prompt for the AI model."""
        
        # Extract data from profile
        name = profile_data.get('name', 'Candidate')
        email = profile_data.get('email', '')
        
        # Build experience section
        experience_text = self._format_experience(profile_data.get('experience', []))
        
        # Build education section
        education_text = self._format_education(profile_data.get('education', []))
        
        # Build projects section
        projects_text = self._format_projects(profile_data.get('projects', []))
        
        # Build skills section
        skills_text = self._format_skills(profile_data)
        
        prompt = f"""You are an expert resume writer and career coach. Your task is to create a tailored, ATS-friendly resume based on the following information:

CANDIDATE PROFILE (Master Resume):
Name: {name}
Email: {email}

SKILLS:
{skills_text}

WORK EXPERIENCE:
{experience_text}

PROJECTS:
{projects_text}

EDUCATION:
{education_text}

JOB DESCRIPTION:
{job_description}

INSTRUCTIONS:
1. Analyze the job description carefully and identify key requirements, skills, and qualifications
2. Create a tailored resume that highlights the most relevant experience and skills
3. Use keywords from the job description naturally throughout the resume
4. Reorder and emphasize sections to match what the job requires most
5. Keep bullet points concise and achievement-focused (use metrics where applicable)
6. Ensure the resume is ATS-friendly with clear section headers
7. Format the resume professionally with proper spacing and structure
8. Only include information that exists in the candidate's profile - do not fabricate details
9. If certain required skills are missing, emphasize transferable skills instead

OUTPUT FORMAT:
Return ONLY the tailored resume in plain text format with clear section headers. Use this structure:
- Header (Name, Email)
- Summary (brief 2-3 sentence summary highlighting fit for this specific role)
- Skills (prioritized based on job requirements)
- Experience (reordered/emphasized based on relevance)
- Projects (only include most relevant ones)
- Education

Generate the tailored resume now:"""
        
        return prompt
    
    def _format_skills(self, profile_data: dict) -> str:
        """Format skills section from profile data."""
        skills = []
        
        prog_langs = profile_data.get('programmingLanguages', [])
        frameworks = profile_data.get('frameworks', [])
        libraries = profile_data.get('libraries', [])
        
        if prog_langs:
            skills.append(f"Programming Languages: {', '.join(prog_langs)}")
        if frameworks:
            skills.append(f"Frameworks: {', '.join(frameworks)}")
        if libraries:
            skills.append(f"Libraries: {', '.join(libraries)}")
        
        return '\n'.join(skills) if skills else "No specific skills listed"
    
    def _format_experience(self, experiences: list) -> str:
        """Format work experience from profile data."""
        if not experiences:
            return "No work experience listed"
        
        formatted = []
        for exp in experiences:
            company = exp.get('company', 'Unknown Company')
            position = exp.get('position', 'Position')
            start = exp.get('startDate', '')
            end = exp.get('endDate', 'Present')
            description = exp.get('description', [])
            
            exp_text = f"{position} at {company} ({start} - {end})"
            if description:
                if isinstance(description, list):
                    exp_text += "\n" + "\n".join(f"  • {item}" for item in description)
                else:
                    exp_text += f"\n  • {description}"
            
            formatted.append(exp_text)
        
        return '\n\n'.join(formatted)
    
    def _format_projects(self, projects: list) -> str:
        """Format projects from profile data."""
        if not projects:
            return "No projects listed"
        
        formatted = []
        for proj in projects:
            name = proj.get('name', 'Project')
            description = proj.get('description', '')
            technologies = proj.get('technologies', [])
            url = proj.get('url', '')
            
            proj_text = f"{name}"
            if url:
                proj_text += f" ({url})"
            if technologies:
                proj_text += f"\n  Technologies: {', '.join(technologies)}"
            if description:
                proj_text += f"\n  {description}"
            
            formatted.append(proj_text)
        
        return '\n\n'.join(formatted)
    
    def _format_education(self, education: list) -> str:
        """Format education from profile data."""
        if not education:
            return "No education listed"
        
        formatted = []
        for edu in education:
            school = edu.get('school', 'School')
            degree = edu.get('degree', '')
            field = edu.get('field', '')
            start = edu.get('startDate', '')
            end = edu.get('endDate', 'Present')
            
            edu_text = f"{school}"
            if degree:
                edu_text += f"\n  {degree}"
            if field:
                edu_text += f" in {field}"
            if start or end:
                edu_text += f" ({start} - {end})"
            
            formatted.append(edu_text)
        
        return '\n\n'.join(formatted)
    
    def _call_api(self, prompt: str) -> str:
        """Call the OpenRouter API to generate the resume."""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Job Application Organizer"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2500,
            "temperature": 0.7,
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            
            if "choices" in data and len(data["choices"]) > 0:
                generated_resume = data["choices"][0]["message"]["content"]
                return generated_resume.strip()
            else:
                raise ValueError("No response generated from API")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except (KeyError, IndexError) as e:
            raise Exception(f"Unexpected API response format: {str(e)}")