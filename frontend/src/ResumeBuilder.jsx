import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ResumeBuilder() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showATS, setShowATS] = useState(false);



  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/resume/${id}/`)
      .then(res => res.json())
      .then(data => setResume(data));
  }, [id]);

  const downloadLatex = async () => {
  const res = await fetch(`http://127.0.0.1:8000/api/resume/${id}/latex/`);
  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.tex";
  a.click();
};


  if (!resume) return <div>Loading resume...</div>;

  const { header, education, experience, projects, skills } = resume.data;

  return (
    <div style={page}>
      <Header header={header} />

      <Section title="Education" onEdit={() => setEditingSection("education")}>
  {education.map((e, i) => <Education key={i} data={e} />)}
</Section>

<Section title="Experience" onEdit={() => setEditingSection("experience")}>
  {experience.map((e, i) => <Entry key={i} data={e} />)}
</Section>

<Section title="Projects" onEdit={() => setEditingSection("projects")}>
  {projects.map((p, i) => <Project key={i} data={p} />)}
</Section>

<Section title="Technical Skills" onEdit={() => setEditingSection("skills")}>
  <Skills data={skills} />
</Section>
<div style={actionBar}>
  <button onClick={downloadLatex}>
    Download LaTeX
  </button>

  <button onClick={() => setShowATS(true)}>
    Get ATS Score
  </button>
</div>



      {editingSection && (
  <EditModal
    section={editingSection}
    resume={resume}
    setResume={setResume}
    close={() => setEditingSection(null)}
  />
)}
{showATS && (
  <ATSModal
    resumeId={id}
    close={() => setShowATS(false)}
  />
)}

    </div>
  );
}

function Header({ header }) {
  return (
    <div style={headerBox}>
      <h1>{header.name}</h1>
      <div>
        {header.phone} | {header.email} | {header.linkedin} | {header.github}
      </div>
    </div>
  );
}

function Section({ title, children, onEdit }) {
  return (
    <div style={sectionBox}>
      <div style={sectionHeader}>
        <strong>{title.toUpperCase()}</strong>
        <button onClick={onEdit}>Edit</button>
      </div>
      {children}
    </div>
  );
}


function Education({ data }) {
  return (
    <div>
      <strong>{data.institution}</strong> — {data.dates}<br />
      {data.degree}, {data.location}
      <ul>
        {data.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function Entry({ data }) {
  return (
    <div>
      <strong>{data.title}</strong> — {data.dates}<br />
      {data.organization}, {data.location}
      <ul>
        {data.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function Project({ data }) {
  return (
    <div>
      <strong>{data.title}</strong>
      <ul>
        {data.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function Skills({ data }) {
  return (
    <div>
      <p><strong>Languages:</strong> {data.languages}</p>
      <p><strong>Frameworks:</strong> {data.frameworks}</p>
      <p><strong>Tools:</strong> {data.tools}</p>
      <p><strong>Libraries:</strong> {data.libraries}</p>
    </div>
  );
}

const page = { maxWidth: 900, margin: "auto", fontFamily: "Arial" };
const headerBox = { textAlign: "center", marginBottom: 20 };
const sectionBox = { border: "1px solid #ccc", padding: 15, marginBottom: 15 };
const sectionHeader = { display: "flex", justifyContent: "space-between" };

function EditModal({ section, resume, setResume, close }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(JSON.stringify(resume.data[section], null, 2));
  }, [section, resume]);

  const save = async () => {
    const parsed = JSON.parse(value);

    await fetch(`http://127.0.0.1:8000/api/resume/${resume.id}/section/${section}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: parsed })
    });

    setResume({
      ...resume,
      data: {
        ...resume.data,
        [section]: parsed
      }
    });

    close();
  };

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2>Edit {section}</h2>

        <textarea
          style={modalTextarea}
          value={value}
          onChange={e => setValue(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={close}>Cancel</button>
          <button onClick={save} style={{ marginLeft: 10 }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalBox = {
  background: "white",
  padding: 20,
  width: 600,
  borderRadius: 8
};

const modalTextarea = {
  width: "100%",
  height: 300
};


function ATSModal({ resumeId, close }) {
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/resume/${resumeId}/ats/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDesc })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.details || "ATS failed");
    }

    setResult(data);
  } catch (err) {
    alert("ATS Error: " + err.message);
  }
};

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <h2>ATS Analyzer</h2>

        <textarea
          placeholder="Paste job description here..."
          style={modalTextarea}
          value={jobDesc}
          onChange={e => setJobDesc(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={analyze}>Analyze</button>
          <button onClick={close} style={{ marginLeft: 10 }}>
            Close
          </button>
        </div>

        {result && (
          <div style={{ marginTop: 15 }}>
            <h3>Score: {result.score}%</h3>
            <p><strong>Missing Keywords:</strong></p>
            <ul>
              {result.missing_keywords.map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
const actionBar = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 30
};


