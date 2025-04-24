const shopifyConfig = {
    storeUrl: '738eda.myshopify.com',
    accessToken: 'f6558466e9d3ffd0edfeda79dedc938a',
    apiVersion: '2024-04'
};

// Function to fetch collections with their products and metafields
async function fetchCollections() {
    try {
        let allCollections = [];
        let hasNextPage = true;
        let cursor = null;

        while (hasNextPage) {
            const query = `
                query($cursor: String) {
                    collections(first: 50, after: $cursor) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        edges {
                            node {
                                id
                                title
                                handle
                                metafields(identifiers: [
                                    {namespace: "custom", key: "sub_category"},
                                    {namespace: "custom", key: "isCategory"}
                                ]) {
                                    namespace
                                    key
                                    value
                                    type
                                }
                                products(first: 50) {
                                    edges {
                                        node {
                                            id
                                            title
                                            vendor
                                            productType
                                            description
                                            images(first: 1) {
                                                edges {
                                                    node {
                                                        url
                                                        altText
                                                    }
                                                }
                                            }
                                            metafields(identifiers: [
                                                {namespace: "custom", key: "model_no"}
                                            ]) {
                                                id
                                                namespace
                                                key
                                                value
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
                        }
                    }
                }
            `;

            const variables = cursor ? { cursor } : {};

            const response = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                throw new Error('GraphQL query failed');
            }

            if (!data.data || !data.data.collections) {
                throw new Error('Invalid response structure');
            }

            const collections = data.data.collections;

            // Fetch subcollection titles
            for (const collection of collections.edges) {
                const subCategoryMetafield = collection.node.metafields?.find(
                    meta => meta && meta.namespace === 'custom' && meta.key === 'sub_category'
                );

                if (subCategoryMetafield?.value) {
                    try {
                        const subCollectionIds = JSON.parse(subCategoryMetafield.value);
                        const subCollectionTitles = await Promise.all(
                            subCollectionIds.map(async (id) => {
                                const subQuery = `
                                    query {
                                        collection(id: "${id}") {
                                            title
                                        }
                                    }
                                `;

                                const subResponse = await fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                                        'Accept': 'application/json'
                                    },
                                    body: JSON.stringify({ query: subQuery })
                                });

                                const subData = await subResponse.json();
                                return subData.data?.collection?.title || '';
                            })
                        );

                        // Replace the metafield value with the titles
                        subCategoryMetafield.value = JSON.stringify(subCollectionTitles);
                    } catch (error) {
                        console.error('Error fetching subcollection titles:', error);
                    }
                }
            }

            allCollections = [...allCollections, ...collections.edges];
            hasNextPage = collections.pageInfo?.hasNextPage || false;
            cursor = collections.pageInfo?.endCursor || null;

            if (!hasNextPage) break;
        }

        return allCollections;
    } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
    }
}

// Function to update category list with collections and subcategories
function updateCategoryList(collections) {
    const categoryList = document.querySelector('.category-list');

    if (!categoryList) {
        console.error('Category list not found');
        return;
    }

    // Create category buttons
    const categoryButtons = `
        <div class="category-item">
            <button class="category-button active" data-collection="all">
                All Products
            </button>
        </div>
        ${collections.map(collection => {
        const collectionNode = collection.node;

        // Get subcategories from metafield
        const subCategoryMetafield = collectionNode.metafields?.find(
            meta => meta && meta.namespace === 'custom' && meta.key === 'sub_category'
        );

        if (subCategoryMetafield?.value) {
            let subcategoriesArray = [];
            try {
                subcategoriesArray = JSON.parse(subCategoryMetafield.value);
            } catch (error) {
                console.error('Error parsing subcategories:', error);
                subcategoriesArray = [];
            }

            return `
                    <div class="category-item">
                        <button class="category-button" data-collection="${collectionNode.handle}">
                            ${collectionNode.title}
                            <span class="arrow">▼</span>
                        </button>
                        <div class="subcategory-list">
                            ${subcategoriesArray.map(subcat => `
                                <button class="subcategory-button" 
                                        data-collection="${collectionNode.handle}" 
                                        data-subcategory="${subcat}">
                                    ${subcat}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
        }
        return ''; // Skip collections without subcategories
    }).join('')}
    `;

    categoryList.innerHTML = categoryButtons;
}

// Function to handle category and subcategory filtering
function handleCategoryFilter(collections) {
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

            // If "All Products" is clicked, show all products
            if (button.dataset.collection === 'all') {
                displayAllProducts(collections);
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

            const collectionHandle = button.dataset.collection;
            const subcategory = button.dataset.subcategory;
            // Show loading state
            const categoryDiv = document.querySelector('.category-product');
            if (categoryDiv) {
                categoryDiv.innerHTML = '<p>Loading products...</p>';
            }

            // Fetch products for this subcategory
            const query = `
                query {
                    collections(first: 1, query: "title:${subcategory}") {
                        edges {
                            node {
                                products(first: 50) {
                                    edges {
                                        node {
                                            id
                                            title
                                            vendor
                                            productType
                                            description
                                            metafields(identifiers: [
                                                {namespace: "custom", key: "Model_No"}
                                            ]) {
                                                id
                                                namespace
                                                key
                                                value
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

            fetch(`https://${shopifyConfig.storeUrl}/api/${shopifyConfig.apiVersion}/graphql.json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': shopifyConfig.accessToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ query })
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {


                    if (data.errors) {
                        if (categoryDiv) {
                            categoryDiv.innerHTML = '<p>Error: ' + data.errors[0].message + '</p>';
                        }
                        return;
                    }

                    if (!data.data?.collections?.edges?.[0]?.node?.products?.edges) {
                        if (categoryDiv) {
                            categoryDiv.innerHTML = '<p>No products found for this category</p>';
                        }
                        return;
                    }
                    const products = data.data.collections.edges[0].node.products.edges;
                    displayProducts(products);
                })
                .catch(error => {

                    if (categoryDiv) {
                        categoryDiv.innerHTML = '<p>Error loading products. Please try again.</p>';
                    }
                });
        });
    });
}

