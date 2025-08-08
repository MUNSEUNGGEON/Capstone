import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_CONFIG, SMTP_SETTINGS

def send_email(receiver_email, subject, html_content):
    """이메일 전송 함수"""
    sender_email = EMAIL_CONFIG['sender_email']
    sender_password = EMAIL_CONFIG['sender_password']
    email_provider = EMAIL_CONFIG['email_provider']
    
    # 제공자 설정 가져오기 (지원하지 않는 경우 Gmail 사용)
    smtp_config = SMTP_SETTINGS.get(email_provider, SMTP_SETTINGS["gmail"])
    
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email
    
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    try:
        if smtp_config["use_ssl"]:
            server = smtplib.SMTP_SSL(smtp_config["host"], smtp_config["port"])
        else:
            server = smtplib.SMTP(smtp_config["host"], smtp_config["port"])
            server.starttls()
            
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"이메일 전송 오류: {str(e)}")
        return False 