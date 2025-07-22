# Pizza Shack REST API

A FastAPI-based backend service for the Pizza Shack application with IETF Agent Authentication support, designed for WSO2 Choreo deployment.

## 🚀 Features

### Core Functionality

- **RESTful API** for pizza menu and ordering
- **PostgreSQL/SQLite** database support
- **Auto-populated menu data** on startup
- **CORS enabled** for frontend integration

### 🏗️ Architecture

- **Public endpoints** (menu access)
- **Agent-only endpoints** (system operations)
- **User context endpoints** (OBO token required)
- **Admin endpoints** (elevated permissions)

## 📋 API Endpoints

### Public Endpoints

```http
GET /api/menu                    # Get pizza menu (public)
GET /api/menu/categories         # Get menu categories
GET /health                      # Health check
```

### Agent Token Required

```http
GET /api/system/health           # System health (agent only)
```

### OBO Token Required (User Context)

```http
POST /api/orders                 # Create order (requires user context)
GET /api/orders                  # Get user's orders (with creator info)
GET /api/orders/{order_id}       # Get specific order
```

### Admin Endpoints

```http
GET /api/admin/orders            # Get all orders (admin scope)
GET /api/admin/stats             # System statistics (admin scope)
```

## 🛠️ Local Development Setup

### Prerequisites

- Python 3.11+
- PostgreSQL (optional - defaults to SQLite)
- WSO2 Asgardeo account

### Quick Start

1. **Clone and setup:**

```bash
cd pizza-api
chmod +x start.sh
./start.sh
```

2. **Manual setup:**

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
uvicorn main:app --reload
```

3. **Access the API:**

- API Server: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🗄️ Database Configuration

### SQLite (Default for local development)

```bash
DATABASE_URL=sqlite:///./pizza_shack.db
```

### PostgreSQL (Production)

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/pizzashack
```

## 🔑 Authentication Configuration

### Asgardeo Setup

```bash
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-org
ASGARDEO_CLIENT_ID=your-client-id
ASGARDEO_CLIENT_SECRET=your-client-secret
JWT_ISSUER=https://api.asgardeo.io/t/your-org/oauth2/token
```

## 🎭 Token Types and Usage

### JWT Token Creator Detection

The API automatically detects whether an order was created by a user directly or by an AI agent on behalf of a user:

**User-Created Orders:**

- Standard JWT token with only `sub` claim
- `token_type` stored as "user"
- No `agent_id` in the order record

**AI Agent Orders (On-Behalf-Of):**

- JWT token contains `act` claim (Acting Party)
- `act.sub` contains the agent's identifier
- `token_type` stored as "obo"
- Both `user_id` and `agent_id` are recorded

**Example JWT Token Analysis:**

```python
# User token (direct order)
{
  "sub": "user123",
  "aud": "pizza-app",
  "scope": "pizza:order"
  # No "act" claim = user-created order
}

# OBO token (agent order)
{
  "sub": "user123",           # The actual user
  "act": {
    "sub": "pizza-ai-agent"   # The acting agent
  },
  "aud": "pizza-app",
  "scope": "pizza:order"
}

# Use OBO token
POST /api/orders
Authorization: Bearer <obo_token>
{
  "items": [{"menu_item_id": 1, "quantity": 2}]
}

# Sample GET /api/orders response with creator information
GET /api/orders
Authorization: Bearer <obo_token>

Response:
[
  {
    "id": 1,
    "order_id": "ORD-20241201120000-2",
    "user_id": "user123",
    "agent_id": "pizza-ai-agent",        # Present for agent orders
    "items": [...],
    "total_amount": 23.98,
    "status": "confirmed",
    "token_type": "obo",                 # "obo" for agent, "user" for direct
    "created_at": "2024-12-01T12:00:00Z"
  },
  {
    "id": 2,
    "order_id": "ORD-20241201130000-1", 
    "user_id": "user123",
    "agent_id": null,                    # null for user-created orders
    "items": [...],
    "total_amount": 15.99,
    "status": "confirmed", 
    "token_type": "user",                # Direct user order
    "created_at": "2024-12-01T13:00:00Z"
  }
]
```

## 🌐 WSO2 Choreo Deployment

### Prerequisites

- WSO2 Choreo account
- PostgreSQL database in Choreo

### Deployment Steps

1. **Push to Git repository**
2. **Create component in Choreo:**

   - Type: Service
   - Build Pack: Dockerfile
   - Context Path: /pizza-api
3. **Configure environment variables:**

```yaml
DATABASE_URL: postgresql://user:pass@postgres:5432/pizzashack
ASGARDEO_BASE_URL: https://api.asgardeo.io/t/your-org
ASGARDEO_CLIENT_ID: your-client-id
ALLOWED_ORIGINS: https://your-frontend.choreoapis.dev
```

4. **Deploy and test endpoints**

### Choreo Configuration Files

- `.choreo/component.yaml` - Component configuration
- `.choreo/endpoints.yaml` - Endpoint definitions
- `Dockerfile` - Container build instructions

## 🧪 Testing the API

### Manual Testing

```bash
# Test public endpoint
curl http://localhost:8000/api/menu

# Test with authentication (replace with real token)
curl -H "Authorization: Bearer your-token" \
     http://localhost:8000/api/orders
```

### Using the Interactive Docs

1. Go to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter your JWT token
4. Test endpoints interactively

### Testing Creator Detection

```bash
# Test with user token (no act claim)
curl -H "Authorization: Bearer user-token" \
     -H "Content-Type: application/json" \
     -d '{"items":[{"menu_item_id":1,"quantity":1}]}' \
     http://localhost:8000/api/orders

# Test with OBO token (has act claim)  
curl -H "Authorization: Bearer obo-token" \
     -H "Content-Type: application/json" \
     -d '{"items":[{"menu_item_id":2,"quantity":2}]}' \
     http://localhost:8000/api/orders

# Get orders to see creator information
curl -H "Authorization: Bearer user-token" \
     http://localhost:8000/api/orders
```

## 🔍 Database Schema

### Menu Items

```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(200),
    ingredients TEXT,        -- JSON array
    size_options TEXT,       -- JSON array
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(100),           -- From OBO token
    agent_id VARCHAR(100),          -- From agent token
    customer_info TEXT,             -- JSON
    items TEXT,                     -- JSON array
    total_amount FLOAT,
    status VARCHAR(20) DEFAULT 'pending',
    token_type VARCHAR(20),         -- 'agent' or 'obo'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection:**

```bash
# Check SQLite file permissions
ls -la pizza_shack.db

# Test PostgreSQL connection
psql postgresql://username:password@localhost:5432/pizzashack
```

**Authentication Issues:**

```bash
# Verify JWT token
python -c "import jwt; print(jwt.decode('your-token', options={'verify_signature': False}))"

# Check token scopes
curl -H "Authorization: Bearer token" http://localhost:8000/api/orders
```

**CORS Issues:**

```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Logging

```python
# Enable debug logging
LOG_LEVEL=DEBUG

# View logs
tail -f logs/api.log
```

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
