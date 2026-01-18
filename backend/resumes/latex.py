# resumes/latex.py
def render_resume_to_latex(resume_data: dict) -> str:
    """
    Convert resume JSON to professional LaTeX document.
    
    Args:
        resume_data: Dictionary with resume structure from DeepSeek
        
    Returns:
        Complete LaTeX document as string
    """
    
    def escape_latex(text: str) -> str:
        """Escape special LaTeX characters"""
        replacements = {
            '&': r'\&',
            '%': r'\%',
            '$': r'\$',
            '#': r'\#',
            '_': r'\_',
            '{': r'\{',
            '}': r'\}',
            '~': r'\textasciitilde{}',
            '^': r'\^{}',
            '\\': r'\textbackslash{}',
        }
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
        return text
    
    # Extract data with defaults
    header = escape_latex(resume_data.get('header', ''))
    summary = escape_latex(resume_data.get('summary', ''))
    education = resume_data.get('education', [])
    experience = resume_data.get('experience', [])
    projects = resume_data.get('projects', [])
    tech_stack = resume_data.get('techStack', [])
    frameworks = resume_data.get('frameworks', [])
    libraries = resume_data.get('libraries', [])
    prog_langs = resume_data.get('programmingLanguages', [])
    
    # Build LaTeX document
    latex = r"""\documentclass[11pt,letterpaper]{article}

% Packages
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=0.75in]{geometry}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage{hyperref}

% Formatting
\pagestyle{empty}
\setlist{nosep, leftmargin=*}
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{10pt}{5pt}

\begin{document}

% Header
"""
    
    # Add header
    latex += f"\\begin{{center}}\n\\textbf{{{header}}}\n\\end{{center}}\n\n"
    
    # Add summary if exists
    if summary:
        latex += f"\\noindent {summary}\n\n"
    
    # Education Section
    if education:
        latex += r"\section*{Education}" + "\n"
        for edu in education:
            school = escape_latex(edu.get('school', ''))
            degree = escape_latex(edu.get('degree', ''))
            field = escape_latex(edu.get('field', ''))
            start = escape_latex(edu.get('startDate', ''))
            end = escape_latex(edu.get('endDate', ''))
            
            latex += f"\\textbf{{{school}}} \\hfill {start} -- {end}\\\\\n"
            latex += f"{degree} in {field}\\\\\n\n"
    
    # Experience Section
    if experience:
        latex += r"\section*{Experience}" + "\n"
        for exp in experience:
            company = escape_latex(exp.get('company', ''))
            position = escape_latex(exp.get('position', ''))
            start = escape_latex(exp.get('startDate', ''))
            end = escape_latex(exp.get('endDate', ''))
            description = exp.get('description', [])
            
            latex += f"\\textbf{{{position}}} \\hfill {start} -- {end}\\\\\n"
            latex += f"\\textit{{{company}}}\n"
            
            if description:
                latex += "\\begin{itemize}\n"
                for bullet in description:
                    latex += f"\\item {escape_latex(bullet)}\n"
                latex += "\\end{itemize}\n"
            
            latex += "\n"
    
    # Projects Section
    if projects:
        latex += r"\section*{Projects}" + "\n"
        for proj in projects:
            name = escape_latex(proj.get('name', ''))
            desc = escape_latex(proj.get('description', ''))
            
            latex += f"\\textbf{{{name}}}\\\\\n"
            latex += f"{desc}\\\\\n\n"
    
    # Technical Skills Section
    if prog_langs or frameworks or libraries or tech_stack:
        latex += r"\section*{Technical Skills}" + "\n"
        
        if prog_langs:
            latex += f"\\textbf{{Programming Languages:}} {', '.join(map(escape_latex, prog_langs))}\\\\\n"
        
        if frameworks:
            latex += f"\\textbf{{Frameworks:}} {', '.join(map(escape_latex, frameworks))}\\\\\n"
        
        if libraries:
            latex += f"\\textbf{{Libraries:}} {', '.join(map(escape_latex, libraries))}\\\\\n"
        
        if tech_stack:
            latex += f"\\textbf{{Tools \\& Technologies:}} {', '.join(map(escape_latex, tech_stack))}\\\\\n"
    
    # Close document
    latex += r"""
\end{document}
"""
    
    return latex