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
    if not recipients:
        logger.warning("No recipients — skipping email")
        return False

    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured — skipping email")
        logger.info(f"Would have sent to {recipients}: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"FutureKawa Alerts <{settings.smtp_user}>"
        msg["To"] = ", ".join(recipients)

        # Corps texte
        text_body = f"""
FutureKawa — Système de surveillance des stocks
================================================

{body}

================================================
Ceci est un message automatique.
Ne pas répondre à cet email.
        """

        # Corps HTML
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px">
  <div style="max-width:600px;margin:auto;background:white;
              border-radius:12px;overflow:hidden;
              box-shadow:0 2px 8px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#5C2E00;padding:20px 28px">
      <h1 style="color:white;margin:0;font-size:20px">
        ☕ FutureKawa — Alerte
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:28px">
      <div style="background:#FEF3C7;border:1px solid #F59E0B;
                  border-radius:8px;padding:16px;margin-bottom:20px">
        <p style="margin:0;color:#92400E;font-weight:bold">
          ⚠️ Alerte détectée
        </p>
      </div>

      <p style="color:#374151;line-height:1.6;font-size:15px">
        {body}
      </p>

      <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0"/>

      <div style="background:#F9FAFB;border-radius:8px;padding:16px">
        <p style="margin:0;color:#6B7280;font-size:13px">
          Action requise : veuillez vérifier les conditions de stockage
          et prendre les mesures nécessaires.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F3F4F6;padding:16px 28px">
      <p style="margin:0;color:#9CA3AF;font-size:12px">
        FutureKawa — Système de suivi des stocks de café vert<br>
        Ceci est un message automatique généré par le système de surveillance.
      </p>
    </div>
  </div>
</body>
</html>
        """

        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(
                settings.smtp_user,
                recipients,
                msg.as_string()
            )

        logger.info(f"Alert email sent to {recipients} — {subject}")
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed — check credentials")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"SMTP error: {e}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False
