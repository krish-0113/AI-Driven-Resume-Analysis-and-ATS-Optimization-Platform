import React from "react";

const GoogleButton = ({ onClick, disabled }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    window.location.href = `${window.location.protocol}//${window.location.host}/oauth2/authorization/google`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="googleAuthBtn"
      style={{
        userSelect: "none",
        WebkitAppearance: "none",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        borderRadius: "14px",
        boxSizing: "border-box",
        width: "100%",
        color: "#f1f5f9",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "14.5px",
        fontWeight: 600,
        height: "46px",
        outline: "none",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
          e.currentTarget.style.borderColor = "rgba(96, 239, 255, 0.35)";
          e.currentTarget.style.transform = "translateY(-1.5px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.35)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.25)";
        }
      }}
    >
      <div style={{ width: "20px", height: "20px", minWidth: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          viewBox="0 0 48 48"
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
      </div>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleButton;
