import { useContext, useState, useEffect } from "react";
import Styles from "./login.module.css";
import { toast } from "react-toastify";
import { usercontext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";
import GoogleButton from "../googlebtn.jsx";

function Login() {
    const navigate = useNavigate();
    const [islogin, setislogin] = useState(true);
    const { backendURL, setisprevious, setusername, setislogged, islogged } = useContext(usercontext);
    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [isloading, setisloading] = useState(false);
    const [isemailverified, setemailverified] = useState(false);
    const [otp, setotp] = useState(["", "", "", "", "", ""]);
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);

    useEffect(() => {
        if (islogged) {
            navigate("/");
        }
    }, [islogged, navigate]);

    function validateEmail(val) {
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailregex.test(val);
    }

    const submit = (event) => {
        if (event) event.preventDefault();
        if (!islogin) {
            if (name.trim() === "") {
                toast.warn("Username must not be empty");
                return;
            }
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Please enter a valid email address");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must have at least 6 characters");
                return;
            }
            if (password !== confirmpassword) {
                toast.warn("Passwords do not match");
                return;
            }
            setisloading(true);
            fetch(`${backendURL}/verifyEmail`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name.trim(), email: email.trim() })
            })
                .then(async response => {
                    if (response.ok) {
                        setemailverified(true);
                        setisloading(false);
                        toast.info("Verification code sent to your email");
                    } else {
                        const errMsg = await response.text();
                        if (response.status === 409) {
                            toast.error("This email is already registered! Please switch to Sign In.");
                        } else if (response.status === 403) {
                            toast.error("Access forbidden. Please ensure you are connected on the authorized port.");
                        } else if (response.status === 406) {
                            toast.error("Unable to deliver OTP to this email address.");
                        } else {
                            toast.error(errMsg || "Signup failed. Please try again.");
                        }
                        setisloading(false);
                    }
                })
                .catch(() => {
                    toast.error("Signup request failed. Check server connection.");
                    setisloading(false);
                });
        } else {
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Please enter a valid email address");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must have at least 6 characters");
                return;
            }
            setisloading(true);
            fetch(`${backendURL}/login`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password }),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        setemail("");
                        setpassword("");
                        setisloading(false);
                        setshowpass(false);
                        toast.success("Successfully logged in");
                        return response.json();
                    } else {
                        setisloading(false);
                        toast.error("Invalid credentials");
                        return null;
                    }
                })
                .then(data => {
                    if (data != null) {
                        setislogged(true);
                        setusername(data.username);
                        setisprevious(data.isPrevious);
                        navigate("/");
                    }
                })
                .catch(() => {
                    toast.error("Login failed. Check server connection.");
                    setisloading(false);
                });
        }
    };

    function switchmth(targetState) {
        setname("");
        setemail("");
        setpassword("");
        setshowpass(false);
        setshowconfirmpass(false);
        setconfirmpassword("");
        if (typeof targetState === "boolean") {
            setislogin(targetState);
        } else {
            setislogin(!islogin);
        }
    }

    const handleInput = (index, event) => {
        const val = event.target.value.replace(/\D/g, "");
        const tem = [...otp];
        tem[index] = val ? val.slice(-1) : "";
        setotp(tem);

        if (val && index < 5) {
            const nextEl = document.getElementById(`signup-otp-${index + 1}`);
            if (nextEl) nextEl.focus();
        }
    };

    const handlebck = (index, event) => {
        if (event.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const prevEl = document.getElementById(`signup-otp-${index - 1}`);
                if (prevEl) prevEl.focus();
            }
            const tem = [...otp];
            tem[index] = "";
            setotp(tem);
        }
    };

    const handleOtpPaste = (event) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData) {
            const newOtp = ["", "", "", "", "", ""];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setotp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            const targetEl = document.getElementById(`signup-otp-${focusIndex}`);
            if (targetEl) targetEl.focus();
        }
    };

    const verifyprocess = (e) => {
        if (e) e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/register`, {
            method: "post",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: name.trim(),
                email: email.trim(),
                password: password,
                verifyotp: enteredOtp
            })
        })
            .then(response => {
                if (response.ok) {
                    setotp(["", "", "", "", "", ""]);
                    setname("");
                    setemail("");
                    setpassword("");
                    toast.success("Account created successfully! Please sign in.");
                    setisloading(false);
                    setemailverified(false);
                    setshowpass(false);
                    setshowconfirmpass(false);
                    setconfirmpassword("");
                    setislogin(true);
                } else {
                    setotp(["", "", "", "", "", ""]);
                    toast.error("Invalid verification code");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Network error during verification");
                setisloading(false);
            });
    };

    return (
        <div className={Styles.container}>
            {/* Navigation Bar */}
            <nav className={Styles.nav}>
                <Link to="/" className={Styles.logoArea}>
                    <div className={Styles.logoIcon}>
                        <i className="fa-solid fa-file-waveform"></i>
                    </div>
                    <h1>Resume Analyser</h1>
                </Link>
                <Link to="/" className={Styles.navHomeBtn}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back to Home</span>
                </Link>
            </nav>

            {!isemailverified ? (
                <div className={Styles.logincontainer}>
                    <div className={Styles.cardAccent}></div>

                    {/* Segmented Tab Switcher */}
                    <div className={Styles.tabSwitch}>
                        <button
                            type="button"
                            className={`${Styles.tabBtn} ${islogin ? Styles.activeTab : ""}`}
                            onClick={() => switchmth(true)}
                        >
                            <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            <span>Sign In</span>
                        </button>
                        <button
                            type="button"
                            className={`${Styles.tabBtn} ${!islogin ? Styles.activeTab : ""}`}
                            onClick={() => switchmth(false)}
                        >
                            <i className="fa-solid fa-user-plus"></i>
                            <span>Create Account</span>
                        </button>
                    </div>

                    {/* Card Header */}
                    <div className={Styles.cardHeader}>
                        <div className={Styles.headerIconBadge}>
                            <i className={islogin ? "fa-solid fa-fingerprint" : "fa-solid fa-wand-magic-sparkles"}></i>
                        </div>
                        <h1>{islogin ? "Welcome Back" : "Get Started"}</h1>
                        <p>
                            {islogin
                                ? "Enter your credentials to access your account"
                                : "Analyze, refine and benchmark your resume with AI"}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <form className={Styles.form} onSubmit={submit} noValidate>
                        {!islogin && (
                            <div className={Styles.inputGroup}>
                                <label className={Styles.inputLabel} htmlFor="signup-username">
                                    Full Name / Username
                                </label>
                                <div className={Styles.inputWrapper}>
                                    <i className={`fa-solid fa-user ${Styles.fieldIcon}`}></i>
                                    <input
                                        className={Styles.formInput}
                                        onChange={(e) => setname(e.target.value)}
                                        type="text"
                                        name="username"
                                        id="signup-username"
                                        maxLength={30}
                                        autoComplete="name"
                                        value={name}
                                        placeholder="e.g. Alex Johnson"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={Styles.inputGroup}>
                            <label className={Styles.inputLabel} htmlFor="auth-email">
                                Email Address
                            </label>
                            <div className={Styles.inputWrapper}>
                                <i className={`fa-solid fa-envelope ${Styles.fieldIcon}`}></i>
                                <input
                                    type="email"
                                    className={Styles.formInput}
                                    onChange={(e) => setemail(e.target.value)}
                                    name="email"
                                    id="auth-email"
                                    value={email}
                                    autoComplete="username"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className={Styles.inputGroup}>
                            <div className={Styles.inputLabel}>
                                <label htmlFor="auth-password">Password</label>
                            </div>
                            <div className={Styles.inputWrapper}>
                                <i className={`fa-solid fa-lock ${Styles.fieldIcon}`}></i>
                                <input
                                    type={showpass ? "text" : "password"}
                                    className={`${Styles.formInput} ${Styles.passInput}`}
                                    onChange={(e) => setpassword(e.target.value)}
                                    name="password"
                                    id="auth-password"
                                    value={password}
                                    autoComplete={islogin ? "current-password" : "new-password"}
                                    placeholder={islogin ? "Enter your password" : "Min. 6 characters"}
                                    required
                                />
                                <button
                                    type="button"
                                    className={Styles.eyeToggle}
                                    onClick={() => setshowpass(!showpass)}
                                    aria-label={showpass ? "Hide password" : "Show password"}
                                >
                                    <i className={`fa-solid ${showpass ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </div>

                        {!islogin && (
                            <div className={Styles.inputGroup}>
                                <label className={Styles.inputLabel} htmlFor="auth-confirmpassword">
                                    Confirm Password
                                </label>
                                <div className={Styles.inputWrapper}>
                                    <i className={`fa-solid fa-shield-halved ${Styles.fieldIcon}`}></i>
                                    <input
                                        type={showconfirmpass ? "text" : "password"}
                                        className={`${Styles.formInput} ${Styles.passInput}`}
                                        name="confirmpassword"
                                        id="auth-confirmpassword"
                                        onChange={(e) => setconfirmpassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        autoComplete="new-password"
                                        value={confirmpassword}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={Styles.eyeToggle}
                                        onClick={() => setshowconfirmpass(!showconfirmpass)}
                                        aria-label={showconfirmpass ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fa-solid ${showconfirmpass ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {islogin && (
                            <Link className={Styles.forgotPassLink} to="/forgotpassword">
                                Forgot password?
                            </Link>
                        )}

                        <button
                            type="submit"
                            className={Styles.submitBtn}
                            disabled={isloading}
                        >
                            {isloading ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>{islogin ? "Signing in..." : "Sending Code..."}</span>
                                </>
                            ) : (
                                <>
                                    <span>{islogin ? "Sign In" : "Create Account"}</span>
                                    <i className="fa-solid fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className={Styles.divider}>
                        <span>Or continue with</span>
                    </div>

                    <GoogleButton disabled={isloading} />

                    <p className={Styles.footerPrompt}>
                        {islogin ? "Don't have an account yet?" : "Already have an account?"}
                        <span className={Styles.switchLink} onClick={() => switchmth(!islogin)}>
                            {islogin ? "Sign up" : "Sign in"}
                        </span>
                    </p>
                </div>
            ) : (
                /* OTP Verification Container */
                <div className={Styles.verifycontainer}>
                    <div className={Styles.cardAccent}></div>
                    <div className={Styles.verifyIconBadge}>
                        <i className="fa-solid fa-envelope-circle-check"></i>
                    </div>
                    <h1>Verify Your Email</h1>
                    <p className={Styles.verifyDesc}>
                        We have sent a 6-digit confirmation code to{" "}
                        <span className={Styles.emailHighlight}>{email}</span>. Enter the code below to complete your registration.
                    </p>

                    <div className={Styles.otpRow} onPaste={handleOtpPaste}>
                        {otp.map((value, index) => (
                            <input
                                key={index}
                                id={`signup-otp-${index}`}
                                inputMode="numeric"
                                maxLength={1}
                                placeholder="•"
                                value={value}
                                autoComplete="off"
                                type="text"
                                className={Styles.otpInput}
                                onChange={(e) => handleInput(index, e)}
                                onKeyDown={(e) => handlebck(index, e)}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        className={Styles.submitBtn}
                        disabled={isloading}
                        onClick={verifyprocess}
                    >
                        {isloading ? (
                            <>
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                <span>Verifying OTP...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Complete Registration</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className={Styles.backBtn}
                        onClick={() => setemailverified(false)}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Change Email / Back to Signup</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Login;