import { useContext, useEffect, useState } from "react";
import Styles from "./analyse.module.css";
import { usercontext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";

// Helper to classify feedback items into clean resume sections
function classifyItem(text) {
    const lower = text.toLowerCase();
    let category = "General";
    let icon = "fa-solid fa-list-check";

    if (
        lower.includes("programming") ||
        lower.includes("python") ||
        lower.includes("framework") ||
        lower.includes("library") ||
        lower.includes("libraries") ||
        lower.includes("technical skill") ||
        lower.includes("tensorflow") ||
        lower.includes("tools") ||
        lower.includes("competencies")
    ) {
        category = "Technical Skills";
        icon = "fa-solid fa-code";
    } else if (
        lower.includes("project") ||
        lower.includes("dataset") ||
        lower.includes("model") ||
        lower.includes("deployment") ||
        lower.includes("algorithm") ||
        lower.includes("experience")
    ) {
        category = "Projects & Experience";
        icon = "fa-solid fa-diagram-project";
    } else if (
        lower.includes("education") ||
        lower.includes("university") ||
        lower.includes("degree") ||
        lower.includes("coursework") ||
        lower.includes("academic") ||
        lower.includes("percentages")
    ) {
        category = "Education & Academics";
        icon = "fa-solid fa-graduation-cap";
    } else if (
        lower.includes("certification") ||
        lower.includes("achievement") ||
        lower.includes("hackathon") ||
        lower.includes("rank") ||
        lower.includes("webinar")
    ) {
        category = "Certifications & Awards";
        icon = "fa-solid fa-award";
    } else if (
        lower.includes("contact") ||
        lower.includes("phone") ||
        lower.includes("linkedin") ||
        lower.includes("email") ||
        lower.includes("format") ||
        lower.includes("bullet") ||
        lower.includes("heading") ||
        lower.includes("grammatical") ||
        lower.includes("layout")
    ) {
        category = "ATS & Formatting";
        icon = "fa-solid fa-file-lines";
    } else if (
        lower.includes("objective") ||
        lower.includes("summary") ||
        lower.includes("passion") ||
        lower.includes("career")
    ) {
        category = "Career Profile";
        icon = "fa-solid fa-user-tie";
    }

    // Extract a succinct bold title from the first sentence or clause
    let headline = text;
    const splitIndex = text.search(/[,.:;]/);
    if (splitIndex > 15 && splitIndex < 65) {
        headline = text.substring(0, splitIndex).trim();
    } else if (text.length > 60) {
        headline = text.substring(0, 55).trim() + "...";
    }

    return { category, icon, headline, fullText: text };
}

// Custom Reliable Circular Progress Gauge Component
function CircularGauge({ value, max = 100, label, gradientId, strokeColor1, strokeColor2 }) {
    const safeVal = Math.min(Math.max(Number(value) || 0, 0), max);
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ~263.89
    const strokeDashoffset = circumference - (safeVal / max) * circumference;

    return (
        <div className={Styles.gaugeContainer}>
            <svg className={Styles.gaugeSvg} viewBox="0 0 100 100">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={strokeColor1} />
                        <stop offset="100%" stopColor={strokeColor2} />
                    </linearGradient>
                </defs>
                <circle
                    className={Styles.gaugeBg}
                    cx="50"
                    cy="50"
                    r={radius}
                />
                <circle
                    className={Styles.gaugeFill}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={`url(#${gradientId})`}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className={Styles.gaugeCenterText}>
                <span className={Styles.gaugeValue}>{safeVal}</span>
                <span className={Styles.gaugeMax}>/ {max}</span>
            </div>
        </div>
    );
}

function Analyse() {
    const navigate = useNavigate();
    const [score, setscore] = useState(0);
    const [atsscore, setatsscore] = useState(0);
    const [pros, setpros] = useState([]);
    const [cons, setcons] = useState([]);
    const [sug, setsug] = useState([]);
    const [jobs, setjobs] = useState([]);
    const { serviceURL } = useContext(usercontext);
    const [isfetched, setisfetched] = useState(false);
    const [isloading, setisloading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const animEl = document.getElementById("animate");
        if (animEl) animEl.style.display = "flex";

        fetch(`${serviceURL}/lastReport`, { credentials: "include" })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Report fetch failed");
                    return null;
                }
            })
            .then(data => {
                if (data != null) {
                    setscore(data.score != null ? data.score : 75);
                    setatsscore(data.atsoptimizationscore != null ? data.atsoptimizationscore : 65);
                    setpros(data.pros || []);
                    setcons(data.cons || []);
                    setsug(data.suggestions || []);
                    setjobs(data.jobs || []);
                    setisfetched(true);
                }
                setisloading(false);
                if (animEl) animEl.style.display = "none";
            })
            .catch(error => {
                console.error("Error fetching report:", error);
                setisloading(false);
                if (animEl) animEl.style.display = "none";
            });
    }, [serviceURL]);

    const getScoreStatus = (val) => {
        if (val >= 80) return { label: "Strong Match", class: Styles.statusGreen };
        if (val >= 60) return { label: "Moderate Match", class: Styles.statusYellow };
        return { label: "Needs Improvement", class: Styles.statusRed };
    };

    const overallStatus = getScoreStatus(score);
    const atsStatus = getScoreStatus(atsscore);

    const classifiedPros = pros.map(classifyItem);
    const classifiedCons = cons.map(classifyItem);
    const classifiedSug = sug.map(classifyItem);

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
                <div className={Styles.navActions}>
                    <button className={Styles.navBtnSecondary} onClick={() => navigate("/")}>
                        <i className="fa-solid fa-house"></i>
                        <span>Home</span>
                    </button>
                    <button className={Styles.navBtnPrimary} onClick={() => navigate("/uploaddoc")}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span>New Analysis</span>
                    </button>
                </div>
            </nav>

            {/* Loading Overlay */}
            <div className={Styles.loadani} id="animate">
                <div className={Styles.loadanimation}></div>
                <h1>Synthesizing Career Insights...</h1>
            </div>

            {/* Analysis Report Dashboard */}
            {isfetched ? (
                <div className={Styles.doc}>
                    {/* Score Overview Banner */}
                    <div className={Styles.reportBanner}>
                        <div className={Styles.cardAccent}></div>

                        <div className={Styles.bannerHeader}>
                            <div className={Styles.reportBadge}>
                                <i className="fa-solid fa-chart-line"></i>
                                <span>AI Audit Results</span>
                            </div>
                            <h2>Resume Performance Breakdown</h2>
                            <p>Section-by-section audit against enterprise applicant tracking filters</p>
                        </div>

                        {/* Dual Custom SVG Gauges */}
                        <div className={Styles.scoreRow}>
                            <div className={Styles.scoreItem}>
                                <CircularGauge
                                    value={score}
                                    max={100}
                                    label="Overall"
                                    gradientId="scoreGrad"
                                    strokeColor1="#0061ff"
                                    strokeColor2="#60efff"
                                />
                                <div className={Styles.scoreMeta}>
                                    <h4 className={Styles.scoreTitle}>Overall Profile</h4>
                                    <p className={Styles.scoreDesc}>Comprehensive evaluation across candidate credentials</p>
                                    <span className={`${Styles.scoreStatus} ${overallStatus.class}`}>
                                        {overallStatus.label}
                                    </span>
                                </div>
                            </div>

                            <div className={Styles.scoreItem}>
                                <CircularGauge
                                    value={atsscore}
                                    max={100}
                                    label="ATS"
                                    gradientId="atsGrad"
                                    strokeColor1="#00d2ff"
                                    strokeColor2="#10b981"
                                />
                                <div className={Styles.scoreMeta}>
                                    <h4 className={Styles.scoreTitle}>ATS Compatibility</h4>
                                    <p className={Styles.scoreDesc}>Parser friendliness, formatting, and keyword saturation</p>
                                    <span className={`${Styles.scoreStatus} ${atsStatus.class}`}>
                                        {atsStatus.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Summary Metrics */}
                        <div className={Styles.quickMetrics}>
                            <div className={Styles.metricBox}>
                                <span className={Styles.metricVal}>{pros.length}</span>
                                <span className={Styles.metricLabel}>Strengths</span>
                            </div>
                            <div className={Styles.metricBox}>
                                <span className={Styles.metricVal}>{cons.length}</span>
                                <span className={Styles.metricLabel}>Skill Gaps</span>
                            </div>
                            <div className={Styles.metricBox}>
                                <span className={Styles.metricVal}>{sug.length}</span>
                                <span className={Styles.metricLabel}>Action Items</span>
                            </div>
                            <div className={Styles.metricBox}>
                                <span className={Styles.metricVal}>{jobs.length}</span>
                                <span className={Styles.metricLabel}>Job Matches</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Section Filter Tabs */}
                    <div className={Styles.sectionTabs}>
                        <button
                            type="button"
                            className={`${Styles.tabItem} ${activeTab === "all" ? Styles.tabActive : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            <i className="fa-solid fa-border-all"></i>
                            <span>All Sections</span>
                        </button>
                        <button
                            type="button"
                            className={`${Styles.tabItem} ${activeTab === "pros" ? Styles.tabActive : ""}`}
                            onClick={() => setActiveTab("pros")}
                        >
                            <i className="fa-solid fa-circle-check" style={{ color: "#34d399" }}></i>
                            <span>Strengths</span>
                            <span className={Styles.tabCount}>{pros.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`${Styles.tabItem} ${activeTab === "cons" ? Styles.tabActive : ""}`}
                            onClick={() => setActiveTab("cons")}
                        >
                            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#f87171" }}></i>
                            <span>Skill Gaps</span>
                            <span className={Styles.tabCount}>{cons.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`${Styles.tabItem} ${activeTab === "sug" ? Styles.tabActive : ""}`}
                            onClick={() => setActiveTab("sug")}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#a78bfa" }}></i>
                            <span>Action Plan</span>
                            <span className={Styles.tabCount}>{sug.length}</span>
                        </button>
                        {jobs.length > 0 && (
                            <button
                                type="button"
                                className={`${Styles.tabItem} ${activeTab === "jobs" ? Styles.tabActive : ""}`}
                                onClick={() => setActiveTab("jobs")}
                            >
                                <i className="fa-solid fa-briefcase" style={{ color: "#60efff" }}></i>
                                <span>Target Jobs</span>
                                <span className={Styles.tabCount}>{jobs.length}</span>
                            </button>
                        )}
                    </div>

                    {/* Section 1: Candidate Strengths */}
                    {(activeTab === "all" || activeTab === "pros") && classifiedPros.length > 0 && (
                        <div className={Styles.sectionBlock}>
                            <div className={Styles.sectionHeader}>
                                <div className={Styles.sectionTitleArea}>
                                    <div className={`${Styles.sectionIconBadge} ${Styles.iconPros}`}>
                                        <i className="fa-solid fa-circle-check"></i>
                                    </div>
                                    <div>
                                        <h3>Candidate Strengths & Highlights</h3>
                                        <p>Attributes and sections that effectively meet industry hiring benchmarks</p>
                                    </div>
                                </div>
                                <span className={Styles.sectionBadgeCount}>{classifiedPros.length} items</span>
                            </div>

                            <div className={Styles.cardsGrid}>
                                {classifiedPros.map((item, idx) => (
                                    <div className={Styles.feedbackCard} key={idx}>
                                        <div className={Styles.cardTopRow}>
                                            <span className={`${Styles.categoryTag} ${Styles.tagPros}`}>
                                                <i className={item.icon}></i>
                                                <span>{item.category}</span>
                                            </span>
                                            <span className={Styles.impactBadge}>Verified</span>
                                        </div>
                                        <h4 className={Styles.cardHeadline}>{item.headline}</h4>
                                        <p className={Styles.cardDescription}>{item.fullText}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Areas for Improvement */}
                    {(activeTab === "all" || activeTab === "cons") && classifiedCons.length > 0 && (
                        <div className={Styles.sectionBlock}>
                            <div className={Styles.sectionHeader}>
                                <div className={Styles.sectionTitleArea}>
                                    <div className={`${Styles.sectionIconBadge} ${Styles.iconCons}`}>
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <div>
                                        <h3>Areas for Improvement & Skill Gaps</h3>
                                        <p>Critical gaps and competencies to address for maximum ATS pass-through</p>
                                    </div>
                                </div>
                                <span className={Styles.sectionBadgeCount}>{classifiedCons.length} items</span>
                            </div>

                            <div className={Styles.cardsGrid}>
                                {classifiedCons.map((item, idx) => (
                                    <div className={Styles.feedbackCard} key={idx}>
                                        <div className={Styles.cardTopRow}>
                                            <span className={`${Styles.categoryTag} ${Styles.tagCons}`}>
                                                <i className={item.icon}></i>
                                                <span>{item.category}</span>
                                            </span>
                                            <span className={Styles.impactBadge}>Priority Gap</span>
                                        </div>
                                        <h4 className={Styles.cardHeadline}>{item.headline}</h4>
                                        <p className={Styles.cardDescription}>{item.fullText}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 3: Actionable Revision Recommendations */}
                    {(activeTab === "all" || activeTab === "sug") && classifiedSug.length > 0 && (
                        <div className={Styles.sectionBlock}>
                            <div className={Styles.sectionHeader}>
                                <div className={Styles.sectionTitleArea}>
                                    <div className={`${Styles.sectionIconBadge} ${Styles.iconSug}`}>
                                        <i className="fa-solid fa-lightbulb"></i>
                                    </div>
                                    <div>
                                        <h3>Actionable Revision Recommendations</h3>
                                        <p>Step-by-step optimization recommendations to refine your resume</p>
                                    </div>
                                </div>
                                <span className={Styles.sectionBadgeCount}>{classifiedSug.length} items</span>
                            </div>

                            <div className={Styles.cardsGrid}>
                                {classifiedSug.map((item, idx) => (
                                    <div className={Styles.feedbackCard} key={idx}>
                                        <div className={Styles.cardTopRow}>
                                            <span className={`${Styles.categoryTag} ${Styles.tagSug}`}>
                                                <i className={item.icon}></i>
                                                <span>{item.category}</span>
                                            </span>
                                            <span className={Styles.impactBadge}>Recommendation</span>
                                        </div>
                                        <h4 className={Styles.cardHeadline}>{item.headline}</h4>
                                        <p className={Styles.cardDescription}>{item.fullText}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 4: Curated Job Matches */}
                    {(activeTab === "all" || activeTab === "jobs") && jobs.length > 0 && (
                        <div className={Styles.sectionBlock}>
                            <div className={Styles.sectionHeader}>
                                <div className={Styles.sectionTitleArea}>
                                    <div className={`${Styles.sectionIconBadge} ${Styles.iconJobs}`}>
                                        <i className="fa-solid fa-briefcase"></i>
                                    </div>
                                    <div>
                                        <h3>Curated Job Opportunities</h3>
                                        <p>Active positions aligned with your validated skillset and target role</p>
                                    </div>
                                </div>
                                <span className={Styles.sectionBadgeCount}>{jobs.length} jobs</span>
                            </div>

                            <div className={Styles.jobsGrid}>
                                {jobs.map((item, index) => (
                                    <div className={Styles.jobCard} key={index}>
                                        <div className={Styles.jobHeader}>
                                            <h3 className={Styles.jobTitle}>{item.title}</h3>
                                            <div className={Styles.jobMetaRow}>
                                                <div className={Styles.jobMetaItem}>
                                                    <i className="fa-solid fa-building"></i>
                                                    <span>{item.company?.display_name?.trim() || "Company confidential"}</span>
                                                </div>
                                                <div className={Styles.jobMetaItem}>
                                                    <i className="fa-solid fa-location-dot"></i>
                                                    <span>{item.location?.display_name?.trim() || "Location flexible / Remote"}</span>
                                                </div>
                                            </div>
                                            {item.category?.label && (
                                                <span className={Styles.jobCategoryBadge}>
                                                    {item.category.label.trim()}
                                                </span>
                                            )}
                                        </div>

                                        {item.description && (
                                            <p className={Styles.jobDescription}>
                                                {item.description.replace(/<[^>]+>/g, '')}
                                            </p>
                                        )}

                                        {item.redirect_url && (
                                            <a
                                                className={Styles.jobApplyBtn}
                                                href={item.redirect_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>View & Apply</span>
                                                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : !isloading ? (
                <div className={Styles.errorContainer}>
                    <div className={Styles.errorIconBadge}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <h2>No Report Data Available</h2>
                    <p>We could not find a previous resume analysis for your session. Upload a resume to generate an in-depth audit.</p>
                    <button className={Styles.errorBtn} onClick={() => navigate("/uploaddoc")}>
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Upload Resume Now</span>
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default Analyse;