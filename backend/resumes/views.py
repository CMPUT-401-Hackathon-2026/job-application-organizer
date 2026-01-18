from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from resumes.resume_generator import ResumeGeneratorService
from profiles.models import Profile, User
from applications.models import Application
from JobApplication.models import JobApplication
from resumes.models import Resume
from resumes.latex import render_resume_to_latex
import json
import os


def get_default_user():
    """Get the first user in the database (for single-user setup)"""
    user = User.objects.first()
    if not user:
        raise Exception("No users found in database. Please create a user first.")
    return user

def parse_app_id(app_id):
    """
    Parse ID - handles both string IDs (app-123) and numeric IDs (123)
    Returns the numeric ID
    
    IMPORTANT: This is actually a JOB ID, not an application ID!
    The frontend passes job IDs to build resumes for jobs.
    """
    if isinstance(app_id, str):
        # Remove 'app-' prefix if present
        if app_id.startswith('app-'):
            app_id = app_id[4:]
        try:
            return int(app_id)
        except ValueError:
            raise ValueError(f"Invalid ID format: {app_id}")
    return int(app_id)


@csrf_exempt
def build_application_resume(request, app_id):
    """Build a tailored resume for a job"""
    print("\n" + "="*80)
    print("BUILD RESUME REQUEST RECEIVED")
    print("="*80)
    print(f"Raw app_id: {app_id}")
    
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        # Parse the ID - this is actually a JOB ID
        job_id = parse_app_id(app_id)
        print(f"Parsed job_id: {job_id}")
        
        # Get the JOB
        job = JobApplication.objects.get(id=job_id)
        print(f"Found job: {job.title} at {job.company}")
        
        # Get the default user's profile (no authentication required)
        user = get_default_user()
        print(f"Using default user: {user.username}")
        
        try:
            profile = Profile.objects.get(user=user)
            print(f"Found profile for user: {profile.user.username}")
        except Profile.DoesNotExist:
            return JsonResponse({
                "error": "Profile not found",
                "details": "Please complete your profile setup before building resumes"
            }, status=404)
        
        # Serialize the profile to get all data
        from profiles.serializers import ProfileSerializer
        profile_serializer = ProfileSerializer(profile)
        profile_data = profile_serializer.data
        
        print("\n--- PROFILE DATA ---")
        print(f"Name: {profile_data.get('name')}")
        print(f"Email: {profile_data.get('email')}")
        print(f"Experience count: {len(profile_data.get('experience', []))}")
        print(f"Projects count: {len(profile_data.get('projects', []))}")
        print(f"Education count: {len(profile_data.get('education', []))}")
        print(f"Programming Languages: {profile_data.get('programmingLanguages', [])}")
        print(f"Frameworks: {profile_data.get('frameworks', [])}")
        print(f"Libraries: {profile_data.get('libraries', [])}")
        print("--- END PROFILE DATA ---\n")
        
        # Get job description
        job_description = job.description or ""
        print(f"Job description length: {len(job_description)} characters")
        print(f"Job description preview: {job_description[:200]}...")
        
        if not job_description:
            return JsonResponse({
                "error": "Job has no description"
            }, status=400)

        # Generate resume using AI
        print("\n--- CALLING AI SERVICE ---")
        generator = ResumeGeneratorService()
        generated = generator.generate_resume(
            profile_data=profile_data,
            job_description=job_description
        )
        print("--- AI SERVICE RETURNED ---\n")

        print(f"Generated response length: {len(generated)} characters")
        print(f"Generated response preview: {generated[:300]}...")

        # Parse the JSON response
        try:
            resume_json = json.loads(generated)
            print("\n--- PARSED RESUME JSON ---")
            print(f"Header: {resume_json.get('header', 'N/A')}")
            print(f"Summary: {resume_json.get('summary', 'N/A')[:100]}...")
            print(f"Education entries: {len(resume_json.get('education', []))}")
            print(f"Experience entries: {len(resume_json.get('experience', []))}")
            print(f"Projects entries: {len(resume_json.get('projects', []))}")
            print("--- END PARSED RESUME ---\n")
        except json.JSONDecodeError as e:
            print(f"\n[ERROR] Failed to parse JSON: {e}")
            print(f"Raw generated text:\n{generated}")
            return JsonResponse({
                "error": "Model did not return valid JSON",
                "raw": generated,
                "parse_error": str(e)
            }, status=500)

        # Get or create Resume linked to this JOB
        resume, created = Resume.objects.get_or_create(
            job_application=job,
            defaults={'data': resume_json}
        )
        
        if not created:
            print(f"Updating existing resume (id={resume.id})")
            resume.data = resume_json
            resume.save()
        else:
            print(f"Created new resume (id={resume.id})")

        response_data = {
            "id": str(resume.id),
            "applicationId": str(job.id),
            **resume.data
        }
        
        print(f"\n--- RETURNING RESPONSE ---")
        print(f"Response keys: {list(response_data.keys())}")
        print(f"Response size: {len(json.dumps(response_data))} characters")
        print("="*80 + "\n")
        
        return JsonResponse(response_data)
        
    except ValueError as e:
        print(f"\n[ERROR] ValueError: {e}\n")
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        print(f"\n[ERROR] Job {app_id} not found\n")
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        print()
        return JsonResponse({
            "error": "Failed to build resume",
            "details": str(e)
        }, status=500)