// Function to display all products
function displayAllProducts(collections) {
    const categoryDiv = document.querySelector('.category-product');
    if (!categoryDiv) return;

    // Clear existing content
    categoryDiv.innerHTML = '';

    // Get all products from all collections
    const allProducts = [];
    collections.forEach(collection => {
        if (collection.node.products && collection.node.products.edges) {
            allProducts.push(...collection.node.products.edges);
        }
    });

    // Remove duplicate products based on ID
    const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex((p) => p.node.id === product.node.id)
    );

    displayProducts(uniqueProducts);
}

// Function to display products
function displayProducts(products) {
    const categoryDiv = document.querySelector('.category-product');
    if (!categoryDiv) {
        return;
    }

    // Clear existing content
    categoryDiv.innerHTML = '';

    if (!products || products.length === 0) {
        categoryDiv.innerHTML = '<p>No products found</p>';
        return;
    }

    try {
        products.forEach(product => {
            const productNode = product.node;

            // Get product image URL
            const imageUrl = productNode.images?.edges?.[0]?.node?.url || '';
            const imageAlt = productNode.images?.edges?.[0]?.node?.altText || productNode.title;

            // Get product price
            const price = productNode.variants?.edges?.[0]?.node?.price?.amount || '0';

            // Get Model No from metafields
            const modelNo = productNode.metafields?.[0]?.value || 'N/A';

            const productHTML = `
                <div class="slide">
                    <a href="./product.html?id=${productNode.id.split('/').pop()}" class="product-link">
                        <img class="slide-img" src="${imageUrl}" alt="${imageAlt}">
                        <div class="slide-details">
                            <div class="slide-text">
                                <h4 class="h4-heading slide-name">${productNode.title}</h4>
                                <h4 class="h4-heading slide-company">Model No: ${modelNo}</h4>
                                <h4 class="h4-heading slide-price">Dhs. ${price} AED</h4>
                                <h4 class="h4-heading slide-company">${productNode.vendor || ''}</h4>
                                <h4 class="h4-heading slide-company">Product Type: ${productNode.productType || ''}</h4>
                            </div>
                        </div>
                    </a>
                    <button class="cart-button">Chat With Us</button>
                </div>
            `;

            categoryDiv.insertAdjacentHTML('beforeend', productHTML);
        });
    } catch (error) {
        categoryDiv.innerHTML = '<p>Error displaying products. Please try again.</p>';
    }
}

// Main function to initialize the category page
async function initializeCategoryPage() {
    const collections = await fetchCollections();

    if (collections.length > 0) {
        // Update category list with collections and subcategories
        updateCategoryList(collections);

        // Set up category and subcategory filtering
        handleCategoryFilter(collections);

        // Display all products initially
        displayAllProducts(collections);
    } else {
        const categoryDiv = document.querySelector('.category-product');
        if (categoryDiv) {
            categoryDiv.innerHTML = '<p>No products found</p>';
        }
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCategoryPage);
