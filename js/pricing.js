// Pricing Page JavaScript
class PricingPage {
    constructor() {
        this.currentBilling = 'monthly';
        this.init();
    }
    
    init() {
        this.setupBillingToggle();
        this.setupFAQ();
        this.setupAnimations();
        this.setupSmoothScrolling();
    }
    
    setupBillingToggle() {
        const billingToggle = document.getElementById('billing-toggle');
        const priceElements = document.querySelectorAll('.price-amount[data-monthly][data-yearly]');
        
        if (billingToggle) {
            billingToggle.addEventListener('change', () => {
                this.currentBilling = billingToggle.checked ? 'yearly' : 'monthly';
                this.updatePrices();
                this.updateBillingOptions();
            });
        }
        
        // Update prices on page load
        this.updatePrices();
    }
    
    updatePrices() {
        const priceElements = document.querySelectorAll('.price-amount[data-monthly][data-yearly]');
        
        priceElements.forEach(element => {
            const monthlyPrice = element.getAttribute('data-monthly');
            const yearlyPrice = element.getAttribute('data-yearly');
            
            if (this.currentBilling === 'yearly') {
                element.textContent = yearlyPrice;
            } else {
                element.textContent = monthlyPrice;
            }
        });
    }
    
    updateBillingOptions() {
        const billingOptions = document.querySelectorAll('.billing-option');
        
        billingOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const priceElement = option.querySelector('.option-price');
            const discountElement = option.querySelector('.option-discount');
            
            if (radio.value === 'monthly') {
                if (this.currentBilling === 'monthly') {
                    radio.checked = true;
                    priceElement.textContent = '99,000 сум/месяц';
                    if (discountElement) discountElement.style.display = 'none';
                } else {
                    radio.checked = false;
                    priceElement.textContent = '79,200 сум/месяц';
                    if (discountElement) discountElement.style.display = 'inline-block';
                }
            } else if (radio.value === 'yearly') {
                if (this.currentBilling === 'yearly') {
                    radio.checked = true;
                    priceElement.textContent = '79,200 сум/месяц';
                    if (discountElement) discountElement.style.display = 'inline-block';
                } else {
                    radio.checked = false;
                    priceElement.textContent = '99,000 сум/месяц';
                    if (discountElement) discountElement.style.display = 'none';
                }
            }
        });
    }
    
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                // Close other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }
    
    setupAnimations() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.pricing-card, .payment-card, .faq-item').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize pricing page
document.addEventListener('DOMContentLoaded', () => {
    new PricingPage();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .pricing-card,
    .payment-card,
    .faq-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .pricing-card.animate-in,
    .payment-card.animate-in,
    .faq-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .faq-item {
        transition: all 0.3s ease;
    }
    
    .faq-question {
        transition: background 0.3s ease;
    }
    
    .faq-answer {
        transition: all 0.3s ease;
    }
    
    .billing-option {
        transition: all 0.3s ease;
    }
    
    .billing-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .payment-card {
        transition: all 0.3s ease;
    }
    
    .payment-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    /* Switch animation */
    .switch {
        transition: all 0.3s ease;
    }
    
    .slider {
        transition: 0.4s;
    }
    
    .slider:before {
        transition: 0.4s;
    }
    
    /* Price animation */
    .price-amount {
        transition: all 0.3s ease;
    }
    
    /* Discount badge animation */
    .option-discount {
        transition: all 0.3s ease;
    }
    
    /* Responsive animations */
    @media (max-width: 768px) {
        .pricing-card,
        .payment-card,
        .faq-item {
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style); 