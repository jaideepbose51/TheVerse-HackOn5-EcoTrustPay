# 🛍️ EcoCommerce API Documentation

> **Powering sustainable commerce, one API call at a time** 🌱

Welcome to the comprehensive API documentation for our eco-friendly e-commerce platform! This RESTful API enables seamless integration for users, sellers, and administrators.

----------

## 🚀 Quick Start

### Base URL

```
http://localhost:3000
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in your request headers:

```
Authorization: Bearer <your_jwt_token>

```

----------

## 📋 Table of Contents

-   [👥 User Routes](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#-user-routes)
-   [🏪 Seller Routes](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#-seller-routes)
-   [⚙️ Admin Routes](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#%EF%B8%8F-admin-routes)
-   [🔐 Authentication](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#-authentication)
-   [📊 Response Format](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#-response-format)
-   [⚠️ Error Handling](https://claude.ai/chat/14d30814-2b3e-4209-a30f-0ca4d4e50661#%EF%B8%8F-error-handling)

----------

## 👥 User Routes

_Base URL: `/user`_

### 🛒 Product Discovery

#### Get All Products

```http
http://localhost:3000/api/user/
```

**Description:** Retrieve all available products in the marketplace  
**Authentication:** Not required  
**Response:** Array of product objects


----------

### 🔑 Authentication & Profile

#### Register User

```http
POST http://localhost:3000/api/user/register
```

**Body:**

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Test1234",
  "phone": "9876543210"
}

```

#### Login User

```http
POST http://localhost:3000/api/user/register
```

**Body:**

```json
{
  "email": "testuser@example.com",
  "password": "Test1234"
}

```

#### Get User Profile

```http
GET http://localhost:3000/api/user/profile
```

**Authentication:** Required  
**Response:** User profile information

----------

### 🛒 Shopping Cart Management

#### Add Item to Cart

```http
POST http://localhost:3000/api/user/cart/add
```

**Authentication:** Required  
**Body:**

```json
{
  "productId": "507f1f77bcf86cd799439011",
  "catalogueId": "5f8d0f55b54764421b7156da",
  "quantity": 2,
  "size": "M"
}
```

#### Get Cart Contents

```http
GET http://localhost:3000/api/user/cart/get
```

**Authentication:** Required  
**Response:** Current cart items with product details

#### Remove Item from Cart

```http
POST http://localhost:3000/api/user/cart/remove
```

**Authentication:** Required  
**Body:**

```json
{
  "productId": "507f1f77bcf86cd799439011"
}

```

----------

### 🧾 Order Management

#### Place Order

```http
POST http://localhost:3000/api/user/order

```

**Authentication:** Required  
**Body:**

```json
{
  "isGroupOrder": false,
  "address": {
    "line1": "123 Main St",
    "city": "Bangalore",
    "zipCode": "560001"
  },
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "catalogueId": "5f8d0f55b54764421b7156da",
      "quantity": 1,
      "size": "M"
    }
  ]
}

```

#### Get Order History

```http
GET http://localhost:3000/api/user/orders

```

**Authentication:** Required  
**Response:** Array of user's order history

----------

### 🌱 Eco-Friendly Features

#### Get Nearby Orders

```http
GET http://localhost:3000/api/user/orders/nearby
```

**Authentication:** Required  
**Description:** Find orders in your vicinity for eco-friendly delivery clustering

#### Get User Eco Statistics

```http
GET http://localhost:3000/api/user/eco-stats
```

**Authentication:** Required  
**Response:**

```json
{
  "carbonSaved": "45.2 kg",
  "localPurchases": 23,
  "ecoScore": 87,
  "greenBadges": ["Local Hero", "Carbon Reducer"]
}

```

----------

## 🏪 Seller Routes

_Base URL: `http://localhost:3000/api/seller`

### 🔑 Seller Authentication

#### Register Seller

```http
POST http://localhost:3000/api/seller/seller/register
```

**Body:**

```json
{
  "shopName": "Test Shop",
  "email": "seller@example.com",
  "password": "Test1234",
  "phone": "9876543210",
  "sellerType": "branded"
}
```

#### Login Seller

```http
POST http://localhost:3000/api/seller/login
```

**Body:**

```json
{
  "email": "seller@example.com",
  "password": "Test1234"
}

```

----------

### 👤 Seller Profile Management
#### Get Seller Profile by id

```http
GET http://localhost:3000/api/seller/profile/:id
```

**Authentication:** Not Required 

#### Get Seller Profile

```http
GET http://localhost:3000/api/seller/profile
```

**Authentication:** Required (Seller)

#### Add Advanced Seller Details

```http
PUT http://localhost:3000/api/seller/details
```

**Authentication:** Required (Seller)  
**Content-Type:** `multipart/form-data`  
**Form Fields:**

-   `shopImages`: Up to 5 shop images
-   `brandAssociations`: Up to 5 brand association documents
-   `purchaseBills`: Up to 5 purchase bill documents
-   Additional business details in JSON format

----------

### 📦 Product Management

#### Add New Product

