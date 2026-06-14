import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def send_alert_email(
    recipients: list[str],
    subject: str,
    body: str
) -> bool:
    if not recipients or not settings.smtp_user:
        logger.warning("Email not configured or no recipients — skipping")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_user
        msg["To"] = ", ".join(recipients)

        html = f"""
        <html><body>
          <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <div style="background:#5C2E00;padding:16px 24px;border-radius:8px 8px 0 0">
              <h2 style="color:white;margin:0">☕ FutureKawa — Alerte</h2>
            </div>
            <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;
                        border-top:none;border-radius:0 0 8px 8px">
              <p style="color:#374151;line-height:1.6">{body}</p>
              <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0"/>
              <p style="color:#9ca3af;font-size:12px">
                FutureKawa — Système de suivi des stocks de café vert
              </p>
            </div>
          </div>
        </body></html>
        """

        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, recipients, msg.as_string())

        logger.info(f"Alert email sent to {recipients}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
