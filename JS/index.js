gsap.registerPlugin(ScrollTrigger);
function splitText(element) {
    const elementSelector = document.querySelector(element);
    const elementSplit = new SplitType(elementSelector, { types: 'lines, words' });
    return elementSplit.words;
}


function videoPlayerAnimation() {
    const liness = document.querySelector('.videoTextHeader .video-sub .liness');
    const link = document.querySelector('.videoTextHeader .video-sub .links');

    const herotl = gsap.timeline({});
    herotl.from(splitText('.videoTextHeader .h1-heading'), {
        y: 100,
        duration: 1,
    }, 'first')
        .from(splitText('.videoTextHeader .video-sub .first'), {
            y: 100,
            duration: 1,
        }, 'first')
        .from(splitText('.videoTextHeader .video-sub .second'), {
            y: 100,
            duration: 1,
        }, 'first')
        .from(liness, {
            scaleX: 0,
            duration: 1,
            transformOrigin: 'left',
        }, 'first')
        .from(link, {
            y: 100,
            opacity: 0,
            duration: 1,
        }, 'first')
}

videoPlayerAnimation();

const tagAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.tag-line',
        start: 'top 40%',
        end: 'top bottom',
    }
});

tagAnimation.from(splitText('.tag-line .h4-heading'), {
    y: 100,
    duration: 0.7,
}, 'tag')

tagAnimation.from(splitText('.tag-line .unbeat'), {
    y: 120,
    duration: 0.7,
}, 'tag')
tagAnimation.from(splitText('.tag-line .quality'), {
    y: 120,
    duration: 0.7,
}, 'tag')
tagAnimation.from(splitText('.tag-line .invent'), {
    y: 120,
    duration: 0.7,
}, 'tag')


const todayDealAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.today-deal',
        start: 'top 50%',
        end: 'top bottom',
    }
});

todayDealAnimation.from(splitText('.today .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'today')

todayDealAnimation.from('.today .slider', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'today')

const categoryAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.categories',
        start: 'top 50%',
        end: 'top bottom',
    }
});

categoryAnimation.from(splitText('.categories .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'category')
categoryAnimation.from('.categories .categories-show', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'category')

const exploreAnimation = gsap.timeline({
    scrollTrigger: {
        trigger: '.explore-lots',
        start: 'top 50%',
        end: 'top bottom',
    }
});

exploreAnimation.from(splitText('.explore-lots .h3-heading'), {
    y: 100,
    duration: 0.7,
}, 'explore')
exploreAnimation.from('.explore-lots .slider', {
    y: 100,
    opacity: 0,
    duration: 0.7,
}, 'explore')

const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    accessToken: 'f6558466e9d3ffd0edfeda79dedc938a',
    apiVersion: '2024-04'
};

// Function to fetch today's deals (first 4 products)
async function fetchTodaysDeals() {
    try {
        const query = `
            query {
                products(first: 4) {
                    edges {
                        node {
                            id
                            title
                            vendor
                            description
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            variants(first: 1) {
                                edges {
                                    node {
                                        price {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch today\'s deals');
        }

        const data = await response.json();
        return data.data.products.edges;
    } catch (error) {
        console.error('Error fetching today\'s deals:', error);
        return [];
    }
}

// Function to fetch explore lots (8 products)
async function fetchExploreLots() {
    try {
        const query = `
            query {
                products(first: 8) {
                    edges {
                        node {
                            id
                            title
                            vendor
                            description
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                        altText
                                    }
                                }
                            }
                            variants(first: 1) {
                                edges {
                                    node {
                                        price {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch explore lots');
        }

        const data = await response.json();
        return data.data.products.edges;
    } catch (error) {
        console.error('Error fetching explore lots:', error);
        return [];
    }
}

// Function to display today's deals
function displayTodaysDeals(products) {
    const slider = document.querySelector('.today .slider');

    if (!slider) {
        console.error('Today\'s deals slider not found');
        return;
    }

    // Clear existing content
    slider.innerHTML = '';

    products.forEach(product => {
        const productNode = product.node;
        const productHTML = `
            <div class="slide">
                <a href="./product.html?id=${productNode.id.split('/').pop()}" class="product-link">
                    <img class="slide-img" src="${productNode.images.edges[0]?.node?.url || ''}" 
                         alt="${productNode.images.edges[0]?.node?.altText || productNode.title}">
                    <div class="slide-details">
                        <div class="slide-text">
                            <h4 class="h4-heading slide-name">${productNode.title}</h4>
                            <h4 class="h4-heading slide-company">${productNode.vendor}</h4>
                            <h4 class="h4-heading slide-price">Dhs. ${productNode.variants.edges[0]?.node?.price?.amount || '0'} AED</h4>
                        </div>
                    </div>
                </a>
                <button class="cart-button">Chat With Us</button>
            </div>
        `;
        slider.insertAdjacentHTML('beforeend', productHTML);
    });
}

// Function to display explore lots
function displayExploreLots(products) {
    const slider = document.querySelector('.explore-lots .slider');

    if (!slider) {
        console.error('Explore lots slider not found');
        return;
    }

    // Clear existing content
    slider.innerHTML = '';

    products.forEach(product => {
        const productNode = product.node;
        const productHTML = `
            <div class="slide">
                <a href="./product.html?id=${productNode.id.split('/').pop()}" class="product-link">
                    <img class="slide-img" src="${productNode.images.edges[0]?.node?.url || ''}" 
                         alt="${productNode.images.edges[0]?.node?.altText || productNode.title}">
                    <div class="slide-details">
                        <div class="slide-text">
                            <h4 class="h4-heading slide-name">${productNode.title}</h4>
                            <h4 class="h4-heading slide-company">${productNode.vendor}</h4>
                            <h4 class="h4-heading slide-price">Dhs. ${productNode.variants.edges[0]?.node?.price?.amount || '0'} AED</h4>
                        </div>
                    </div>
                </a>
                <button class="cart-button">Chat With Us</button>
            </div>
        `;
        slider.insertAdjacentHTML('beforeend', productHTML);
    });
}



const interestContainer = document.querySelector('.category-show')

const allButton = document.querySelectorAll('.categories-button')

let allStocks = {}

async function fetchStocks() {
    allStocks = await fetch('/JS/Stocks.json').then(res => res.json());

    getStockData('Electronic');
}

allButton.forEach(button => {
    button.addEventListener('click', (buttonInstance) => {
        allButton.forEach(btn => btn.classList.remove('active'));
        buttonInstance.target.classList.add('active')
        getStockData(buttonInstance.target.dataset.stock)

    })
});


function getStockData(stockName) {
    let stocksdata = allStocks[stockName]
    showStocks(stocksdata)
}


function showStocks(Stocks) {
    interestContainer.innerHTML = Stocks.map(stock => `
            <div class="category">
                <img class="category-img" src="${stock.img}" alt="Electrical Image">
                <div class="category-links-button">
                    <a href="#" class="category-button">${stock.text}<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M7 21L21 7" stroke="#262626" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M9.625 7L21 7L21 18.375" stroke="#262626" stroke-linecap="round" stroke-linejoin="round" /></svg></a>
                </div>
            </div>`).join('');
}



// Initialize the page
async function initializePage() {
    // Fetch and display today's deals
    const todaysDeals = await fetchTodaysDeals();
    displayTodaysDeals(todaysDeals);
    
    // Fetch and display explore lots
    const exploreLots = await fetchExploreLots();
    displayExploreLots(exploreLots);
    fetchStocks();
}

// Call initializePage when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);