```http
POST http://localhost:3000/api/seller/products
```

**Authentication:** Required (Seller)  
**Content-Type:** `multipart/form-data`  
**Form Fields:**

-   `image1`, `image2`, `image3`, `image4`: Product images
-   `name`: Product name
-   `description`: Product description
-   `price`: Product price
-   `category`: Product category
-   `ecoFriendly`: Boolean for eco-friendly status

#### Get Seller Products

```http
GET http://localhost:3000/api/seller/product
```

**Authentication:** Required (Seller)  
**Response:** Array of seller's products

#### Verify Eco Claim

```http
POST http://localhost:3000/api/selle/product/verify-eco/507f1f77bcf86cd799439011:id
```

**Authentication:** Required (Seller)  
**Parameters:**

-   `id`: Product ID to verify **Body:**

----------

## ⚙️ Admin Routes

_Base URL: `http://localhost:3000/api/admin`_

### 🔐 Admin Authentication

#### Admin Login

```http
POST http://localhost:3000/api/admin/login

```

**Body:**

```json
{
  "email": "jaideepbose@gmail.com",
  "password": "JAIDEEP1234"
}
```

----------

### 👥 Seller Management

#### Get Pending Sellers

```http
GET http://localhost:3000/api/admin/sellers/pending

```

**Authentication:** Required (Admin)  
**Description:** Retrieve sellers awaiting verification

#### Get All Sellers

```http
GET http://localhost:3000/api//admin/sellers
```

**Authentication:** Required (Admin)

#### Verify Seller

```http
PUT http://localhost:3000/api/admin/sellers/verify/:sellerId

```

**Authentication:** Required (Admin)  
**Parameters:** `sellerId` - ID of seller to verify

#### Block/Unblock Seller

```http
PUT http://localhost:3000/api/admin/sellers/block/:sellerId
PUT http://localhost:3000/api/admin/sellers/unblock/:sellerId

```

**Authentication:** Required (Admin)  
**Parameters:** `sellerId` - ID of seller to block/unblock

----------

### 📊 Catalogue Management

#### Get All Catalogues

```http
GET http://localhost:3000/api/admin/catalogues
```

**Authentication:** Required (Admin)  
**Description:** View all product catalogues in the system

----------

### 📈 Reports & Analytics

#### Export Sellers Report

```http
GET http://localhost:3000/api/admin/reports/sellers

```

**Authentication:** Required (Admin)  
**Response:** CSV file download with seller data

#### Export Catalogues Report

```http
GET http://localhost:3000/api/admin/reports/catalogues

```

**Authentication:** Required (Admin)  
**Response:** CSV file download with catalogue data

----------

## 🔐 Authentication

### JWT Token Structure

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "user|seller|admin",
  "email": "user@example.com",
  "exp": 1735689600
}

```

### Authentication Middleware

-   **authUser**: Validates user authentication
-   **isSeller**: Validates seller authentication
-   **authAdmin**: Validates admin authentication

----------

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2025-06-17T10:30:00Z"
}

```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  },
  "timestamp": "2025-06-17T10:30:00Z"
}

```

----------

## ⚠️ Error Handling

### HTTP Status Codes

| Status Code | Emoji | Description                     |
|------------|-------|---------------------------------|
| 200        | ✅    | Success                         |
| 201        | ✅    | Created                         |
| 400        | ❌    | Bad Request                     |
| 401        | 🔒    | Unauthorized                    |
| 403        | 🚫    | Forbidden                       |
| 404        | 🔍    | Not Found                       |
| 422        | ⚠️    | Validation Error                |
| 500        | 💥    | Internal Server Error           |

### Common Error Codes

-   `INVALID_CREDENTIALS`: Login credentials are incorrect
-   `TOKEN_EXPIRED`: JWT token has expired
-   `VALIDATION_ERROR`: Request data validation failed
-   `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
-   `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
-   `PRODUCT_OUT_OF_STOCK`: Requested product is unavailable

----------

## 🌟 Rate Limiting

-   **General endpoints**: 100 requests per minute
-   **Authentication endpoints**: 5 requests per minute
-   **File upload endpoints**: 10 requests per minute

----------

## 🧪 Testing

### Sample cURL Commands

```bash
# Register a new user
curl -X POST https://api.ecocommerce.com/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Get all products
curl https://api.ecocommerce.com/api/v1/user/

# Add item to cart (authenticated)
curl -X POST https://api.ecocommerce.com/api/v1/user/cart/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "catalogueId": "507f1f77bcf86cd799439012",
    "quantity": 1
  }'

```
----------

## 🌱 Eco-Friendly Features

Our platform is built with sustainability in mind:

-   **🚚 Smart Delivery**: Nearby order clustering reduces carbon footprint
-   **📊 Eco Stats**: Track your environmental impact
-   **🏆 Green Badges**: Earn rewards for sustainable choices
-   **🌿 Verified Products**: Eco-friendly product verification system
-   **📈 Sustainability Scoring**: Rate products on environmental impact

----------

**Happy coding! 🎉 Let's build a more sustainable future together! 🌍**