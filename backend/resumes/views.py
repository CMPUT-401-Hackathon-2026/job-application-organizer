# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from .models import Resume
# import json
# from google import genai
# import os
# from applications.models import Application
# from resumes.latex import render_resume_to_latex

# client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


# def get_resume(request, resume_id):
#     resume = Resume.objects.get(id=resume_id)
#     return JsonResponse({
#         "id": resume.id,
#         "title": resume.title,
#         "data": resume.data
#     })


# @csrf_exempt
# def update_section(request, resume_id, section):
#     resume = Resume.objects.get(id=resume_id)
#     body = json.loads(request.body)

#     resume.data[section] = body["data"]
#     resume.save()

#     return JsonResponse({"success": True})


# def download_latex(request, resume_id):
#     resume = Resume.objects.get(id=resume_id)

#     tex = f"""
# \\section*{{Education}}
# {resume.data["education"][0]["institution"]}
# """

#     return HttpResponse(tex, content_type="application/x-tex")


# from google import genai
# from google.genai import types
# import os, json
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from .models import Resume

# client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# @csrf_exempt
# def ats_score(request, resume_id):
#     try:
#         body = json.loads(request.body)
#         job_desc = body.get("job_description", "")

#         resume = Resume.objects.get(id=resume_id).data

#         prompt = f"""
# You are an Applicant Tracking System (ATS).

# Analyze how well this resume matches the job description.

# Return a JSON object with:

# score: integer 0-100
# missing_keywords: list of strings
# matched_keywords: list of strings
# feedback: short string

# RESUME:
# {json.dumps(resume, indent=2)}

# JOB DESCRIPTION:
# {job_desc}
# """

#         response = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt,
#             config=types.GenerateContentConfig(
#                 response_mime_type="application/json"
#             )
#         )

#         ats = json.loads(response.text)

#         return JsonResponse(ats)

#     except Exception as e:
#         return JsonResponse({
#             "error": "ATS failed",
#             "details": str(e)
#         }, status=500)
        
        
# # @csrf_exempt
# # def application_resume(request, app_id):
# #     app = Application.objects.select_related("resume").get(id=app_id)
# #     resume = app.resume

# #     if request.method == "GET":
# #         return JsonResponse({
# #             "id": resume.id,
# #             **resume.data
# #         })

# #     if request.method == "PATCH":
# #         body = json.loads(request.body)
# #         resume.data = body
# #         resume.save()
# #         return JsonResponse({"status": "updated"})
    
# @csrf_exempt
# def application_resume_latex(request, app_id):
#     app = Application.objects.select_related("resume").get(id=app_id)
#     resume = app.resume
#     latex = render_resume_to_latex(resume.data)

#     response = HttpResponse(latex, content_type="text/plain")
#     response["Content-Disposition"] = "attachment; filename=resume.tex"
#     return response

# @csrf_exempt
# def application_resume_ats(request, app_id):
#     app = Application.objects.select_related("resume").get(id=app_id)
#     resume = app.resume

#     body = json.loads(request.body)
#     job_desc = body["job_description"]

#     resume_text = json.dumps(resume.data, indent=2)

#     prompt = f"""
# You are an ATS system.

# Compare this resume against the job description.

# Return STRICT JSON:

# {{
#   "score": number 0-100,
#   "missing_keywords": [list of strings],
#   "strengths": [list of strings],
#   "improvements": [list of strings]
# }}

# RESUME:
# {resume_text}

# JOB DESCRIPTION:
# {job_desc}
# """

#     response = client.models.generate_content(
#         model="gemini-3-flash-preview",
#         contents=prompt
#     )

#     raw = response.text.strip()

#     try:
#         data = json.loads(raw)
#     except:
#         return JsonResponse({"error": "Gemini parse failure"}, status=500)

#     return JsonResponse(data)





# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from .models import Resume
# from applications.models import Application
# from resumes.latex import render_resume_to_latex
# import json, os
# from google import genai
# from google.genai import types

# client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


# @csrf_exempt
# def build_resume(request):
#     body = json.loads(request.body)
#     application_id = body["applicationId"]

#     app = Application.objects.select_related("resume").get(id=application_id)
#     resume = app.resume

#     return JsonResponse({
#         "id": resume.id,
#         **resume.data
#     })


# @csrf_exempt
# def update_resume(request, resume_id):
#     resume = Resume.objects.get(id=resume_id)
#     body = json.loads(request.body)

