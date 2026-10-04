import { toast } from "react-toastify";
import Styles from "./upload.module.css";
import { useContext, useState } from "react";
import { usercontext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";

function Uploadpage() {
    const { serviceURL } = useContext(usercontext);
    const navigate = useNavigate();
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);

    const validate = (file) => {
        if (!file) return false;

        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a resume in PDF or DOC/DOCX format");
            resetFile();
            return false;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB. Please upload a smaller file.");
            resetFile();
            return false;
        }

        const sizeInKb = (file.size / 1024).toFixed(1);
        setFileSize(`${sizeInKb} KB`);

        let str = file.name;
        if (str.length > 28) {
            str = str.substring(0, 14) + "..." + str.substring(str.length - 10);
        }
        setFileName(str);

        const indication = document.getElementById("indication");
        if (indication) {
            indication.textContent = str;
        }
        return true;
    };

    const resetFile = () => {
        const inp = document.getElementById("resume");
        if (inp) inp.value = "";
        setFileName("");
        setFileSize("");
        const indication = document.getElementById("indication");
        if (indication) {
            indication.textContent = "No file uploaded";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        validate(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const inp = document.getElementById("resume");
            if (inp) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                inp.files = dataTransfer.files;
            }
            validate(file);
        }
    };

    const analysedoc = (event) => {
        event.preventDefault();
        const uploadform = document.getElementById("upform");
        const formdata = new FormData(uploadform);

        if (!formdata.get("roles") || formdata.get("roles").trim() === "") {
            toast.warn("Target job role must not be empty");
            return;
        }

        const file = formdata.get("file");
        if (!file || !file.name) {
            toast.warn("Please upload your resume");
            return;
        }

        const animEl = document.getElementById("animate");
        if (animEl) animEl.style.display = "flex";

        fetch(`${serviceURL}/extract`, {
            method: "post",
            body: formdata,
            credentials: "include"
        })
            .then(response => {
                if (response.ok) {
                    if (uploadform) uploadform.reset();
                    resetFile();
                    if (animEl) animEl.style.display = "none";
                    navigate("/analysereport");
                } else {
                    if (uploadform) uploadform.reset();
                    resetFile();
                    toast.error("Irrelevant resume or target role mismatch");
                    if (animEl) animEl.style.display = "none";
                }
            })
            .catch(() => {
                toast.error("Network error during resume analysis");
                if (animEl) animEl.style.display = "none";
            });
    };

    return (
        <div className={Styles.container}>
            {/* Top Navigation */}
            <nav className={Styles.nav}>
                <Link to="/" className={Styles.logoArea}>
                    <div className={Styles.logoIcon}>
                        <i className="fa-solid fa-file-waveform"></i>
                    </div>
                    <h1>Resume Analyser</h1>
                </Link>
                <button className={Styles.navHomeBtn} onClick={() => navigate("/")}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back to Home</span>
                </button>
            </nav>

            <div className={Styles.contentWrapper}>
                {/* Upload Card */}
                <div className={Styles.uploadcontainer}>
                    <div className={Styles.cardAccent}></div>

                    <div className={Styles.cardHeader}>
                        <div className={Styles.headerIconBadge}>
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                        </div>
                        <h2>Upload Resume</h2>
                        <p>Evaluate your credentials against ATS filters with AI-driven precision</p>
                    </div>

                    <form id="upform" className={Styles.uploadform} encType="multipart/form-data" onSubmit={analysedoc}>
                        <div className={Styles.inputGroup}>
                            <label className={Styles.uploadcontainerlabel} htmlFor="roles">
                                <i className="fa-solid fa-briefcase"></i>
                                <span>Target Job Role</span>
                            </label>
                            <div className={Styles.inputWrapper}>
                                <i className={`fa-solid fa-crosshairs ${Styles.fieldIcon}`}></i>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Ex: Senior Full Stack Engineer, Data Scientist"
                                    name="roles"
                                    id="roles"
                                    className={Styles.roleInput}
                                    required
                                />
                            </div>
                        </div>

                        {/* Drag and Drop File Input Area */}
                        <div className={Styles.inputGroup}>
                            <label className={Styles.uploadcontainerlabel}>
                                <i className="fa-solid fa-file-arrow-up"></i>
                                <span>Resume Document</span>
                            </label>

                            <label
                                htmlFor="resume"
                                className={Styles.fileinp}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                style={{
                                    borderColor: isDragOver ? "#60efff" : undefined,
                                    backgroundColor: isDragOver ? "rgba(0, 97, 255, 0.12)" : undefined
                                }}
                            >
                                <div className={Styles.dropIcon}>
                                    <i className={fileName ? "fa-solid fa-file-circle-check" : "fa-solid fa-cloud-arrow-up"}></i>
                                </div>
                                <h4 className={Styles.dropTitle}>
                                    {fileName ? "Resume Selected" : "Drag & drop your resume file here"}
                                </h4>
                                <p className={Styles.dropSubtitle}>
                                    {fileName ? `${fileName} (${fileSize})` : "Supported formats: PDF, DOC, DOCX (Max 2MB)"}
                                </p>
                                <span className={Styles.browseBtnBadge}>
                                    <i className="fa-solid fa-folder-open"></i>
                                    <span>{fileName ? "Change Document" : "Browse Computer"}</span>
                                </span>
                                <span id="indication" className={Styles.spn} style={{ display: fileName ? "inline-flex" : "none" }}>
                                    <i className="fa-solid fa-check"></i>
                                    {fileName || "No file uploaded"}
                                </span>
                            </label>

                            <input
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                id="resume"
                                hidden
                                accept=".pdf,.doc,.docx"
                            />
                        </div>

                        <button type="submit" className={Styles.analyseBtn}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>Analyse Resume</span>
                        </button>
                    </form>
                </div>

                {/* Upload Guidelines Tile Grid */}
                <div className={Styles.guidelinescontainer}>
                    <div className={Styles.guidelinesHeader}>
                        <i className="fa-solid fa-circle-info"></i>
                        <h3>Upload Requirements</h3>
                    </div>

                    <div className={Styles.guidelinesGrid}>
                        <div className={Styles.guideCard}>
                            <span className={Styles.guideTitle}>Formats</span>
                            <span className={Styles.guideDesc}>PDF (.pdf) or Microsoft Word (.doc, .docx)</span>
                        </div>
                        <div className={Styles.guideCard}>
                            <span className={Styles.guideTitle}>File Size</span>
                            <span className={Styles.guideDesc}>Strict maximum of 2 MB per document</span>
                        </div>
                        <div className={Styles.guideCard}>
                            <span className={Styles.guideTitle}>Language</span>
                            <span className={Styles.guideDesc}>English text format for optimal NLP parsing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Processing Overlay */}
            <div className={Styles.loadani} id="animate">
                <div className={Styles.loadanimation}></div>
                <h1>Auditing & Analysing Resume...</h1>
                <p>Gemini AI is parsing skills, calculating ATS match, and extracting insights</p>
            </div>
        </div>
    );
}

export default Uploadpage;