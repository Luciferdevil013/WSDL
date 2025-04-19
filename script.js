// Shopify Storefront API Configuration
const shopifyConfig = {
    storeUrl: 'your-store-name.myshopify.com',
    accessToken: 'your-storefront-access-token',
    apiVersion: '2024-01'
};

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

// Function to fetch collections from Shopify
async function fetchShopifyCollections() {
    try {
        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken
            },
            body: JSON.stringify({
                query: collectionsQuery
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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

        const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken
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

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCollections();
});
