document.addEventListener('DOMContentLoaded', () => {
    emailjs.init('g9OiYNbf42d7ROmmN');

    const form = document.querySelector('form');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    form.parentElement.insertBefore(errorDiv, form);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        // Get form values
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const subject = form.subject.value.trim();

        // Validation
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name) {
            showError(form.name, 'Name is required');
            isValid = false;
        }

        if (!email || !emailRegex.test(email)) {
            showError(form.email, 'Valid email is required');
            isValid = false;
        }

        if (!phone || phone.length < 10) {
            showError(form.phone, 'Valid phone number is required');
            isValid = false;
        }

        if (!subject) {
            showError(form.subject, 'Subject is required');
            isValid = false;
        }

        if (isValid) {
            // Show loading state
            form.submit.disabled = true;
            form.submit.innerHTML = 'Sending...';

            // Send email
            emailjs.sendForm('Gmail Mailing System', 'Contact', form)
                .then(() => {
                    showSuccess('Message sent successfully!');
                    form.reset();
                })
                .catch((error) => {
                    showError(null, 'Error sending message. Please try again later.');
                    console.error('Email send error:', error);
                })
                .finally(() => {
                    form.submit.disabled = false;
                    form.submit.innerHTML = 'Submit';
                });
        }
    });

    function showError(input, message) {
        if (input) {
            input.classList.add('error');
            const errorElement = document.createElement('small');
            errorElement.className = 'error-text';
            errorElement.textContent = message;
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-text').forEach(el => el.remove());
        errorDiv.style.display = 'none';
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.parentElement.insertBefore(successDiv, form);
        setTimeout(() => successDiv.remove(), 5000);
    }
});

const questions = document.querySelectorAll('.question-Container')

questions.forEach(question => {
    question.addEventListener('click',showQuestion)
})


function showQuestion(event){
    let questionContainer = event.target.closest('.question-Container');
    let verticalLine = questionContainer.querySelector('#vertical-line');
    
    if(questionContainer.style.height === '15vh' || !questionContainer.style.height) {
        questionContainer.style.height = `${questionContainer.scrollHeight}px`;
        verticalLine.style.transform = 'rotate(90deg)';
    } else {
        questionContainer.style.height = '15vh';
        verticalLine.style.transform = 'rotate(0deg)';
    }
}