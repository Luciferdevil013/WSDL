// Function to get product ID from URL

const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    accessToken: 'f6558466e9d3ffd0edfeda79dedc938a',
    apiVersion: '2024-04'
};


function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to fetch product data from Shopify
async function fetchProductData(productId) {
    try {
        const productQuery = `
            query {
                product(id: "gid://shopify/Product/${productId}") {
                    title
                    vendor
                    productType
                    description
                    collections(first: 1) {
                        edges {
                            node {
                                title
                                id
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
                    metafield(namespace: "custom", key: "csv_data") {
                        value
                        reference {
                            ... on GenericFile {
                                url
                                alt
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
                query: productQuery
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product data');
        }

        const data = await response.json();
        console.log('Product data:', data);
        return data.data.product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Function to display product data
async function displayProductData(product) {
    console.log('Starting displayProductData with product:', product);
    const container = document.querySelector('.product-details');
    
    if (!container) {
        console.error('Product container element not found');
        return;
    }

    if (!product) {
        container.innerHTML = '<p>Product not found</p>';
        return;
    }

    // Get CSV file data from metafield
    let fileData = null;
    if (product.metafield?.reference) {
        fileData = {
            url: product.metafield.reference.url,
            filename: product.metafield.reference.alt || 'Download'
        };
        console.log('Found file data:', fileData);
    } else {
        console.log('No file data found in metafield');
    }

    // Update all product information from Shopify data
    const titleElement = container.querySelector('.product-name');
    const vendorElement = container.querySelector('.origin');
    const collectionElement = container.querySelector('.collection');
    const priceElement = container.querySelector('.price');
    const descriptionElement = container.querySelector('.product-description');
    const imageElement = container.querySelector('.main-image');
    const downloadButton = container.querySelector('.product-csv-file-link');
    const fileInfo = container.querySelector('.product-csv-file-link');
    const typeElement = container.querySelector('.stock');
    const quantityElement = container.querySelector('.product-quantity');

    // Update title
    if (titleElement) {
        titleElement.textContent = product.title;
        console.log('Updated title:', product.title);
    }

    // Update vendor
    if (vendorElement) {
        vendorElement.textContent = product.vendor;
        console.log('Updated vendor:', product.vendor);
    }

    // Update product type
    if (typeElement) {
        typeElement.textContent = product.productType || 'No type specified';
        console.log('Updated product type:', product.productType);
    }

    // Update quantity
    if (quantityElement) {
        const quantity = product.variants.edges[0]?.node?.quantityAvailable || 0;
        quantityElement.textContent = quantity;
        console.log('Updated quantity:', quantity);
    }

    // Update collection
    if (collectionElement) {
        collectionElement.textContent = product.collections.edges[0]?.node?.title || 'No collection';
        console.log('Updated collection:', product.collections.edges[0]?.node?.title);
    }

    // Update price
    if (priceElement) {
        priceElement.textContent = `${product.variants.edges[0].node.price.amount} ${product.variants.edges[0].node.price.currencyCode}`;
        console.log('Updated price:', product.variants.edges[0].node.price.amount);
    }

    // Update description
    if (descriptionElement) {
        descriptionElement.innerHTML = product.description;
        console.log('Updated description');
    }

    // Update image
    if (imageElement && product.images.edges[0]?.node?.url) {
        imageElement.src = product.images.edges[0].node.url;
        imageElement.alt = product.images.edges[0].node.altText || product.title;
        console.log('Updated image:', product.images.edges[0].node.url);
    }

    // Update file information
    if (fileData) {
        if (downloadButton) {
            downloadButton.href = fileData.url;
            downloadButton.download = fileData.filename;
            downloadButton.style.display = 'block';
            console.log('Updated download button:', fileData.url);
        }
        if (fileInfo) {
            fileInfo.textContent = fileData.filename;
            console.log('Updated file info:', fileData.filename);
        }
    } else {
        if (fileInfo) fileInfo.textContent = 'No file available';
        if (downloadButton) downloadButton.style.display = 'none';
    }
}

// Main function to handle the product display
async function handleProductDisplay() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        const container = document.getElementById('product-container');
        if (container) {
            container.innerHTML = '<p>No product ID found in URL</p>';
        }
        return;
    }

    const product = await fetchProductData(productId);
    await displayProductData(product);
}

// Call the main function when the page loads
document.addEventListener('DOMContentLoaded', handleProductDisplay);
