function isDesktop() {
    return window.matchMedia("(min-width: 1024px)").matches;
}

const optional = document.querySelector('.optional')

const API_KEY = 'MFVMR2xqNHVtU1U1TTJsaFRYbzJUdFBNNEhDbDlZU21QZklCY3p2ZQ==';

const fetchCountries = async () => {
    try {
        const response = await fetch('https://api.countrystatecity.in/v1/countries', {
            headers: {
                'X-CSCAPI-KEY': API_KEY
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Country API Error:', error);
        return [];
    }
};

const fetchStates = async (countryCode) => {
    try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, {
            headers: {
                'X-CSCAPI-KEY': API_KEY
            }
        });
        return await response.json();
    } catch (error) {
        console.error('State API Error:', error);
        return [];
    }
};


const fetchCurrencies = async () => {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest');
        const data = await response.json();
        return Object.keys(data.rates).map(currency => ({
            name: currency,
            value: currency
        })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Currency API Error:', error);
        return [];
    }
};

const chooseCompany = () => {
    const companyButton = document.querySelectorAll('.companyTypeButton')
    const otherSpec = document.querySelector('#otherSpecfic')

    companyButton.forEach(button => {
        button.addEventListener('click', () => {
            companyButton.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (button.textContent == 'Others') {
                otherSpec.style.display = 'flex'
            } else {
                otherSpec.style.display = 'none'
            }
        })
    })

}

const freeValuationButton = () => {

}

const createDropdownOption = (text, value) => {
    const li = document.createElement('li');
    li.textContent = text;
    li.dataset.value = value;
    return li;
};

const initializeDropdown = (containerSelector, options, onSelect, isMultiSelect = false) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const list = container.querySelector('.options-list');
    const button = container.querySelector('.select-button');
    list.innerHTML = '';
    let selectedValues = [];

    const updateButtonText = () => {
        if (isMultiSelect) {
            button.textContent = selectedValues.length > 0
                ? `${selectedValues.length} selected`
                : button.dataset.placeholder;
        }
    };

    options.forEach(option => {
        const li = createDropdownOption(option.name, option.value);
        li.addEventListener('click', () => {
            if (isMultiSelect) {
                const index = selectedValues.indexOf(option.value);
                if (index > -1) {
                    selectedValues.splice(index, 1);
                    li.classList.remove('selected');
                } else {
                    selectedValues.push(option.value);
                    li.classList.add('selected');
                }
                button.dataset.value = selectedValues.join(',');
                updateButtonText();
            } else {
                button.textContent = option.name;
                button.dataset.value = option.value;
                list.style.display = 'none';
            }
            onSelect(isMultiSelect ? selectedValues : option.value);
        });
        list.appendChild(li);
    });

    if (isMultiSelect) {
        button.dataset.placeholder = button.textContent;
        container.classList.add('multi-select');
    }
};



const initializeMenuAnimations = () => {
    const toggle = document.querySelector('#toggle');
    const close = document.querySelector('#close');
    const menuDiv = document.querySelectorAll('.menuDiv');
    const menuLink = document.querySelectorAll('.menuLink');
    const splitElements = Array.from(menuLink).map(splitWord);
    let toggleOpen = false;

    toggle?.addEventListener('click', () => {
        const tl = gsap.timeline();
        tl.set(".menu", { display: 'block' })
            .to(menuDiv, { x: '0%', duration: 0.5, stagger: 0.3, ease: "power2.out" }, 'first')
            .to(toggle, { scale: 0, duration: 0.5, ease: "power2.out" }, '-=1')
            .to(close, { scale: 1, duration: 0.5, ease: "power2.out" }, '-=1')
            .from(splitElements, { y: '100%', duration: 0.5, ease: "power2.out" });
        toggleOpen = true;
    });

    // Add window click handler
    window.addEventListener('click', (e) => {
        if (toggleOpen) {
            const isMenuClick = e.target.closest('.menu');
            const isToggleClick = e.target.closest('#toggle');

            if (!isMenuClick && !isToggleClick) {
                const tl = gsap.timeline();
                tl.to(menuDiv, { x: '100%', duration: 0.5, ease: "power2.out" }, 'first')
                    .to(close, { scale: 0, duration: 0.5, ease: "power2.out" }, 'first')
                    .to(toggle, { scale: 1, duration: 0.5, ease: "power2.out" }, 'first')
                    .set(".menu", { display: 'none' });
                toggleOpen = false;
            }
        }
    });
};

