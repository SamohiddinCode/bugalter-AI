// Notifications module for Bugalter AI
// This is a mock implementation for development

const sendVerificationCode = async (email, code, userName) => {
    console.log(`📧 Mock: Verification code ${code} sent to ${email} for user ${userName}`);
    
    // In a real implementation, this would send an email
    // For now, we'll just return success
    return {
        success: true,
        message: 'Verification code sent successfully',
        code: code // For development, we return the code
    };
};

const sendResendCode = async (email, code, userName) => {
    console.log(`📧 Mock: Resend code ${code} sent to ${email} for user ${userName}`);
    
    // In a real implementation, this would send an email
    // For now, we'll just return success
    return {
        success: true,
        message: 'Verification code resent successfully',
        code: code // For development, we return the code
    };
};

module.exports = {
    sendVerificationCode,
    sendResendCode
}; 