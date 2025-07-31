const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Email Configuration
const createEmailTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }
    
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Telegram Bot Configuration
let telegramBot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
    telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

// Email Templates
const emailTemplates = {
    verificationCode: (firstName, code) => ({
        subject: 'Bugalter AI - Код подтверждения',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Bugalter AI</h1>
                        <p style="color: #6b7280; margin: 5px 0;">Умная бухгалтерия</p>
                    </div>
                    
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Код подтверждения</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Здравствуйте, <strong>${firstName}</strong>!
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Ваш код подтверждения для регистрации в Bugalter AI:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px;">${code}</span>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                        ⏰ Код действителен в течение 10 минут
                    </p>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                            🔒 Если вы не регистрировались в Bugalter AI, проигнорируйте это письмо
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <div style="text-align: center; color: #6b7280; font-size: 12px;">
                        <p style="margin: 0;">
                            Bugalter AI - Умная бухгалтерия для бизнеса<br>
                            © 2024 Bugalter AI. Все права защищены.
                        </p>
                    </div>
                </div>
            </div>
        `
    }),
    
    resendCode: (firstName, code) => ({
        subject: 'Bugalter AI - Новый код подтверждения',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #3b82f6; margin: 0; font-size: 28px;">Bugalter AI</h1>
                        <p style="color: #6b7280; margin: 5px 0;">Умная бухгалтерия</p>
                    </div>
                    
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Новый код подтверждения</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        Здравствуйте, <strong>${firstName}</strong>!
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                        По вашему запросу был отправлен новый код подтверждения:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px;">${code}</span>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                        ⏰ Код действителен в течение 10 минут
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <div style="text-align: center; color: #6b7280; font-size: 12px;">
                        <p style="margin: 0;">
                            Bugalter AI - Умная бухгалтерия для бизнеса<br>
                            © 2024 Bugalter AI. Все права защищены.
                        </p>
                    </div>
                </div>
            </div>
        `
    })
};

// Telegram Templates
const telegramTemplates = {
    verificationCode: (firstName, code) => `
🔐 *Bugalter AI - Код подтверждения*

Здравствуйте, ${firstName}!

Ваш код подтверждения для регистрации в Bugalter AI:

*${code}*

⏰ Код действителен в течение 10 минут

🔒 Если вы не регистрировались в Bugalter AI, проигнорируйте это сообщение.

---
Bugalter AI - Умная бухгалтерия для бизнеса
    `,
    
    resendCode: (firstName, code) => `
🔄 *Bugalter AI - Новый код подтверждения*

Здравствуйте, ${firstName}!

По вашему запросу был отправлен новый код подтверждения:

*${code}*

⏰ Код действителен в течение 10 минут

---
Bugalter AI - Умная бухгалтерия для бизнеса
    `
};

// Send Email Function
const sendEmail = async (to, template, data) => {
    try {
        const transporter = createEmailTransporter();
        if (!transporter) {
            console.log('📧 Email not configured, using mock');
            return { success: true, mock: true };
        }
        
        const emailTemplate = emailTemplates[template](data.firstName, data.code);
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@bugalter-ai.com',
            to: to,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully to:', to);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('📧 Email sending error:', error);
        return { success: false, error: error.message };
    }
};

// Send Telegram Message Function
const sendTelegramMessage = async (chatId, template, data) => {
    try {
        if (!telegramBot) {
            console.log('🤖 Telegram bot not configured');
            return { success: false, error: 'Telegram bot not configured' };
        }
        
        const messageTemplate = telegramTemplates[template](data.firstName, data.code);
        
        const result = await telegramBot.sendMessage(chatId, messageTemplate, {
            parse_mode: 'Markdown'
        });
        
        console.log('🤖 Telegram message sent successfully to:', chatId);
        return { success: true, messageId: result.message_id };
    } catch (error) {
        console.error('🤖 Telegram sending error:', error);
        return { success: false, error: error.message };
    }
};

// Send Verification Code (Email + Telegram)
const sendVerificationCode = async (email, firstName, code, telegramChatId = null) => {
    const results = {
        email: null,
        telegram: null
    };
    
    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        results.email = await sendEmail(email, 'verificationCode', { firstName, code });
    } else {
        console.log('📧 Email not configured, using mock');
        results.email = { success: true, mock: true };
    }
    
    // Send Telegram message
    if (telegramChatId && telegramBot) {
        results.telegram = await sendTelegramMessage(telegramChatId, 'verificationCode', { firstName, code });
    }
    
    return results;
};

// Send Resend Code (Email + Telegram)
const sendResendCode = async (email, firstName, code, telegramChatId = null) => {
    const results = {
        email: null,
        telegram: null
    };
    
    // Send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        results.email = await sendEmail(email, 'resendCode', { firstName, code });
    } else {
        console.log('📧 Email not configured, using mock');
        results.email = { success: true, mock: true };
    }
    
    // Send Telegram message
    if (telegramChatId && telegramBot) {
        results.telegram = await sendTelegramMessage(telegramChatId, 'resendCode', { firstName, code });
    }
    
    return results;
};

module.exports = {
    sendVerificationCode,
    sendResendCode,
    sendEmail,
    sendTelegramMessage
}; 