const initializeAllDropdowns = async () => {
    try {
        const countries = await fetchCountries();
        initializeDropdown('.country', countries.map(c => ({
            name: c.name,
            value: c.iso2
        })), async (countryCode) => {
            const states = await fetchStates(countryCode);
            initializeDropdown('.state', states.map(s => ({
                name: s.name,
                value: s.iso2
            })), () => { });
        });

        initializeStockDropdown();

        const currencies = await fetchCurrencies();
        initializeDropdown('.wholesale-currency', currencies, () => { });
        initializeDropdown('.asking-currency', currencies, () => { });

    } catch (error) {
        console.error('Initialization error:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initializeAllDropdowns();
    initializeMenuAnimations();
    initializeFormSubmission();
    chooseCompany();

    document.querySelectorAll('.select-button').forEach(button => {
        button.addEventListener('click', function () {
            const allLists = document.querySelectorAll('.options-list');
            const currentList = this.nextElementSibling;

            allLists.forEach(list => {
                list.style.display = list === currentList &&
                    list.style.display !== 'block' ? 'block' : 'none';
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select, .city-select, .stock')) {
            document.querySelectorAll('.options-list').forEach(list => {
                list.style.display = 'none';
            });
        }
    });
});

function splitWord(element) {
    return new SplitType(element).words;
}

const initializeStockDropdown = () => {
    initializeDropdown('.stock', [
        { name: "Switch Gear", value: "switch-gear" },
        { name: "Automation & Control Equipments", value: "automation-control" },
        { name: "Wires & Cables", value: "wires-cables" },
        { name: "Switch & Sockets", value: "switch-sockets" },
        { name: "Electronics & Lighting", value: "electronics-lighting" },
        { name: "Hand Tools", value: "hand-tools" },
        { name: "Power Tools", value: "power-tools" },
        { name: "Cutting Tools", value: "cutting-tools" },
        { name: "Measuring Tools", value: "measuring-tools" },
        { name: "Fastening Tools", value: "fastening-tools" },
        { name: "Machinery", value: "machinery" },
        { name: "Bearings", value: "bearings" },
        { name: "Hydraulic Components", value: "hydraulic-components" },
        { name: "Motors", value: "motors" },
        { name: "Generators", value: "generators" },
        { name: "HVAC Systems", value: "hvac-systems" },
        { name: "Fire & Safety", value: "fire-safety" },
        { name: "Building Materials", value: "building-materials" },
        { name: "Plumbing Systems", value: "plumbing-systems" },
        { name: "Construction Tools & Equipments", value: "construction-tools" },
        { name: "IT Equipments", value: "it-equipments" },
        { name: "Batteries", value: "batteries" },
        { name: "Networking Devices", value: "networking-devices" },
        { name: "Data Storage", value: "data-storage" },
        { name: "Oil & Gas Equipments", value: "oil-gas-equipments" },
        { name: "Marine Supplies", value: "marine-supplies" },
        { name: "Aerospace & Aircraft Materials", value: "aerospace-materials" },
        { name: "Garments", value: "garments" },
        { name: "Cosmetics & Personal Care", value: "cosmetics-personal-care" },
        { name: "Toys & Games", value: "toys-games" },
        { name: "Kids Essentials", value: "kids-essentials" },
        { name: "Footwear", value: "footwear" },
        { name: "Garments", value: "garments" },
        { name: "Cosmetics & Personal Care", value: "cosmetics-personal-care" },
        { name: "Toys & Games", value: "toys-games" },
        { name: "Kids Essentials", value: "kids-essentials" },
        { name: "Footwear", value: "footwear" }

    ], () => { }, true);
};

const initializeFormSubmission = () => {
    const form = document.querySelector('form');
    const submitButton = document.querySelector('.submit');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    form.parentElement.insertBefore(errorDiv, form);
    // Initialize EmailJS
    emailjs.init('g9OiYNbf42d7ROmmN'); // Your EmailJS user ID
    
    form.addEventListener('submit', async (e) => {
        console.log(document.querySelector('.companyTypeButton.active')?.textContent || "")
        e.preventDefault();
        errorDiv.style.display = 'none';
        clearErrors();

        // Collect all form data
        const formData = {
            name: document.querySelector('input[name="companyNameInput"]')?.value,
            email: document.querySelector('input[name="email"]')?.value,
            phone: document.querySelector('input[name="mobileNumber"]')?.value,
            client_type: document.querySelector('.companyTypeButton.active')?.textContent || "",
            country: document.querySelector('.country .select-button').dataset.value,
            state: document.querySelector('.state .select-button').dataset.value,
            stock_types: document.querySelector('.stock .select-button').dataset.value.split(','),
            wholesale_currency: document.querySelector('.wholesale-currency .select-button').dataset.value,
            asking_currency: document.querySelector('.asking-currency .select-button').dataset.value,
            wholesale_price: document.querySelector('input[name="wholeSellPrice"]')?.value,
            asking_price: document.querySelector('input[name="askSellPrice"]')?.value,

        };

        if (!formData.name || !formData.email || !formData.phone) {
            showError(errorDiv, 'Please fill in all required fields');
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            // Prepare email parameters
            const templateParams = {
                name: formData.name || 'N/A',
                email: formData.email || 'N/A',
                phone: formData.phone || 'N/A',
                country: formData.country,
                state: formData.state,
                client_type: formData.client_type,
                stock_types: formData.stock_types.join(', '),
                wholesale_currency: formData.wholesale_currency,
                asking_currency: formData.asking_currency,
                wholesale_price: formData.wholesale_price || 'N/A',
                asking_price: formData.asking_price || 'N/A',
                stock_categories: formData.stock_types.join(', '),
                submission_date: new Date().toLocaleString(),
            };

            await emailjs.send(
                'Gmail Mailing System',
                'FreeValuation',
                templateParams,
                'g9OiYNbf42d7ROmmN'
            );

            showSuccess('Form submitted successfully!');
            form.reset();
            resetDropdowns();

        } catch (error) {
            console.error('Submission error:', error);
            showError(errorDiv, 'Error submitting form. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Valuation Request';
        }
    });

    function showError(element, message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        element?.classList?.add('error');
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.parentElement.insertBefore(successDiv, form.nextSibling);
        setTimeout(() => successDiv.remove(), 5000);
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    }

    function resetDropdowns() {
        document.querySelectorAll('.select-button').forEach(button => {
            button.textContent = 'Select';
            button.dataset.value = '';
        });
    }
};