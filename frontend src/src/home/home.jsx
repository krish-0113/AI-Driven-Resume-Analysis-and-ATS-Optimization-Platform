import Styles from "./home.module.css";
import { useContext, useEffect, useState } from "react";
import { usercontext } from "../appcontext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
    const navigate = useNavigate();
    const { islogged, username, isprevious, serviceURL, setusername, setislogged, setisprevious } = useContext(usercontext);
    const [isshow, setshow] = useState(false);
    const [isloading, setisloading] = useState(false);
    const [delloading, setdelloading] = useState(false);

    useEffect(() => {
        const func = (event) => {
            if (event.target.id !== "menu" && !event.target.closest("#menu")) {
                setshow(false);
            }
        };

        window.addEventListener("click", func);
        return () => window.removeEventListener("click", func);
    }, []);

    const logout = () => {
        setisloading(true);
        fetch(`${serviceURL}/logout`, { method: "post", credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    setusername("");
                    setislogged(false);
                    setisprevious(false);
                    toast.success("Successfully logged out");
                    setisloading(false);
                    navigate("/login");
                } else {
                    toast.error("Unauthorized access");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Logout failed");
                setisloading(false);
            });
    };

    function toggle(e) {
        e.stopPropagation();
        setshow(!isshow);
    }

    const confirmagain = () => {
        document.getElementById("confirmdivdel").style.display = "flex";
    };

    const closedeldiv = () => {
        document.getElementById("confirmdivdel").style.display = "none";
    };

    const delaccount = () => {
        setdelloading(true);
        fetch(`${serviceURL}/deleteAccount`, { method: "post", credentials: 'include' })
            .then(response => {
                if (response.ok) {
                    setislogged(false);
                    document.getElementById("confirmdivdel").style.display = "none";
                    setdelloading(false);
                    setusername("");
                    setisprevious(false);
                    navigate("/login");
                    toast.success("Account Deleted Successfully");
                } else {
                    toast.error("Couldn't delete, try again!");
                    setdelloading(false);
                }
            })
            .catch(() => {
                toast.error("Network Error");
                setdelloading(false);
            });
    };

    const upnavigate = () => {
        if (islogged) {
            navigate("/uploaddoc");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className={Styles.container}>
            {/* Navigation Bar */}
            <nav className={Styles.nav}>
                <div className={Styles.logoArea} onClick={() => navigate("/")}>
                    <div className={Styles.logoIcon}>
                        <i className="fa-solid fa-file-waveform"></i>
                    </div>
                    <h1>Resume Analyser</h1>
                </div>

                <div className={Styles.navRight}>
                    {!islogged ? (
                        <Link to={"/login"} style={{ textDecoration: "none" }}>
                            <button className={Styles.loginBtn}>
                                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                                <span>Sign In</span>
                            </button>
                        </Link>
                    ) : (
                        <div id="menu" onClick={toggle} className={Styles.profile} title={username}>
                            {username ? username[0].toUpperCase() : "U"}
                        </div>
                    )}
                </div>
            </nav>

            {/* Profile Dropdown Menu */}
            {isshow && islogged && (
                <div id="menu" className={Styles.profilemenu}>
                    <div className={Styles.profileHeader} id="menu">
                        <h2 id="menu">{username}</h2>
                        <div className={Styles.userRoleText} id="menu">Authenticated User</div>
                    </div>
                    <div id="menu" className={Styles.pmenusec}>
                        <button id="menu" onClick={logout} disabled={isloading}>
                            <i className="fa-solid fa-right-from-bracket" id="menu"></i>
                            <span id="menu">Log Out</span>
                        </button>
                        <button onClick={confirmagain} id="menu" disabled={isloading} className={Styles.delBtn}>
                            <i className="fa-regular fa-trash-can" id="menu"></i>
                            <span id="menu" className={Styles.del}>Delete Account</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <header className={Styles.hero}>
                <div className={Styles.heroContent}>
                    <div className={Styles.badge}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span>AI-Powered ATS Auditor 2.0</span>
                    </div>

                    <h1>
                        Supercharge Your Career with <br />
                        <span className={Styles.gradientText}>AI Resume Intelligence</span>
                    </h1>

                    <p>
                        Evaluate resumes against enterprise ATS filters in seconds. Uncover missing keywords, role relevance gaps, and formatting pitfalls to stand out in today's competitive job market.
                    </p>

                    <div className={Styles.btncontainer}>
                        <button className={Styles.primaryBtn} disabled={isloading} onClick={upnavigate}>
                            <span>Analyse Resume</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                        {isprevious && (
                            <button className={Styles.secondaryBtn} disabled={isloading} onClick={() => navigate("/analysereport")}>
                                <i className="fa-solid fa-chart-pie"></i>
                                <span>Previous Report</span>
                            </button>
                        )}
                    </div>

                    <div className={Styles.trustBadges}>
                        <div className={Styles.trustItem}>
                            <i className="fa-solid fa-circle-check"></i>
                            <span>98% ATS Accuracy</span>
                        </div>
                        <div className={Styles.trustItem}>
                            <i className="fa-solid fa-bolt"></i>
                            <span>Instant Gemini Audit</span>
                        </div>
                        <div className={Styles.trustItem}>
                            <i className="fa-solid fa-shield-halved"></i>
                            <span>Enterprise Secure</span>
                        </div>
                    </div>
                </div>

                {/* Interactive Visual Showcase Card */}
                <div className={Styles.heroVisual}>
                    <div className={Styles.glowOrb}></div>

                    <div className={Styles.floatingChip1}>
                        <i className="fa-solid fa-circle-check" style={{ marginRight: "6px" }}></i>
                        94% ATS Match
                    </div>

                    <div className={Styles.floatingChip2}>
                        <i className="fa-solid fa-briefcase" style={{ marginRight: "6px" }}></i>
                        Role Tailored
                    </div>

                    <div className={Styles.showcaseCard}>
                        <div className={Styles.cardHeader}>
                            <div className={Styles.windowDots}>
                                <span className={Styles.dotRed}></span>
                                <span className={Styles.dotYellow}></span>
                                <span className={Styles.dotGreen}></span>
                            </div>
                            <div className={Styles.statusPill}>
                                <i className="fa-solid fa-circle" style={{ fontSize: "7px", marginRight: "5px" }}></i>
                                Live ATS Audit
                            </div>
                        </div>

                        <img className={Styles.bg} src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80" alt="Analysis Preview" />

                        <div className={Styles.scoreBanner}>
                            <div>
                                <div className={Styles.scoreLabel}>Evaluation Score</div>
                                <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>Strong Candidate</div>
                            </div>
                            <div className={Styles.scoreValue}>94<span style={{ fontSize: "14px", color: "#64748b" }}>/100</span></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Feature Highlights Grid */}
            <section className={Styles.featuresSection}>
                <div className={Styles.featureCard}>
                    <div className={Styles.featureIcon}>
                        <i className="fa-solid fa-bullseye"></i>
                    </div>
                    <h3>Strict ATS Scoring</h3>
                    <p>Scored against modern enterprise ATS filters to ensure your resume never gets lost in automated screening algorithms.</p>
                </div>

                <div className={Styles.featureCard}>
                    <div className={Styles.featureIcon}>
                        <i className="fa-solid fa-magnifying-glass-chart"></i>
                    </div>
                    <h3>Keyword & Skill Gap Analysis</h3>
                    <p>Identifies crucial industry keywords and missing competencies specific to your target job profile.</p>
                </div>

                <div className={Styles.featureCard}>
                    <div className={Styles.featureIcon}>
                        <i className="fa-solid fa-lightbulb"></i>
                    </div>
                    <h3>Actionable Recommendations</h3>
                    <p>Receive concrete bullet-point revisions and structural tips tailored to impress hiring managers.</p>
                </div>
            </section>


            {/* Delete Account Confirmation Modal */}
            <div className={Styles.delcontainer} id='confirmdivdel'>
                <div className={Styles.confirmcontainer}>
                    <div className={Styles.warningIcon}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3>Delete Account?</h3>
                    <p>This action is permanent and will completely remove your profile and all previous resume analysis history.</p>
                    <div className={Styles.confirmationbtns}>
                        <button className={Styles.confirmdel} disabled={delloading} onClick={delaccount}>
                            {delloading ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <button className={Styles.notnow} disabled={delloading} onClick={closedeldiv}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;