//==============================================================================
// Form state save/reset functionality
//==============================================================================

function saveFormData() {
    const form = document.querySelector('form');
    const formData = {};

    // Loop through all form elements
    Array.from(form.elements).forEach((element) => {
        if (element.name) {
            if (element.type === 'radio') {
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else if (element.type === 'checkbox') {
                formData[element.name] = element.checked;
            } else if (element.tagName === 'SELECT') {
                formData[element.name] = Array.from(element.options)
                    .filter(option => option.selected)
                    .map(option => option.value);
            } else {
                formData[element.name] = element.value;
            }
        }
    });

    // Save to localStorage
    localStorage.setItem('savedFormData', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('savedFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        const form = document.querySelector('form');

        // Loop through saved data and set form values
        Object.keys(formData).forEach((key) => {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'radio') {
                    const radio = Array.from(form.elements[key]).find(radio => radio.value === formData[key]);
                    if (radio) radio.checked = true;
                } else if (element.type === 'checkbox') {
                    element.checked = formData[key];
                } else if (element.tagName === 'SELECT') {
                    Array.from(element.options).forEach(option => {
                        option.selected = formData[key].includes(option.value);
                    });
                } else {
                    element.value = formData[key];
                }
            }
        });
    }
}

function resetForm() {
    if (confirm("Are you sure you want to reset the form? All data will be lost.")) {
        const form = document.querySelector('form');
        form.reset();
        localStorage.removeItem('savedFormData');
        return true;  // Indicate that the reset was confirmed
    }
    return false;  // Indicate that the reset was cancelled
}

document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    
    const form = document.querySelector('form');
    form.addEventListener('input', saveFormData);
    form.addEventListener('change', saveFormData);

    // Add event listener for the reset link
    const resetLink = document.getElementById('resetFormLink');
    if (resetLink) {
        resetLink.addEventListener('click', (e) => {
            if (!resetForm()) {
                e.preventDefault();  // Only prevent default if reset was cancelled
            }
            // If reset was confirmed, allow the default link action to proceed
        });
    }
});

//==============================================================================
// Character count functionality (jQuery version)
//==============================================================================

$(document).ready(function () {
    function updateCharCount($input) {
        const $charCountWrap = $input.siblings('.lf-char-count');
        const $charCountElement = $charCountWrap.find('.lf-char-count-text');
        if ($charCountElement.length === 0) return;

        const charCount = $input.val().length;
        const minChar = parseInt($input.attr('min-char')) || 0;
        const maxChar = parseInt($input.attr('max-char')) || 0;
        const hasLimits = minChar > 0 || maxChar > 0;

        // Construct the character count text based on limits
        let countText = '';
        if (minChar > 0 && maxChar > 0) {
            countText = `${charCount} characters (${minChar} minimum, ${maxChar} maximum)`;
        } else if (minChar > 0) {
            countText = `${charCount}/${minChar} characters minimum`;
        } else if (maxChar > 0) {
            countText = `${charCount}/${maxChar} characters maximum`;
        } else {
            countText = `${charCount} character${charCount !== 1 ? 's' : ''}`;
        }

        $charCountElement.text(countText);
        
        // Set color based on validity
        if (hasLimits) {
            let isValid = true;
            if (minChar > 0 && maxChar > 0) {
                isValid = charCount >= minChar && charCount <= maxChar;
            } else if (minChar > 0) {
                isValid = charCount >= minChar;
            } else if (maxChar > 0) {
                isValid = charCount <= maxChar;
            }
            $charCountElement.css('color', isValid ? '#5ca668' : '#e65c5c');
        } else {
            $charCountElement.css('color', '');
        }
    }

    // Initialize character count for all relevant inputs
    $('input[type="text"], textarea').each(function() {
        const $input = $(this);
        const $charCountWrap = $input.siblings('.lf-char-count');
        if ($charCountWrap.length > 0) {
            $input.on('input', function() {
                updateCharCount($input);
            });
            updateCharCount($input); // Initial update
        }
    });
});

//==============================================================================
// Progress bar functionality
//==============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const progressBar = document.querySelector('.lf-progressbar');
    const formSteps = document.querySelectorAll('.lf-form-step');

    function initializeProgressBar() {
        progressBar.innerHTML = '';
        for (let i = 0; i < formSteps.length - 1; i++) {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'lf-progressbar-step';
            progressBar.appendChild(stepDiv);
        }
        updateProgressBar(0);
    }

    function updateProgressBar(currentStep) {
        const progressSteps = progressBar.children;
        for (let i = 0; i < progressSteps.length; i++) {
            progressSteps[i].classList.toggle('lf-progressbar-step-filled', i < currentStep);
        }
    }

    // Listen for step changes and update progress bar
    document.addEventListener('inputflow-event[step-changed]', function (event) {
        const newStepId = event.detail.newStep.id;
        const newStepIndex = Array.from(formSteps).findIndex(step => step.getAttribute('if-id') === newStepId);
        updateProgressBar(newStepIndex);
    });

    initializeProgressBar();
});