@csrf_exempt
def application_resume(request, app_id):
    """Get or update resume for a job"""
    print(f"\n[GET/PATCH RESUME] Request for app_id: {app_id}")
    
    try:
        # Parse the ID - this is a JOB ID
        job_id = parse_app_id(app_id)
        print(f"[GET/PATCH RESUME] Parsed job_id: {job_id}")
        
        # Get the JOB
        job = JobApplication.objects.get(id=job_id)
        print(f"[GET/PATCH RESUME] Found job: {job.title}")
        
        # Get or create resume for this JOB
        resume, created = Resume.objects.get_or_create(
            job_application=job,
            defaults={'data': {}}
        )
        
        if created:
            print(f"[GET/PATCH RESUME] Created new empty resume")
        else:
            print(f"[GET/PATCH RESUME] Found existing resume with {len(resume.data)} data keys")

        if request.method == "GET":
            print(f"[GET/PATCH RESUME] Returning resume data")
            response = {
                "id": str(resume.id),
                "applicationId": str(job.id),
                **(resume.data or {})
            }
            print(f"[GET/PATCH RESUME] Response keys: {list(response.keys())}")
            return JsonResponse(response)

        if request.method == "PATCH":
            body = json.loads(request.body or "{}")
            print(f"[GET/PATCH RESUME] Updating resume with {len(body)} fields")
            resume.data = body
            resume.save()
            print(f"[GET/PATCH RESUME] Resume updated successfully")
            return JsonResponse({
                "id": str(resume.id),
                "applicationId": str(job.id),
                **resume.data
            })

        return JsonResponse({"error": "Unsupported method"}, status=405)
    
    except ValueError as e:
        print(f"[GET/PATCH RESUME ERROR] ValueError: {e}")
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        print(f"[GET/PATCH RESUME ERROR] Job {app_id} not found")
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Exception as e:
        print(f"[GET/PATCH RESUME ERROR] Unexpected: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "error": "Unexpected error",
            "details": str(e)
        }, status=500)


