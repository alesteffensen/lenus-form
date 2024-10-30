//==============================================================================
// Form State Save/Reset Functionality
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

function findClosestParent(element, selector) {
  let el = element;
  while (el) {
    if (el.matches && el.matches(selector)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function updateSliderVisuals() {
  const form = document.querySelector('form');
  form.querySelectorAll('[if-lib="rangeslider-wrapper"]').forEach(wrapper => {
    const inputs = wrapper.querySelectorAll('[if-lib="rangeslider-value-input"]');
    const trackFill = wrapper.querySelector('[if-lib="rangeslider-track-fill"]');
    const handles = wrapper.querySelectorAll('[if-lib="rangeslider-handle"]');
    const displayValues = wrapper.querySelectorAll('[if-lib="rangeslider-value-display"]');

    if (inputs.length === 1) {
      // Single handle slider
      const value = Number(inputs[0].value);
      const min = Number(wrapper.getAttribute('if-lib-min'));
      const max = Number(wrapper.getAttribute('if-lib-max'));
      const percentage = ((value - min) / (max - min)) * 100;
      
      // Update track fill
      if (trackFill) {
        trackFill.style.left = '0px';
        trackFill.style.right = `calc(100% - ${percentage}%)`;
      }
      
      // Update handle position
      if (handles[0]) {
        handles[0].style.left = `calc(${percentage}% + 0px)`;
      }

      // Update display value
      if (displayValues[0]) {
        displayValues[0].textContent = value.toLocaleString();
      }
    } else if (inputs.length === 2) {
      // Double handle slider
      const minValue = Number(inputs[0].value);
      const maxValue = Number(inputs[1].value);
      const min = Number(wrapper.getAttribute('if-lib-min'));
      const max = Number(wrapper.getAttribute('if-lib-max'));
      const minPercentage = ((minValue - min) / (max - min)) * 100;
      const maxPercentage = ((maxValue - min) / (max - min)) * 100;
      
      // Update track fill
      if (trackFill) {
        trackFill.style.left = `${minPercentage}%`;
        trackFill.style.right = `${100 - maxPercentage}%`;
      }
      
      // Update handle positions
      if (handles[0]) handles[0].style.left = `calc(${minPercentage}%)`;
      if (handles[1]) handles[1].style.left = `calc(${maxPercentage}%)`;

      // Update display values
      if (displayValues[0]) displayValues[0].textContent = minValue.toLocaleString();
      if (displayValues[1]) displayValues[1].textContent = maxValue.toLocaleString();
    }
  });
}

function loadFormData() {
  const savedData = localStorage.getItem('savedFormData');
  if (savedData) {
    const formData = JSON.parse(savedData);
    const form = document.querySelector('form');

    // First set all the values
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

    // Handle checkbox/radio styling
    form.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked').forEach(input => {
      const parentLabel = findClosestParent(input, 'label');
      if (!parentLabel) return;

      // Handle all Inputflow variants
      const isCheckbox = parentLabel.classList.contains('if-lib-tagcheckbox1_field');
      const isRadio = parentLabel.classList.contains('if-lib-tagradio1_field');
      
      if (isCheckbox || isRadio) {
        // Add classes to parent label
        parentLabel.classList.add('is-checked', 'is-active');
        
        // Find and update the icon div - handle both checkbox and radio variants
        const iconDiv = parentLabel.querySelector('.w-checkbox-input, .w-radio-input');
        if (iconDiv) {
          iconDiv.classList.add('is-checked', 'is-active', 'w--redirected-checked');
        }
        
        // Add classes to input
        input.classList.add('is-checked', 'is-active');
        
        // Add classes to label text - handle both checkbox and radio variants
        const labelSpan = parentLabel.querySelector('.w-form-label');
        if (labelSpan) {
          labelSpan.classList.add('is-checked', 'is-active');
        }
      }
    });

    // Initial update of slider visuals
    updateSliderVisuals();
  }
}

function resetForm(showConfirmation = true) {
  if (!showConfirmation || confirm("Are you sure you want to reset the form? All data will be lost.")) {
    const form = document.querySelector('form');
    
    // Reset all regular form elements
    form.reset();
    
    // Reset range sliders to their initial values and update visuals
    form.querySelectorAll('[if-lib="rangeslider-wrapper"]').forEach(wrapper => {
      const initialValue = wrapper.getAttribute('if-lib-initialvalue');
      const inputs = wrapper.querySelectorAll('[if-lib="rangeslider-value-input"]');
      
      if (initialValue && initialValue.includes(',')) {
        // Double handle slider
        const [min, max] = initialValue.split(',');
        if (inputs[0]) {
          inputs[0].value = min;
        }
        if (inputs[1]) {
          inputs[1].value = max;
        }
      } else {
        // Single handle slider
        if (inputs[0]) {
          inputs[0].value = initialValue || '0';
        }
      }
    });
    
    // Update visuals after reset
    updateSliderVisuals();

    localStorage.removeItem('savedFormData');
    return true;
  }
  return false;
}

//==============================================================================
// Form Input Label Animation
//==============================================================================

$(document).ready(function () {
  function updateLabelVisibility($input) {
    var $label = $input.siblings('.form_input-label');
    var hasValue = $input.val() !== '';
    var isFocused = $input.is(":focus");

    // Toggle the 'focus-in' class based on input state
    $label.toggleClass('focus-in', hasValue || isFocused);

    // Update placeholder based on input state
    if (!hasValue && !isFocused) {
      $input.attr('placeholder', $input.data('original-placeholder'));
    } else if (isFocused) {
      $input.attr('placeholder', '');
    }
  }

  // Handle focus events on inputs and textareas using event delegation
  $('.lf-form-step').on('focusin focusout input', '.form_input, .form_input-message', function() {
    updateLabelVisibility($(this));
  });

  // Initialize label visibility and store original placeholders for inputs and textareas
  $('.form_input, .form_input-message').each(function () {
    var $input = $(this);
    $input.data('original-placeholder', $input.attr('placeholder'));
    updateLabelVisibility($input);
  });
});

//==============================================================================
// Show/Hide Content Functionality
//==============================================================================

function initShowHideContent() {
    let intervalId;

    function updateVisibility() {
        document.querySelectorAll('[show-content]').forEach(content => {
            const triggerId = content.getAttribute('show-content');
            const trigger = document.querySelector(`[show-trigger="${triggerId}"]`);
            
            if (trigger && trigger.checked) {
                content.classList.remove('hiding');
                content.classList.add('visible');
            } else {
                if (content.classList.contains('visible')) {
                    content.classList.remove('visible');
                    content.classList.add('hiding');
                    // Remove 'hiding' class after animation completes
                    setTimeout(() => {
                        content.classList.remove('hiding');
                    }, 300); // Duration should match your CSS transition
                }
            }
        });
    }

    function wrapContents() {
        document.querySelectorAll('[show-content]').forEach(content => {
            if (!content.parentElement.classList.contains('content-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'content-wrapper';
                content.parentNode.insertBefore(wrapper, content);
                wrapper.appendChild(content);
            }
        });
    }

    function startChecking() {
        wrapContents();
        updateVisibility();
        intervalId = setInterval(updateVisibility, 100);
    }

    function stopChecking() {
        if (intervalId) {
            clearInterval(intervalId);
        }
    }

    startChecking();

    return { startChecking, stopChecking };
}

//==============================================================================
// Character Count Functionality
//==============================================================================

function initCharacterCount() {
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  function updateCharCount(input) {
    const charCount = input.value.length;
    const minChar = parseInt(input.getAttribute('min-char')) || 0;
    const maxChar = parseInt(input.getAttribute('max-char')) || Infinity;
    const countElement = input.closest('.form_input-wrap').querySelector('.lf-charcount');
    
    if (!countElement) return;

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
}

//==============================================================================
// Progress Bar Functionality
//==============================================================================

function initProgressBar() {
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
}

//==============================================================================
// Submit Button Functionality
//==============================================================================

function initSubmitButton() {
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
}

//==============================================================================
// Button Slide Functionality
//==============================================================================

function initSlideButtons() {
  $('.slide-button').on('click', function(e) {
    e.preventDefault();
    var $target = $($(this).attr('href'));
    
    if ($target.length) {
      $('html, body').animate({
        scrollTop: $target.offset().top
      }, 1000);
    }
  });
}

//==============================================================================
// Error Notification Toggle
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

    if (isAnyErrorVisible && errorNotification.style.display === 'none') {
      errorNotification.style.display = 'block';
      errorNotification.classList.add('shake-animation');
      setTimeout(() => {
        errorNotification.classList.remove('shake-animation');
      }, 600); // Duration matches the CSS animation
    } else if (!isAnyErrorVisible) {
      errorNotification.style.display = 'none';
    }
  }
}

//==============================================================================
// Submit Clear Functionality
//==============================================================================

function initSubmitClear() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
        const url = new URL(entry.name);
        if (url.hostname.includes('make.com') && entry.responseEnd > 0 && entry.responseStatus === 200) {
          resetForm(false); // Pass false to skip confirmation
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

//==============================================================================
// Preview Area Functionality
//==============================================================================

function initPreviewArea() {
  const previewAreaWrap = document.querySelector('.lf-preview-area-wrap');
  const previewAreaContainer = document.querySelector('.lf-preview-area-container');
  const previewAreaBox = document.querySelector('.lf-preview-area-box');
  const previewAreaContentWrap = document.querySelector('.lf-preview-area-content-wrap');

  function isMobileView() {
    return window.innerWidth <= 991;
  }

  function handleViewportChange() {
    if (isMobileView()) {
      previewAreaWrap.style.display = 'none';
    } else {
      const currentStep = document.querySelector('.lf-form-step[style*="display: block"]');
      if (currentStep && currentStep.getAttribute('data-preview-id')) {
        previewAreaWrap.style.display = 'block';
      }
    }
  }

  function togglePreviewArea(previewId = null) {
    if (!previewAreaWrap || !previewAreaContainer || !previewAreaBox || !previewAreaContentWrap) return;

    const relevantContent = previewId ? document.querySelector(`.lf-preview-area-content#${previewId}`) : null;
    const embedLocation = previewId ? document.querySelector(`[if-id][data-preview-id="${previewId}"]`) : null;

    if (isMobileView()) {
      // Mobile behavior
      previewAreaWrap.style.display = 'none';
      
      if (relevantContent && embedLocation) {
        // Remove any previously inserted content for this specific step
        const existingContent = embedLocation.querySelector('.lf-preview-area-content');
        if (existingContent) {
          existingContent.remove();
        }
  
        // Clone and insert content at embed location
        const clonedContent = relevantContent.cloneNode(true);
        clonedContent.style.display = 'block'; // Ensure it's visible
        const embedPoint = embedLocation.querySelector('[data-embed-point]');
        if (embedPoint) {
          embedPoint.parentNode.insertBefore(clonedContent, embedPoint.nextSibling);
        } else {
          embedLocation.appendChild(clonedContent);
        }
      }
    } else {
      // Desktop behavior
      if (previewId) {
        if (previewAreaWrap.style.display !== 'block') {
          previewAreaWrap.style.display = 'block';
          previewAreaContainer.style.opacity = '0';
          previewAreaBox.style.transform = 'translateX(100%)';
          previewAreaContainer.offsetHeight; // Force reflow
          previewAreaContainer.style.opacity = '1';
          previewAreaBox.style.transform = 'translateX(0)';
        }

        previewAreaContentWrap.style.opacity = '0';
        
        setTimeout(() => {
          document.querySelectorAll('.lf-preview-area-content').forEach(content => {
            content.style.display = content.id === previewId ? 'flex' : 'none';
          });
          previewAreaContentWrap.style.opacity = '1';
        }, 300);
      } else {
        previewAreaContainer.style.opacity = '0';
        previewAreaBox.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
          previewAreaWrap.style.display = 'none';
        }, 500);
      }

      // Remove any mobile-inserted content when switching to desktop
      document.querySelectorAll('[if-id] > .lf-preview-area-content').forEach(el => el.remove());
    }
  }

  // Listen for step changes
  document.addEventListener('inputflow-event[step-changed]', (event) => {
    const newStepId = event.detail.newStep.id;
    const step = document.querySelector(`[if-id="${newStepId}"]`);
    const previewId = step.getAttribute('data-preview-id');
    togglePreviewArea(previewId);
  });

  // Handle viewport changes
  window.addEventListener('resize', handleViewportChange);

  // Initialize preview area on page load
  handleViewportChange();
  const currentStep = document.querySelector('.lf-form-step[style*="display: block"]');
  if (currentStep) {
    const previewId = currentStep.getAttribute('data-preview-id');
    togglePreviewArea(previewId);
  } else {
    togglePreviewArea();
  }
}

