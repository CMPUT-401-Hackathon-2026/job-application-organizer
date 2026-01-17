def render_resume_to_latex(data: dict) -> str:
    header = data["header"]
    education = data["education"]
    experience = data["experience"]
    projects = data["projects"]
    skills = data["skills"]

    def esc(text):
        return (
            text.replace("&", "\\&")
            .replace("%", "\\%")
            .replace("$", "\\$")
            .replace("#", "\\#")
            .replace("_", "\\_")
        )

    latex = r"""
\documentclass[11pt]{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\setlist[itemize]{noitemsep, topsep=0pt}

\begin{document}
"""

    # Header
    latex += f"""
\\begin{{center}}
{{\\Large \\textbf{{{esc(header["name"])}}}}} \\\\
{esc(header["phone"])} $|$ {esc(header["email"])} $|$
\\href{{{header["linkedin"]}}}{{LinkedIn}} $|$
\\href{{{header["github"]}}}{{GitHub}}
\\end{{center}}
"""

    # Education
    latex += "\\section*{Education}\n"
    for e in education:
        latex += f"""
\\textbf{{{esc(e["institution"])}}} \\hfill {esc(e["dates"])} \\\\
{esc(e["degree"])}, {esc(e["location"])}
\\begin{{itemize}}
"""
        for b in e["bullets"]:
            latex += f"  \\item {esc(b)}\n"
        latex += "\\end{itemize}\n"

    # Experience
    latex += "\\section*{Experience}\n"
    for e in experience:
        latex += f"""
\\textbf{{{esc(e["title"])}}} \\hfill {esc(e["dates"])} \\\\
{esc(e["organization"])}, {esc(e["location"])}
\\begin{{itemize}}
"""
        for b in e["bullets"]:
            latex += f"  \\item {esc(b)}\n"
        latex += "\\end{itemize}\n"

    # Projects
    latex += "\\section*{Projects}\n"
    for p in projects:
        latex += f"""
\\textbf{{{esc(p["title"])}}}
\\begin{{itemize}}
"""
        for b in p["bullets"]:
            latex += f"  \\item {esc(b)}\n"
        latex += "\\end{itemize}\n"

    # Skills
    latex += "\\section*{Technical Skills}\n"
    latex += f"""
\\textbf{{Languages:}} {esc(skills["languages"])} \\\\
\\textbf{{Frameworks:}} {esc(skills["frameworks"])} \\\\
\\textbf{{Tools:}} {esc(skills["tools"])} \\\\
\\textbf{{Libraries:}} {esc(skills["libraries"])} \\\\
"""

    latex += "\n\\end{document}"

    return latex
