from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Resume
import json
from google import genai
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Resume

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def get_resume(request, resume_id):
    resume = Resume.objects.get(id=resume_id)
    return JsonResponse({
        "id": resume.id,
        "title": resume.title,
        "data": resume.data
    })


@csrf_exempt
def update_section(request, resume_id, section):
    resume = Resume.objects.get(id=resume_id)
    body = json.loads(request.body)

    resume.data[section] = body["data"]
    resume.save()

    return JsonResponse({"success": True})


def download_latex(request, resume_id):
    resume = Resume.objects.get(id=resume_id)

    tex = f"""
\\section*{{Education}}
{resume.data["education"][0]["institution"]}
"""

    return HttpResponse(tex, content_type="application/x-tex")


from google import genai
from google.genai import types
import os, json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Resume

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@csrf_exempt
def ats_score(request, resume_id):
    try:
        body = json.loads(request.body)
        job_desc = body.get("job_description", "")

        resume = Resume.objects.get(id=resume_id).data

        prompt = f"""
You are an Applicant Tracking System (ATS).

Analyze how well this resume matches the job description.

Return a JSON object with:

score: integer 0-100
missing_keywords: list of strings
matched_keywords: list of strings
feedback: short string

RESUME:
{json.dumps(resume, indent=2)}

JOB DESCRIPTION:
{job_desc}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        ats = json.loads(response.text)

        return JsonResponse(ats)

    except Exception as e:
        return JsonResponse({
            "error": "ATS failed",
            "details": str(e)
        }, status=500)
