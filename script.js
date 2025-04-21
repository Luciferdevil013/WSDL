// Shopify Storefront API Configuration
const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    accessToken: 'f6558466e9d3ffd0edfeda79dedc938a',
    apiVersion: '2024-04'
};

// GraphQL query to fetch collections with their products
const collectionsQuery = `
    query {
        collections(first: 10) {
            edges {
                node {
                    id
                    title
                    description
                    handle
                    products(first: 20) {
                        edges {
                            node {
                                id
                                title
                                description
                                handle
                                priceRange {
                                    minVariantPrice {
                                        amount
                                        currencyCode
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
                                            id
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
            }
        }
    }
`;

// GraphQL query to fetch a specific collection by handle
const collectionByHandleQuery = `
    query getCollection($handle: String!) {
        collection(handle: $handle) {
            id
            title
            description
            handle
            products(first: 50) {
                edges {
                    node {
                        id
                        title
                        description
                        handle
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
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
                                    id
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
    }
`;

// GraphQL query to fetch all products
const allProductsQuery = `
    query {
        products(first: 50) {
            edges {
                node {
                    id
                    title
                    description
                    handle
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
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
                                id
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

// GraphQL query to fetch all collections
const allCollectionsQuery = `
    query {
        collections(first: 10) {
            edges {
                node {
                    id
                    title
                    handle
                }
            }
        }
    }
`;

// Function to fetch collections from Shopify
async function fetchShopifyCollections() {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: collectionsQuery
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Collections data:', data);
        return data.data.collections.edges;
    } catch (error) {
        console.error('Error fetching collections:', error);
        return null;
    }
}

// Function to fetch a specific collection by handle
async function fetchCollectionByHandle(handle) {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: collectionByHandleQuery,
                variables: {
                    handle: handle
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Collection data:', data);
        return data.data.collection;
    } catch (error) {
        console.error('Error fetching collection:', error);
        return null;
    }
}

// Function to fetch all products
async function fetchAllProducts() {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: allProductsQuery
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('All products data:', data);
        return data.data.products.edges;
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

// Function to fetch all collections
async function fetchAllCollections() {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: allCollectionsQuery
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('All collections:', data.data.collections.edges);
        return data.data.collections.edges;
    } catch (error) {
        console.error('Error fetching collections:', error);
        return null;
    }
}

// Function to display collections and products
async function displayCollections() {
    const collections = await fetchShopifyCollections();
    
    if (!collections) {
        console.error('Failed to fetch collections');
        return;
    }

    const collectionsContainer = document.getElementById('collections-container');
    if (!collectionsContainer) {
        console.error('Collections container not found');
        return;
    }
    
    collections.forEach(collection => {
        const collectionNode = collection.node;
        
        // Create collection container
        const collectionElement = document.createElement('div');
        collectionElement.className = 'collection';
        collectionElement.innerHTML = `
            <h2>${collectionNode.title}</h2>
            <p>${collectionNode.description || ''}</p>
            <div class="products-grid">
                ${collectionNode.products.edges.map(product => {
                    const productNode = product.node;
                    const imageUrl = productNode.images.edges[0]?.node.url || '';
                    const price = productNode.variants.edges[0]?.node.price.amount || '0';
                    const currency = productNode.variants.edges[0]?.node.price.currencyCode || 'USD';
                    
                    return `
                        <div class="product-card">
                            <img src="${imageUrl}" alt="${productNode.title}">
                            <h3>${productNode.title}</h3>
                            <p>${productNode.description}</p>
                            <p class="price">${currency} ${price}</p>
                            <button onclick="addToCart('${productNode.id}')">Add to Cart</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        collectionsContainer.appendChild(collectionElement);
    });
}

// Function to display products
function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found');
        return;
    }

    container.innerHTML = products.map(product => {
        const productNode = product.node;
        const imageUrl = productNode.images.edges[0]?.node.url || '';
        const price = productNode.variants.edges[0]?.node.price.amount || '0';
        const currency = productNode.variants.edges[0]?.node.price.currencyCode || 'USD';
        
        return `
            <div class="product-card">
                <img src="${imageUrl}" alt="${productNode.title}">
                <h3>${productNode.title}</h3>
                <p>${productNode.description}</p>
                <p class="price">${currency} ${price}</p>
                <button onclick="addToCart('${productNode.id}')">Add to Cart</button>
            </div>
        `;
    }).join('');
}

// Function to add product to cart
async function addToCart(productId) {
    try {
        const addToCartMutation = `
            mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
                cartLinesAdd(cartId: $cartId, lines: $lines) {
                    cart {
                        id
                        totalQuantity
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;

        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: addToCartMutation,
                variables: {
                    cartId: 'gid://shopify/Cart/1234567890', // You'll need to create a cart first
                    lines: [{
                        merchandiseId: productId,
                        quantity: 1
                    }]
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Added to cart:', data);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Example usage:
async function loadSpecificCollection() {
    // First, let's fetch all collections to see their handles
    const collections = await fetchAllCollections();
    if (collections) {
        console.log('Available collections:');
        collections.forEach(collection => {
            console.log(`Title: ${collection.node.title}, Handle: ${collection.node.handle}`);
        });
    }

    // Then fetch the specific collection
    const collectionHandle = 'today-deal'; // Update this with the correct handle
    console.log('Fetching collection with handle:', collectionHandle);
    
    const collection = await fetchCollectionByHandle(collectionHandle);
    console.log('Collection data:', collection);
    
    if (collection) {
        displayProducts(collection.products.edges, 'collections-container');
    } else {
        console.error('Collection not found or empty');
    }
}

async function loadAllProducts() {
    const products = await fetchAllProducts();
    if (products) {
        displayProducts(products, 'collections-container');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load the Today Deal collection
    loadSpecificCollection();
});