@csrf_exempt
def resume_ats_scan(request, app_id):
    """Perform ATS scan using OpenRouter API"""
    # Handle CORS preflight
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response
    
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
    print(f"\n[ATS SCAN] Starting scan for app_id: {app_id}")
    
    try:
        # Parse the ID - this is a JOB ID
        job_id = parse_app_id(app_id)
        print(f"[ATS SCAN] Parsed job_id: {job_id}")
        
        # Get the JOB and its resume
        job = JobApplication.objects.get(id=job_id)
        print(f"[ATS SCAN] Found job: {job.title}")
        
        resume = Resume.objects.get(job_application=job)
        print(f"[ATS SCAN] Found resume with {len(resume.data)} keys")
        
        if not resume.data:
            return JsonResponse({
                "error": "Resume not built yet"
            }, status=400)
        
        # Get job description
        job_description = job.description or ""
        resume_text = json.dumps(resume.data, indent=2)
        
        print(f"[ATS SCAN] Job description length: {len(job_description)}")
        print(f"[ATS SCAN] Resume text length: {len(resume_text)}")

        prompt = f"""You are an Applicant Tracking System (ATS) analyzer.

Analyze how well this resume matches the job description.

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{{
  "score": number between 0-100,
  "missing_keywords": ["keyword1", "keyword2"],
  "matched_keywords": ["keyword1", "keyword2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

        print("[ATS SCAN] Calling OpenRouter API...")
        
        # Use OpenRouter API (same as resume generation)
        from django.conf import settings
        import requests
        
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Job Application Organizer - ATS Scan"
        }
        
        payload = {
            "model": settings.MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.3,
        }
        
        response = requests.post(
            f"{settings.API_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        data = response.json()
        print(f"[ATS SCAN] OpenRouter response status: {response.status_code}")
        
        if "choices" in data and len(data["choices"]) > 0:
            ats_response = data["choices"][0]["message"]["content"].strip()
            
            # Clean up response - remove markdown code blocks if present
            if ats_response.startswith("```json"):
                ats_response = ats_response[7:]
            if ats_response.startswith("```"):
                ats_response = ats_response[3:]
            if ats_response.endswith("```"):
                ats_response = ats_response[:-3]
            
            ats_response = ats_response.strip()
            
            print(f"[ATS SCAN] Response preview: {ats_response[:200]}...")
            
            # Parse JSON
            ats_result = json.loads(ats_response)
            print(f"[ATS SCAN] ATS Score: {ats_result.get('score')}")
            
            return JsonResponse(ats_result)
        else:
            raise ValueError("No response from API")
    
    except ValueError as e:
        print(f"[ATS SCAN ERROR] ValueError: {e}")
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        print(f"[ATS SCAN ERROR] Job {app_id} not found")
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Resume.DoesNotExist:
        print(f"[ATS SCAN ERROR] Resume not found")
        return JsonResponse({
            "error": "Resume not found. Please build resume first."
        }, status=404)
    except requests.exceptions.RequestException as e:
        print(f"[ATS SCAN ERROR] API request failed: {e}")
        return JsonResponse({
            "error": "ATS scan API request failed",
            "details": str(e)
        }, status=500)
    except Exception as e:
        print(f"[ATS SCAN ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "error": "ATS scan failed",
            "details": str(e)
        }, status=500)


@csrf_exempt
def resume_download_latex(request, app_id):
    """Download resume as LaTeX file"""
    try:
        # Parse the ID - this is a JOB ID
        job_id = parse_app_id(app_id)
        
        # Get the JOB and its resume
        job = JobApplication.objects.get(id=job_id)
        resume = Resume.objects.get(job_application=job)
        
        if not resume.data:
            return JsonResponse({
                "error": "Resume not built yet"
            }, status=400)
        
        # Generate LaTeX from resume data
        latex_content = render_resume_to_latex(resume.data)
        
        response = HttpResponse(latex_content, content_type="application/x-latex")
        response["Content-Disposition"] = f'attachment; filename="resume_{app_id}.tex"'
        return response
    
    except ValueError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Resume.DoesNotExist:
        return JsonResponse({
            "error": "Resume not found"
        }, status=404)
    except Exception as e:
        return JsonResponse({
            "error": "Failed to generate LaTeX",
            "details": str(e)
        }, status=500)


@csrf_exempt
def resume_download_pdf(request, app_id):
    """Compile LaTeX to PDF and download"""
    import subprocess
    import tempfile
    from pathlib import Path
    
    try:
        # Parse the ID - this is a JOB ID
        job_id = parse_app_id(app_id)
        
        # Get the JOB and its resume
        job = JobApplication.objects.get(id=job_id)
        resume = Resume.objects.get(job_application=job)
        
        if not resume.data:
            return JsonResponse({
                "error": "Resume not built yet"
            }, status=400)
        
        # Generate LaTeX
        latex_content = render_resume_to_latex(resume.data)
        
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as tmpdir:
            tex_file = Path(tmpdir) / "resume.tex"
            pdf_file = Path(tmpdir) / "resume.pdf"
            
            # Write LaTeX file
            tex_file.write_text(latex_content)
            
            # Compile with pdflatex (run twice for references)
            for _ in range(2):
                result = subprocess.run(
                    ["pdflatex", "-interaction=nonstopmode", "resume.tex"],
                    cwd=tmpdir,
                    capture_output=True,
                    timeout=30
                )
                
                if result.returncode != 0:
                    return JsonResponse({
                        "error": "LaTeX compilation failed",
                        "details": result.stderr.decode()
                    }, status=500)
            
            # Read PDF and return
            if pdf_file.exists():
                with open(pdf_file, 'rb') as f:
                    pdf_content = f.read()
                
                response = HttpResponse(pdf_content, content_type="application/pdf")
                response["Content-Disposition"] = f'attachment; filename="resume_{app_id}.pdf"'
                return response
            else:
                return JsonResponse({
                    "error": "PDF file not generated"
                }, status=500)
    
    except ValueError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Resume.DoesNotExist:
        return JsonResponse({
            "error": "Resume not found"
        }, status=404)
    except subprocess.TimeoutExpired:
        return JsonResponse({
            "error": "LaTeX compilation timed out"
        }, status=500)
    except Exception as e:
        return JsonResponse({
            "error": "Failed to generate PDF",
            "details": str(e)
        }, status=500)