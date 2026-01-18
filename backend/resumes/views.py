from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from resumes.resume_generator import ResumeGeneratorService
from profiles.models import Profile
from applications.models import Application  # For tracking if user applied
from JobApplication.models import JobApplication
from resumes.models import Resume
from resumes.latex import render_resume_to_latex
import json
import os
from google import genai
from google.genai import types

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

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
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        # Parse the ID - this is actually a JOB ID
        job_id = parse_app_id(app_id)
        
        # Get the JOB
        job = JobApplication.objects.get(id=job_id)
        
        # Get the user's profile
        profile = Profile.objects.get(user=request.user)
        
        # Get job description
        job_description = job.description or ""
        if not job_description:
            return JsonResponse({
                "error": "Job has no description"
            }, status=400)

        # Generate resume using AI
        generator = ResumeGeneratorService()
        generated = generator.generate_resume(
            profile_data=profile.to_dict(),
            job_description=job_description
        )

        # Parse the JSON response
        try:
            resume_json = json.loads(generated)
        except json.JSONDecodeError as e:
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
            # Update existing resume
            resume.data = resume_json
            resume.save()

        return JsonResponse({
            "id": str(resume.id),
            "applicationId": str(job.id),  # Return job ID as applicationId
            **resume.data
        })
        
    except ValueError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Profile.DoesNotExist:
        return JsonResponse({
            "error": "User profile not found"
        }, status=404)
    except Exception as e:
        return JsonResponse({
            "error": "Failed to build resume",
            "details": str(e)
        }, status=500)


@csrf_exempt
def application_resume(request, app_id):
    """Get or update resume for a job"""
    try:
        # Parse the ID - this is a JOB ID
        job_id = parse_app_id(app_id)
        
        # Get the JOB
        job = JobApplication.objects.get(id=job_id)
        
        # Get or create resume for this JOB
        resume, _ = Resume.objects.get_or_create(
            job_application=job,
            defaults={'data': {}}
        )

        if request.method == "GET":
            return JsonResponse({
                "id": str(resume.id),
                "applicationId": str(job.id),
                **(resume.data or {})
            })

        if request.method == "PATCH":
            body = json.loads(request.body or "{}")
            resume.data = body
            resume.save()
            return JsonResponse({
                "id": str(resume.id),
                "applicationId": str(job.id),
                **resume.data
            })

        return JsonResponse({"error": "Unsupported method"}, status=405)
    
    except ValueError as e:
        return JsonResponse({
            "error": str(e)
        }, status=400)
    except JobApplication.DoesNotExist:
        return JsonResponse({
            "error": f"Job {app_id} not found"
        }, status=404)
    except Exception as e:
        return JsonResponse({
            "error": "Unexpected error",
            "details": str(e)
        }, status=500)


@csrf_exempt
def resume_ats_scan(request, app_id):
    """Perform ATS scan using Gemini"""
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    
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
        
        # Get job description
        job_description = job.description or ""
        resume_text = json.dumps(resume.data, indent=2)

        prompt = f"""
You are an Applicant Tracking System (ATS) analyzer.

Analyze how well this resume matches the job description.

Return STRICT JSON with this exact structure:
{{
  "score": number between 0-100,
  "missing_keywords": [list of important keywords from job that are missing],
  "matched_keywords": [list of keywords that match well],
  "strengths": [list of strong points in the resume],
  "improvements": [list of specific suggestions to improve ATS score]
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        ats_result = json.loads(response.text)
        
        return JsonResponse(ats_result)
    
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
            "error": "Resume not found. Please build resume first."
        }, status=404)
    except Exception as e:
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