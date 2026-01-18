import requests
from django.conf import settings
import json


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
            str: The generated tailored resume content as JSON string
        """
        
        print("\n" + "="*80)
        print("RESUME GENERATION DEBUG INFO")
        print("="*80)
        print(f"Job Description Length: {len(job_description)} characters")
        print(f"Profile Name: {profile_data.get('name', 'N/A')}")
        print(f"Profile Email: {profile_data.get('email', 'N/A')}")
        print(f"Experience Count: {len(profile_data.get('experience', []))}")
        print(f"Projects Count: {len(profile_data.get('projects', []))}")
        print(f"Education Count: {len(profile_data.get('education', []))}")
        print(f"Programming Languages: {profile_data.get('programmingLanguages', [])}")
        print(f"Frameworks: {profile_data.get('frameworks', [])}")
        print(f"Libraries: {profile_data.get('libraries', [])}")
        print("="*80 + "\n")
        
        # Create the prompt for the AI
        prompt = self._create_prompt(profile_data, job_description)
        
        # Call OpenRouter API
        response = self._call_api(prompt)
        
        print(f"\n[SUCCESS] Generated resume length: {len(response)} characters\n")
        
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
        
        prompt = f"""You are an expert resume writer and ATS optimization specialist.

Your task is to create a TAILORED resume that highlights the most relevant qualifications from the candidate's profile for this specific job.

======================
CANDIDATE PROFILE (MASTER RESUME)
======================

Name: {name}
Email: {email}

TECHNICAL SKILLS:
{skills_text}

WORK EXPERIENCE:
{experience_text}

EDUCATION:
{education_text}

PROJECTS:
{projects_text}

======================
TARGET JOB DESCRIPTION
======================

{job_description}

======================
YOUR TASK
======================

Analyze the job description and create a tailored resume by:

1. **REORDER** experiences and projects to put the most relevant ones FIRST
2. **SELECT** the most relevant bullet points from each experience
3. **EMPHASIZE** skills and technologies mentioned in the job description
4. **CUSTOMIZE** the professional summary to match the role
5. **PRIORITIZE** technical skills that match job requirements

CRITICAL RULES:
- You MUST use ONLY information from the candidate profile above
- DO NOT invent experiences, skills, or accomplishments
- DO NOT add technologies the candidate doesn't have
- You MAY reword bullets to emphasize relevance
- You MAY reorder content for maximum impact
- Return ONLY valid JSON - no markdown, no backticks, no explanations

======================
REQUIRED JSON OUTPUT FORMAT
======================

Return EXACTLY this JSON structure (and nothing else):

{{
  "header": "{name} | {email}",
  "summary": "2-3 sentence professional summary emphasizing skills from job description",
  "education": [
    {{
      "id": "edu-1",
      "school": "School name from profile",
      "degree": "Degree from profile",
      "field": "Field from profile",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present"
    }}
  ],
  "experience": [
    {{
      "id": "exp-1",
      "company": "Company from profile",
      "position": "Position from profile",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": [
        "Most relevant bullet points from profile",
        "Reordered by relevance to job",
        "Use action verbs and metrics"
      ]
    }}
  ],
  "projects": [
    {{
      "id": "proj-1",
      "name": "Project from profile",
      "description": "1-2 sentences emphasizing relevance to job"
    }}
  ],
  "techStack": ["tools", "platforms"],
  "frameworks": ["frameworks from profile"],
  "libraries": ["libraries from profile"],
  "programmingLanguages": ["languages from profile, prioritized by job relevance"]
}}

EXAMPLE OF TAILORING:

If job mentions "Java, Spring Boot, microservices":
- Put Java FIRST in programmingLanguages
- Put Spring Boot experience FIRST
- Emphasize microservices projects
- Lead with relevant bullet points

NOW GENERATE THE TAILORED RESUME JSON:
"""
        
        return prompt
    
    def _format_skills(self, profile_data: dict) -> str:
        """Format skills section from profile data."""
        skills = []
        
        prog_langs = profile_data.get('programmingLanguages', [])
        frameworks = profile_data.get('frameworks', [])
        libraries = profile_data.get('libraries', [])
        tech_stack = profile_data.get('techStack', [])
        
        if prog_langs:
            skills.append(f"Programming Languages: {', '.join(prog_langs)}")
        if frameworks:
            skills.append(f"Frameworks: {', '.join(frameworks)}")
        if libraries:
            skills.append(f"Libraries: {', '.join(libraries)}")
        if tech_stack and tech_stack != prog_langs:  # Avoid duplication
            skills.append(f"Tools & Technologies: {', '.join(tech_stack)}")
        
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
            "max_tokens": 3000,  # Increased for longer resumes
            "temperature": 0.3,  # Lower for more consistent formatting
        }
        
        try:
            print("[API] Calling OpenRouter API...")
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            
            data = response.json()
            print(f"[API] Response Status: {response.status_code}")
            
            if "choices" in data and len(data["choices"]) > 0:
                generated_resume = data["choices"][0]["message"]["content"]
                
                # Clean up the response - remove markdown code fences if present
                generated_resume = generated_resume.strip()
                
                print(f"[API] Raw response preview: {generated_resume[:200]}...")
                
                # Remove markdown code blocks
                if generated_resume.startswith("```json"):
                    print("[API] Removing ```json prefix")
                    generated_resume = generated_resume[7:]
                if generated_resume.startswith("```"):
                    print("[API] Removing ``` prefix")
                    generated_resume = generated_resume[3:]
                if generated_resume.endswith("```"):
                    print("[API] Removing ``` suffix")
                    generated_resume = generated_resume[:-3]
                
                generated_resume = generated_resume.strip()
                
                # Validate it's valid JSON
                try:
                    json.loads(generated_resume)
                    print("[API] ✓ Successfully validated JSON resume")
                except json.JSONDecodeError as e:
                    print(f"[ERROR] Generated resume is not valid JSON: {e}")
                    print(f"[ERROR] Cleaned response: {generated_resume[:500]}...")
                    raise ValueError(f"AI did not return valid JSON: {e}")
                
                return generated_resume
            else:
                print("[ERROR] No choices in API response")
                raise ValueError("No response generated from API")
                
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] API request failed: {str(e)}")
            raise Exception(f"API request failed: {str(e)}")
        except (KeyError, IndexError) as e:
            print(f"[ERROR] Unexpected API response format: {str(e)}")
            raise Exception(f"Unexpected API response format: {str(e)}")