//==============================================================================
// Fancybox Functionality
//==============================================================================

document.addEventListener("DOMContentLoaded", function() {
    // Initialize Fancybox independently
    Fancybox.bind("[data-fancybox]", {
        // Options here if needed
    });
});

//==============================================================================
// Main Initialization Function
//==============================================================================

function initializeAll() {
    // Load saved form data
    loadFormData();
    
    // Set up form event listeners
    const form = document.querySelector('form');
    if (form) {
        // Add slider-specific visual update listeners
        form.querySelectorAll('[if-lib="rangeslider-value-input"]').forEach(slider => {
            slider.addEventListener('input', () => {
                updateSliderVisuals();
            });
            // Add listener for programmatic changes
            slider.addEventListener('change', () => {
                updateSliderVisuals();
            });
        });

        // Keep original form save listeners
        form.addEventListener('input', saveFormData);
        form.addEventListener('change', saveFormData);
    } else {
        console.warn('Form not found. Form state saving disabled.');
    }

    // Initialize all components
    const showHideController = initShowHideContent();
    initCharacterCount();
    initProgressBar();
    initSubmitButton();
    initSlideButtons();
    initSubmitClear();
    initPreviewArea();

    // Add event listener for the reset link
    const resetLink = document.getElementById('resetFormLink');
    if (resetLink) {
        resetLink.addEventListener('click', (e) => {
            if (!resetForm(true)) {
                e.preventDefault();
            }
        });
    }

    // Initial check for error notification
    toggleErrorNotification();

    // Set interval to check periodically for error notifications
    const errorCheckIntervalId = setInterval(toggleErrorNotification, 100);

    // Clean up when the page is about to be unloaded
    window.addEventListener('beforeunload', () => {
        clearInterval(errorCheckIntervalId);
        showHideController.stopChecking();
    });

    console.log('All components initialized successfully.');
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAll);