#     resume.data.update(body)
#     resume.save()

#     return JsonResponse({
#         "id": resume.id,
#         **resume.data
#     })


# def resume_latex(request, resume_id):
#     resume = Resume.objects.get(id=resume_id)

#     latex = render_resume_to_latex(resume.data)

#     response = HttpResponse(latex, content_type="application/x-latex")
#     response["Content-Disposition"] = "attachment; filename=resume.tex"
#     return response


# @csrf_exempt
# def resume_ats(request, resume_id):
#     resume = Resume.objects.get(id=resume_id)
#     body = json.loads(request.body)

#     job_desc = body["job_description"]

#     prompt = f"""
# You are an Applicant Tracking System.

# Return STRICT JSON:

# {{
#   "score": 0-100,
#   "missing_keywords": [],
#   "strengths": [],
#   "improvements": []
# }}

# RESUME:
# {json.dumps(resume.data, indent=2)}

# JOB DESCRIPTION:
# {job_desc}
# """

#     response = client.models.generate_content(
#         model="gemini-3-flash-preview",
#         contents=prompt,
#         config=types.GenerateContentConfig(
#             response_mime_type="application/json"
#         )
#     )

#     return JsonResponse(json.loads(response.text))

# from applications.services.resume_generator import ResumeGeneratorService
# from profiles.models import Profile
# from applications.models import Application
# from resumes.models import Resume
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse
# import json

# @csrf_exempt
# def build_application_resume(request, app_id):
#     if request.method != "POST":
#         return JsonResponse({"error": "POST required"}, status=405)

#     app = Application.objects.select_related("resume").get(id=app_id)
#     profile = Profile.objects.get(user=app.user)

#     body = json.loads(request.body)
#     job_description = body["job_description"]

#     generator = ResumeGeneratorService()

#     generated_text = generator.generate_resume(
#         profile_data=profile.to_dict(),
#         job_description=job_description
#     )

#     resume, _ = Resume.objects.get_or_create(application=app)

#     resume.raw_text = generated_text
#     resume.save()

#     return JsonResponse({
#         "id": resume.id,
#         "applicationId": app.id,
#         "content": generated_text
#     })
    

# @csrf_exempt
# def application_resume(request, app_id):
#     app = Application.objects.select_related("resume").get(id=app_id)
#     resume = app.resume

#     if request.method == "GET":
#         return JsonResponse({
#             "id": resume.id,
#             **resume.data
#         })

#     if request.method == "PATCH":
#         body = json.loads(request.body)
#         resume.data.update(body)
#         resume.save()
#         return JsonResponse({
#             "id": resume.id,
#             **resume.data
#         })


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from resumes.resume_generator import ResumeGeneratorService
from profiles.models import Profile
from applications.models import Application
from resumes.models import Resume
import json

@csrf_exempt
def build_application_resume(request, app_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    app = Application.objects.get(id=app_id)
    profile = Profile.objects.select_related("user").get(user=app.user)

    body = json.loads(request.body or "{}")
    job_description = body.get("job_description", "")
    if not job_description:
        return JsonResponse({"error": "job_description is required"}, status=400)

    generator = ResumeGeneratorService()
    generated = generator.generate_resume(
        profile_data=profile.to_dict(),  # must exist
        job_description=job_description
    )

    # Parse model output as JSON
    try:
        resume_json = json.loads(generated)
    except Exception:
        return JsonResponse(
            {"error": "Model did not return valid JSON", "raw": generated},
            status=500
        )

    resume, _ = Resume.objects.get_or_create(application=app)

    # Save structured resume
    resume.data = resume_json
    resume.save()

    return JsonResponse({
        "id": resume.id,
        "applicationId": app.id,
        **resume.data
    })
    
@csrf_exempt
def application_resume(request, app_id):
    app = Application.objects.get(id=app_id)
    resume, _ = Resume.objects.get_or_create(application=app)

    if request.method == "GET":
        return JsonResponse({
            "id": resume.id,
            "applicationId": app.id,
            **(resume.data or {})
        })

    if request.method == "PATCH":
        body = json.loads(request.body or "{}")
        resume.data = body
        resume.save()
        return JsonResponse({
            "id": resume.id,
            "applicationId": app.id,
            **resume.data
        })

    return JsonResponse({"error": "Unsupported method"}, status=405)
