const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    accessToken: 'f6558466e9d3ffd0edfeda79dedc938a',
    apiVersion: '2024-04'
};

// Function to fetch all products from Shopify
async function fetchAllProducts() {
    try {
        const productsQuery = `
            query {
                products(first: 50) {
                    edges {
                        node {
                            id
                            title
                            vendor
                            productType
                            description
                            collections(first: 5) {
                                edges {
                                    node {
                                        title
                                        handle
                                    }
                                }
                            }
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
                                        quantityAvailable
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
            body: JSON.stringify({
                query: productsQuery
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log('Products data:', data);
        return data.data.products.edges;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Function to get unique collections from products
function getUniqueCollections(products) {
    const collections = new Map();
    
    products.forEach(product => {
        product.node.collections.edges.forEach(collection => {
            const collectionNode = collection.node;
            if (!collections.has(collectionNode.handle)) {
                collections.set(collectionNode.handle, {
                    title: collectionNode.title,
                    handle: collectionNode.handle
                });
            }
        });
    });
    
    return Array.from(collections.values());
}

// Function to update category list with collections
function updateCategoryList(products) {
    const categoryList = document.querySelector('.category-list');
    
    if (!categoryList) {
        console.error('Category list not found');
        return;
    }

    // Get unique collections
    const collections = getUniqueCollections(products);
    
    // Create category buttons
    const categoryButtons = `
        <div class="category-item">
            <button class="category-button active" data-collection="all">
                All Products
            </button>
        </div>
        ${collections.map(collection => `
            <div class="category-item">
                <button class="category-button" data-collection="${collection.handle}">
                    ${collection.title}
                    <span class="arrow">▼</span>
                </button>
                <div class="subcategory-list">
                    ${products
                        .filter(product => 
                            product.node.collections.edges.some(c => c.node.handle === collection.handle)
                        )
                        .map(product => `
                            <button class="subcategory-button" data-product="${product.node.id.split('/').pop()}">
                                ${product.node.title}
                            </button>
                        `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    
    categoryList.innerHTML = categoryButtons;
}

// Function to handle category filtering
function handleCategoryFilter(products) {
    const categoryButtons = document.querySelectorAll('.category-button');
    const subcategoryButtons = document.querySelectorAll('.subcategory-button');
    
    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const categoryItem = button.parentElement;
            
            // Toggle active state for category item
            if (button.dataset.collection !== 'all') {
                categoryItem.classList.toggle('active');
            }
            
            // Remove active class from all category buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Reset all subcategory buttons
            subcategoryButtons.forEach(btn => btn.classList.remove('active'));
            
            const collectionHandle = button.dataset.collection;
            if (collectionHandle === 'all') {
                displayProducts(products);
            } else {
                const filteredProducts = products.filter(product => 
                    product.node.collections.edges.some(c => c.node.handle === collectionHandle)
                );
                displayProducts(filteredProducts);
            }
        });
    });

    // Handle subcategory button clicks
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all subcategory buttons in the same category
            const categoryItem = button.closest('.category-item');
            categoryItem.querySelectorAll('.subcategory-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const productId = button.dataset.product;
            // You can implement specific product view here if needed
        });
    });
}

// Function to display products
function displayProducts(products) {
    const categoryDiv = document.querySelector('.category-product');
    
    if (!categoryDiv) {
        console.error('Category div not found');
        return;
    }

    // Clear existing content
    categoryDiv.innerHTML = '';

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
        categoryDiv.insertAdjacentHTML('beforeend', productHTML);
    });
}

// Main function to initialize the category page
async function initializeCategoryPage() {
    const products = await fetchAllProducts();
    
    if (products.length > 0) {
        // Update category list with collections
        updateCategoryList(products);
        
        // Set up category filtering
        handleCategoryFilter(products);
        
        // Display all products initially
        displayProducts(products);
    } else {
        const categoryDiv = document.querySelector('.category-product');
        if (categoryDiv) {
            categoryDiv.innerHTML = '<p>No products found</p>';
        }
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCategoryPage);
