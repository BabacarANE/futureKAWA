import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _build_html(subject: str, body: str) -> str:
    is_expired = "expiré" in subject.lower()
    accent = "#D97706" if is_expired else "#DC2626"
    icon   = "📦" if is_expired else "⚠️"
    label  = "Lot expiré" if is_expired else "Conditions hors seuil"

    # Convert plain newlines to <br> for HTML display
    body_html = body.replace("\n", "<br>")

    return f"""
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;
              border-radius:12px;overflow:hidden;
              box-shadow:0 1px 3px rgba(0,0,0,.12)">

    <!-- Header -->
    <div style="background:#3B1E08;padding:20px 28px;display:flex;align-items:center;gap:12px">
      <span style="font-size:28px">{icon}</span>
      <div>
        <p style="margin:0;color:#F5DEB3;font-size:11px;letter-spacing:.08em;
                  text-transform:uppercase">FutureKawa</p>
        <h1 style="margin:4px 0 0;color:#ffffff;font-size:20px">{label}</h1>
      </div>
    </div>

    <!-- Badge -->
    <div style="background:{accent};padding:8px 28px">
      <p style="margin:0;color:white;font-size:13px;font-weight:600">
        Action requise — vérifiez les conditions de l'entrepôt
      </p>
    </div>

    <!-- Body -->
    <div style="padding:28px">
      <div style="background:#fef9f0;border-left:4px solid {accent};
                  border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.8">
          {body_html}
        </p>
      </div>

      <p style="margin:0 0 8px;color:#6b7280;font-size:13px">
        Ce message a été envoyé automatiquement par le système de surveillance IoT
        de FutureKawa. Ne pas répondre à cet email.
      </p>
      <p style="margin:0;color:#9ca3af;font-size:12px">
        Fréquence maximale : 1 alerte par entrepôt toutes les 30 minutes.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;padding:14px 28px;border-top:1px solid #e5e7eb">
      <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center">
        ☕ FutureKawa — Système de suivi des stocks de café vert
      </p>
    </div>
  </div>
</body>
</html>
"""


def send_alert_email(
    recipients: list[str],
    subject: str,
    body: str
) -> bool:
    if not recipients or not settings.smtp_user:
        logger.warning(
            "Email non configuré ou aucun destinataire — envoi ignoré. "
            "Définissez SMTP_USER et SMTP_PASSWORD dans le .env"
        )
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"FutureKawa Alertes <{settings.smtp_user}>"
        msg["To"] = ", ".join(recipients)

        msg.attach(MIMEText(body, "plain", "utf-8"))
        msg.attach(MIMEText(_build_html(subject, body), "html", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, recipients, msg.as_string())

        logger.info(f"Email d'alerte envoyé à {recipients} — sujet : {subject}")
        return True

    except Exception as e:
        logger.error(f"Échec de l'envoi email ({recipients}): {e}")
        return False
