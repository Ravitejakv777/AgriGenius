import os
import smtplib
import secrets
import time
from typing import Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# SMTP Configuration from .env
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "").strip() or SMTP_USER or "noreply@agrigenius.app"
SMTP_FROM_NAME = os.environ.get("SMTP_FROM_NAME", "AgriGenius Platform").strip()

# In-memory OTP storage: { email: { "code": str, "expires_at": float, "verified": bool } }
_otp_store: Dict[str, Dict[str, Any]] = {}

def generate_otp() -> str:
    """Generate secure 6-digit numeric OTP."""
    return str(secrets.randbelow(900000) + 100000)

def store_otp(email: str, code: str, validity_seconds: int = 600) -> None:
    """Store OTP with 10-minute expiry."""
    clean_email = email.strip().lower()
    _otp_store[clean_email] = {
        "code": code,
        "expires_at": time.time() + validity_seconds,
        "verified": False
    }

def verify_otp_code(email: str, code: str) -> bool:
    """Verify submitted OTP code for an email."""
    clean_email = email.strip().lower()
    entry = _otp_store.get(clean_email)
    if not entry:
        return False
    if time.time() > entry["expires_at"]:
        _otp_store.pop(clean_email, None)
        return False
    if entry["code"] == code.strip():
        entry["verified"] = True
        return True
    return False

def _get_smtp_config():
    load_dotenv(override=True)
    host = os.environ.get("SMTP_HOST", "").strip()
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER", "").strip()
    # Remove any whitespace from Google app passwords like 'abcd efgh ijkl mnop'
    password = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")
    from_email = os.environ.get("SMTP_FROM_EMAIL", "").strip() or user or "noreply@agrigenius.app"
    from_name = os.environ.get("SMTP_FROM_NAME", "AgriGenius Platform").strip()
    return host, port, user, password, from_email, from_name

def _send_email_smtp(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Send email via SMTP if credentials are configured, or log fallback."""
    host, port, user, password, from_email, from_name = _get_smtp_config()
    
    if not host or not user or not password:
        print(f"[Email Service] SMTP not configured in .env. Simulated sending '{subject}' to {to_email}")
        print(f"[Email Service] TIP: Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env to deliver real emails to inbox.")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{from_email}>"
        msg["To"] = to_email

        part1 = MIMEText(text_body, "plain", "utf-8")
        part2 = MIMEText(html_body, "html", "utf-8")
        msg.attach(part1)
        msg.attach(part2)

        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=12)
        else:
            server = smtplib.SMTP(host, port, timeout=12)
            server.starttls()

        server.login(user, password)
        server.sendmail(from_email, [to_email], msg.as_string())
        server.quit()
        print(f"[Email Service] Real email sent successfully to {to_email} via {host}")
        return True
    except Exception as e:
        print(f"[Email Service] SMTP delivery failed to {to_email}: {e}")
        return False

def send_otp_email(to_email: str, code: str) -> bool:
    """Send a verification code email to user."""
    subject = f"{code} is your AgriGenius verification code"
    text_body = f"""Hello,

Your verification code for AgriGenius is: {code}

This code is valid for 10 minutes. Please enter this code on the verification screen to proceed.

If you did not request this code, you can safely ignore this email.

Best regards,
The AgriGenius Team
National Agricultural AI Advisory Platform
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your AgriGenius Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background-color: #059669; padding: 28px 24px; text-align: center;">
      <div style="display: inline-block; background-color: #ffffff; color: #059669; width: 44px; height: 44px; border-radius: 12px; line-height: 44px; font-size: 22px; font-weight: bold; margin-bottom: 8px;">
        🌱
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">AgriGenius</h1>
      <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">National Agricultural AI Advisory Platform</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px; color: #1e293b;">
      <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #0f172a;">Verify your email address</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
        Please enter the verification code below to verify your email address and continue with your AgriGenius account setup.
      </p>

      <!-- OTP Code Box -->
      <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="display: block; font-size: 11px; text-transform: uppercase; font-family: monospace; font-weight: 700; color: #15803d; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit Code</span>
        <span style="font-size: 34px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #166534; display: inline-block;">{code}</span>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
        ⏱️ This code will expire in <strong>10 minutes</strong>. For security, never share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0;">© 2026 AgriGenius — Supporting Indian Agriculture with AI</p>
    </div>

  </div>
</body>
</html>"""

    return _send_email_smtp(to_email, subject, html_body, text_body)

def send_welcome_email(to_email: str, name: str, role: str = "farmer") -> bool:
    """Send welcome and confirmation email upon successful account creation."""
    subject = f"Welcome to AgriGenius, {name}! 🌱"
    role_display = role.capitalize()
    
    text_body = f"""Hello {name},

Welcome to AgriGenius — your national AI-powered agricultural advisory platform!

Your account has been successfully created:
• Email: {to_email}
• Role: {role_display}

What you can do with AgriGenius:
1. AI Crop Advisory: Ask questions in English, Telugu, Hindi, and regional languages.
2. Verified Knowledge Base: Get recommendations backed by agricultural university research.
3. Disease & Pest Diagnosis: Get instant recommendations for treatments.

Sign in anytime at: http://localhost:5173/auth

Best regards,
The AgriGenius Team
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to AgriGenius</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background-color: #059669; padding: 28px 24px; text-align: center;">
      <div style="display: inline-block; background-color: #ffffff; color: #059669; width: 44px; height: 44px; border-radius: 12px; line-height: 44px; font-size: 22px; font-weight: bold; margin-bottom: 8px;">
        🌱
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Welcome to AgriGenius!</h1>
      <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 12px; font-family: monospace;">Your Account has been Created Successfully</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 28px; color: #1e293b;">
      <h2 style="font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 8px; color: #0f172a;">Namaste, {name}! 🙏</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        We are thrilled to welcome you to <strong>AgriGenius</strong>. Your account has been securely stored in our verified database.
      </p>

      <!-- Account Summary Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;">
        <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
          <strong>Account Email:</strong> <span style="font-family: monospace; color: #0f172a;">{to_email}</span>
        </div>
        <div style="font-size: 12px; color: #64748b;">
          <strong>Designated Role:</strong> <span style="display: inline-block; background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">{role_display}</span>
        </div>
      </div>

      <!-- Key Capabilities -->
      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">Here is how AgriGenius empowers your farm:</h3>
      <ul style="font-size: 13px; color: #475569; line-height: 1.8; padding-left: 20px; margin-bottom: 26px;">
        <li><strong>AI Advisory:</strong> Ask natural questions in Telugu, Hindi, or English.</li>
        <li><strong>Verified Science:</strong> Research-backed crop solutions and nutrient guidance.</li>
        <li><strong>Fast Diagnostics:</strong> Immediate insights on weather patterns and pest protection.</li>
      </ul>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 10px;">
        <a href="http://localhost:5173" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">
          Open AgriGenius Platform →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
      <p style="margin: 0;">© 2026 AgriGenius — Supporting Indian Agriculture with AI</p>
    </div>

  </div>
</body>
</html>"""

    return _send_email_smtp(to_email, subject, html_body, text_body)