//==============================================================================
// Submit button functionality
//==============================================================================

document.addEventListener('DOMContentLoaded', function () {
    const fakeSubmit = document.getElementById('fakeSubmit');
    const realSubmit = document.getElementById('realSubmit');

    if (!fakeSubmit || !realSubmit) return;

    // Create and prepend a loader to the fake submit button
    const loader = document.createElement('div');
    loader.className = 'loader';
    fakeSubmit.prepend(loader);

    fakeSubmit.addEventListener('click', function (e) {
        e.preventDefault();

        if (fakeSubmit.disabled) return;

        // Disable the fake submit button and show the loader
        fakeSubmit.disabled = true;
        loader.style.display = 'inline-block';
        fakeSubmit.querySelector('.button-text').textContent = 'Please wait';

        // Trigger the real submit button click
        realSubmit.click();
    });
});

//==============================================================================
// Button slide functionality
//==============================================================================

$(document).ready(function() {
    $('.slide-button').on('click', function(e) {
        e.preventDefault();
        var $target = $($(this).attr('href'));
        
        if ($target.length) {
            $('html, body').animate({
                scrollTop: $target.offset().top
            }, 1000);
        }
    });
});

//==============================================================================
// Character count functionality (Vanilla JS version)
//==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form_input, .form_input-message');
    function updateCharCount(input) {
        const charCount = input.value.length;
        const minChar = parseInt(input.getAttribute('min-char')) || 0;
        const maxChar = parseInt(input.getAttribute('max-char')) || Infinity;
        const countElement = input.closest('.form_input-wrap').querySelector('.lf-charcount');
        
        let text = '';
        let isValid = true;
        let showEmoji = true;

        // Determine the appropriate text and validity based on character limits
        if (minChar > 0 && maxChar < Infinity) {
            text = `${charCount}/${minChar} characters min. (max. ${maxChar})`;
            isValid = charCount >= minChar && charCount <= maxChar;
        } else if (minChar > 0) {
            text = `${charCount}/${minChar} characters min.`;
            isValid = charCount >= minChar;
        } else if (maxChar < Infinity) {
            text = `${charCount}/${maxChar} characters max.`;
            isValid = charCount <= maxChar;
            showEmoji = charCount > 0; // Only show emoji if there are characters
        } else {
            text = `${charCount} character${charCount !== 1 ? 's' : ''}`;
            showEmoji = false;
        }

        // Add emoji for visual feedback if there are limits and conditions are met
        if ((minChar > 0 || maxChar < Infinity) && showEmoji) {
            const emoji = isValid ? '✅ ' : '❌ ';
            text = emoji + text;
        }

        countElement.textContent = text;
        countElement.classList.remove('lf-charcount-success', 'lf-charcount-error');
        
        if ((minChar > 0 || maxChar < Infinity) && showEmoji) {
            countElement.classList.add(isValid ? 'lf-charcount-success' : 'lf-charcount-error');
        }
    }

    inputs.forEach(input => {
        updateCharCount(input); // Initial update
        input.addEventListener('input', () => updateCharCount(input));
    });
});

//==============================================================================
// Error notification toggle
//==============================================================================

function toggleErrorNotification() {
    const formSteps = document.querySelectorAll('.lf-form-step');
    const errorNotification = document.getElementById('error-notification');

    if (errorNotification) {
        let isAnyErrorVisible = false;
        formSteps.forEach(step => {
            const errorMsgs = step.querySelectorAll('.lf-error-box:not(#error-notification)');

            isAnyErrorVisible = isAnyErrorVisible || Array.from(errorMsgs).some(error => 
                window.getComputedStyle(error).display !== 'none' &&
                window.getComputedStyle(error).opacity !== '0'
            );
        });

        errorNotification.style.display = isAnyErrorVisible ? 'block' : 'none';
    }
}

// Initial check
toggleErrorNotification();

// Set interval to check periodically
const intervalId = setInterval(toggleErrorNotification, 100);

// Clean up interval when the page is about to be unloaded
window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
});
