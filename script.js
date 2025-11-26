// 1. THEME TOGGLE LOGIC
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check if user previously selected dark mode
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});

// 2. EMAILJS INTEGRATION
(function() {
    // YOUR PUBLIC KEY
    emailjs.init("E_48mXM4VNF5b2dzS"); 
})();

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const btn = this.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = 'Sending...';

    // YOUR SERVICE & TEMPLATE IDs
    const serviceID = 'service_cdlgf2v'; 
    const templateID = 'template_e2p5657';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            btn.innerText = 'Sent!';
            alert('Message sent successfully!');
            document.getElementById('contact-form').reset();
            setTimeout(() => btn.innerText = originalText, 2000);
        }, (err) => {
            btn.innerText = originalText;
            alert(JSON.stringify(err));
        });
});