import { useContext, useState, useEffect } from "react";
import Styles from "./resetpassword.module.css";
import { useNavigate, Link } from "react-router-dom";
import { usercontext } from "../appcontext";
import { toast } from "react-toastify";

function Forgotpassword() {
    const navigate = useNavigate();
    const [email, setemail] = useState("");
    const [otp, setotp] = useState(["", "", "", "", "", ""]);
    const [newpassword, setnewpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [isloading, setisloading] = useState(false);
    const [isemailpresent, setisemailpresent] = useState(false);
    const [isemailverified, setisemailverified] = useState(false);
    const { backendURL, islogged } = useContext(usercontext);
    const [showpass, setshowpass] = useState(false);
    const [showconfirmpass, setshowconfirmpass] = useState(false);

    useEffect(() => {
        if (islogged) {
            navigate("/");
        }
    }, [islogged, navigate]);

    const handleInput = (index, event) => {
        const val = event.target.value.replace(/\D/g, "");
        const tem = [...otp];
        tem[index] = val ? val.slice(-1) : "";
        setotp(tem);

        if (val && index < 5) {
            const nextEl = document.getElementById(`reset-otp-${index + 1}`);
            if (nextEl) nextEl.focus();
        }
    };

    const handlebck = (index, event) => {
        if (event.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const prevEl = document.getElementById(`reset-otp-${index - 1}`);
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
            const targetEl = document.getElementById(`reset-otp-${focusIndex}`);
            if (targetEl) targetEl.focus();
        }
    };

    function validateEmail(val) {
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailregex.test(val);
    }

    const verifyemail = (e) => {
        if (e) e.preventDefault();
        if (email.trim() === "") {
            toast.warn("Email must not be empty");
            return;
        }
        if (!validateEmail(email.trim())) {
            toast.warn("Please enter a valid email address");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/resetOtpSent`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Verification code sent to your email");
                    setisloading(false);
                    setisemailpresent(true);
                } else {
                    toast.error("No account found with this email address");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Verification request failed. Check server connection.");
                setisloading(false);
            });
    };

    const verifyprocess = (e) => {
        if (e) e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/verifyResetOtp`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), otp: enteredOtp })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Code verified! Set your new password");
                    setisloading(false);
                    setisemailverified(true);
                } else {
                    setotp(["", "", "", "", "", ""]);
                    toast.error("Invalid or expired verification code");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Verification failed. Check network connection.");
                setisloading(false);
            });
    };

    const resetpasswordsent = (e) => {
        if (e) e.preventDefault();
        const enteredOtp = otp.join("");
        if (newpassword.length < 6) {
            toast.warn("Password must have at least 6 characters");
            return;
        }
        if (newpassword !== confirmpassword) {
            toast.warn("Passwords do not match");
            return;
        }
        setisloading(true);
        fetch(`${backendURL}/resetPassword`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.trim(),
                otp: enteredOtp,
                password: newpassword
            })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Password changed successfully! Please log in.");
                    setisloading(false);
                    setotp(["", "", "", "", "", ""]);
                    setemail("");
                    setnewpassword("");
                    setisemailverified(false);
                    setisemailpresent(false);
                    setshowpass(false);
                    setconfirmpassword("");
                    setshowconfirmpass(false);
                    navigate("/login");
                } else {
                    toast.error("Unable to reset password. Please try again.");
                    setisloading(false);
                }
            })
            .catch(() => {
                toast.error("Resetting failed. Check network connection.");
                setisloading(false);
            });
    };

    // Calculate current step number (1, 2, or 3)
    const currentStep = isemailverified ? 3 : isemailpresent ? 2 : 1;

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
                <Link to="/login" className={Styles.navLoginBtn}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back to Login</span>
                </Link>
            </nav>

            <div className={Styles.cardContainer}>
                <div className={Styles.cardAccent}></div>

                {/* Progress Stepper */}
                <div className={Styles.stepper}>
                    <div className={`${Styles.stepItem} ${currentStep === 1 ? Styles.stepActive : Styles.stepCompleted}`}>
                        <div className={Styles.stepCircle}>
                            {currentStep > 1 ? <i className="fa-solid fa-check"></i> : "1"}
                        </div>
                        <span className={Styles.stepLabel}>Email</span>
                    </div>

                    <div className={`${Styles.stepLine} ${currentStep >= 2 ? Styles.stepLineActive : ""}`}></div>

                    <div className={`${Styles.stepItem} ${currentStep === 2 ? Styles.stepActive : currentStep > 2 ? Styles.stepCompleted : ""}`}>
                        <div className={Styles.stepCircle}>
                            {currentStep > 2 ? <i className="fa-solid fa-check"></i> : "2"}
                        </div>
                        <span className={Styles.stepLabel}>Verify OTP</span>
                    </div>

                    <div className={`${Styles.stepLine} ${currentStep >= 3 ? Styles.stepLineActive : ""}`}></div>

                    <div className={`${Styles.stepItem} ${currentStep === 3 ? Styles.stepActive : ""}`}>
                        <div className={Styles.stepCircle}>3</div>
                        <span className={Styles.stepLabel}>New Password</span>
                    </div>
                </div>

                {/* Step 1: Request OTP via Email */}
                {currentStep === 1 && (
                    <>
                        <div className={Styles.cardHeader}>
                            <div className={Styles.headerIconBadge}>
                                <i className="fa-solid fa-key"></i>
                            </div>
                            <h1>Forgot Password</h1>
                            <p>Enter your registered email address and we'll send you a 6-digit recovery code.</p>
                        </div>

                        <form className={Styles.form} onSubmit={verifyemail} noValidate>
                            <div className={Styles.inputGroup}>
                                <label className={Styles.inputLabel} htmlFor="reset-email">
                                    Email Address
                                </label>
                                <div className={Styles.inputWrapper}>
                                    <i className={`fa-solid fa-envelope ${Styles.fieldIcon}`}></i>
                                    <input
                                        className={Styles.formInput}
                                        onChange={(e) => setemail(e.target.value)}
                                        type="email"
                                        name="email"
                                        id="reset-email"
                                        autoComplete="email"
                                        value={email}
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={Styles.submitBtn}
                                disabled={isloading}
                            >
                                {isloading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>Sending Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Recovery Code</span>
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={Styles.backRow}>
                            <Link to="/login" className={Styles.backBtn}>
                                <i className="fa-solid fa-arrow-left"></i>
                                <span>Remember your password? Sign in</span>
                            </Link>
                        </div>
                    </>
                )}

                {/* Step 2: Verify OTP */}
                {currentStep === 2 && (
                    <>
                        <div className={Styles.cardHeader}>
                            <div className={Styles.headerIconBadge}>
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>
                            <h1>Enter Security Code</h1>
                            <p>
                                We've sent a 6-digit code to{" "}
                                <span className={Styles.highlightEmail}>{email}</span>
                            </p>
                        </div>

                        <form className={Styles.form} onSubmit={verifyprocess} noValidate>
                            <div className={Styles.otpRow} onPaste={handleOtpPaste}>
                                {otp.map((value, index) => (
                                    <input
                                        key={index}
                                        id={`reset-otp-${index}`}
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
                                type="submit"
                                className={Styles.submitBtn}
                                disabled={isloading}
                            >
                                {isloading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>Verifying Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify Code</span>
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={Styles.backRow}>
                            <button
                                type="button"
                                className={Styles.backBtn}
                                onClick={() => {
                                    setisemailpresent(false);
                                    setotp(["", "", "", "", "", ""]);
                                }}
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                                <span>Change Email</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Enter New Password */}
                {currentStep === 3 && (
                    <>
                        <div className={Styles.cardHeader}>
                            <div className={Styles.headerIconBadge}>
                                <i className="fa-solid fa-lock-open"></i>
                            </div>
                            <h1>Set New Password</h1>
                            <p>Create a secure password with at least 6 characters.</p>
                        </div>

                        <form className={Styles.form} onSubmit={resetpasswordsent} noValidate>
                            <div className={Styles.inputGroup}>
                                <label className={Styles.inputLabel} htmlFor="reset-newpassword">
                                    New Password
                                </label>
                                <div className={Styles.inputWrapper}>
                                    <i className={`fa-solid fa-lock ${Styles.fieldIcon}`}></i>
                                    <input
                                        type={showpass ? "text" : "password"}
                                        className={`${Styles.formInput} ${Styles.passInput}`}
                                        onChange={(e) => setnewpassword(e.target.value)}
                                        name="newpassword"
                                        id="reset-newpassword"
                                        autoComplete="new-password"
                                        placeholder="At least 6 characters"
                                        value={newpassword}
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

                            <div className={Styles.inputGroup}>
                                <label className={Styles.inputLabel} htmlFor="reset-confirmpassword">
                                    Confirm New Password
                                </label>
                                <div className={Styles.inputWrapper}>
                                    <i className={`fa-solid fa-shield-halved ${Styles.fieldIcon}`}></i>
                                    <input
                                        type={showconfirmpass ? "text" : "password"}
                                        className={`${Styles.formInput} ${Styles.passInput}`}
                                        onChange={(e) => setconfirmpassword(e.target.value)}
                                        name="confirmpassword"
                                        id="reset-confirmpassword"
                                        autoComplete="new-password"
                                        placeholder="Repeat new password"
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

                            <button
                                type="submit"
                                className={Styles.submitBtn}
                                disabled={isloading}
                            >
                                {isloading ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        <span>Updating Password...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-circle-check"></i>
                                        <span>Reset Password</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={Styles.backRow}>
                            <Link to="/login" className={Styles.backBtn}>
                                <i className="fa-solid fa-arrow-left"></i>
                                <span>Cancel and return to Login</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Forgotpassword;