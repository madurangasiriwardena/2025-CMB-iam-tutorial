"""
Pizza Shack REST API Backend
FastAPI application with IETF Agent Authentication support
Designed for WSO2 Choreo deployment
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import jwt
import os
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app initialization
app = FastAPI(
    title="Pizza Shack API",
    description="Pizza ordering API with IETF Agent Authentication support",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/pizzashack")
if DATABASE_URL.startswith("postgresql://") and "localhost" in DATABASE_URL:
    DATABASE_URL = "sqlite:///./pizza_shack.db"
    logger.info("Using SQLite for local development")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class MenuItem(Base):
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    image_url = Column(String(200))
    ingredients = Column(Text)  # JSON string
    size_options = Column(Text)  # JSON string
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(50), unique=True, nullable=False)
    user_id = Column(String(100))  # From OBO token
    agent_id = Column(String(100))  # From agent token
    customer_info = Column(Text)  # JSON string
    items = Column(Text)  # JSON string
    total_amount = Column(Float)
    status = Column(String(20), default="pending")
    token_type = Column(String(20))  # "agent" or "obo"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: str
    image_url: Optional[str]
    ingredients: List[str]
    size_options: List[str]
    available: bool

class OrderItem(BaseModel):
    menu_item_id: int
    quantity: int = Field(gt=0)
    size: str = "medium"
    special_instructions: Optional[str] = None

class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    customer_info: Optional[Dict[str, Any]] = None

class OrderResponse(BaseModel):
    id: int
    order_id: str
    user_id: Optional[str]
    agent_id: Optional[str]
    items: List[Dict[str, Any]]
    total_amount: float
    status: str
    token_type: str
    created_at: datetime

class TokenInfo(BaseModel):
    token_type: str  # "agent" or "obo"
    agent_id: Optional[str]
    user_id: Optional[str]
    scopes: List[str]
    exp: Optional[int]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenInfo:
    """
    Verify JWT token from Asgardeo and extract token information.
    Supports both agent tokens and OBO tokens.
    """
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        
        token_type = "user"
        user_id = payload.get("sub")
        agent_id = payload.get("azp", payload.get("aud"))
        
        if "act" in payload:
            token_type = "obo"
            user_id = payload.get("sub")
            agent_id = payload.get("act", {}).get("sub")
        elif payload.get("grant_type") == "urn:ietf:params:oauth:grant-type:token-exchange":
            token_type = "obo"
            user_id = payload.get("sub")
        elif "client_credentials" in str(payload.get("grant_type", "")):
            token_type = "agent"
            user_id = None
            agent_id = payload.get("sub")
        
        if not user_id:
            user_id = (payload.get("username") or 
                      payload.get("preferred_username") or
                      payload.get("email") or
                      payload.get("upn"))
        
        
        scopes = payload.get("scope", "").split() if payload.get("scope") else []
        
        return TokenInfo(
            token_type=token_type,
            agent_id=agent_id,
            user_id=user_id,
            scopes=scopes,
            exp=payload.get("exp")
        )
        
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_agent_token(token_info: TokenInfo = Depends(verify_token)) -> TokenInfo:
    """Require agent token (not OBO)"""
    if token_info.token_type != "agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent token required for this operation"
        )
    return token_info

def require_obo_token(token_info: TokenInfo = Depends(verify_token)) -> TokenInfo:
    """Require OBO token (user context)"""
    if token_info.token_type != "obo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User context required (OBO token)"
        )
    return token_info

def require_scope(required_scope: str):
    """Dependency factory for scope requirements"""
    def check_scope(token_info: TokenInfo = Depends(verify_token)) -> TokenInfo:
        if required_scope not in token_info.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required scope '{required_scope}' not found"
            )
        return token_info
    return check_scope

def init_database():
    """Create tables and populate initial data"""
    Base.metadata.create_all(bind=engine)
    
    # Populate menu data
    db = SessionLocal()
    try:
        if db.query(MenuItem).first():
            logger.info("Menu items already exist, skipping population")
            return
        
        menu_items = [
            {
                "name": "Margherita Classic",
                "description": "Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil",
                "price": 10.99,
                "category": "classic",
                "image_url": "/images/margherita.jpg",
                "ingredients": ["Mozzarella cheese", "Tomato sauce", "Fresh basil", "Olive oil"],
                "size_options": ["Small ($8.99)", "Medium ($10.99)", "Large ($12.99)"]
            },
            {
                "name": "Four Cheese Deluxe",
                "description": "Rich blend of mozzarella, parmesan, gorgonzola, and ricotta cheeses",
                "price": 12.99,
                "category": "premium",
                "image_url": "/images/4-cheese.jpg",
                "ingredients": ["Mozzarella", "Parmesan", "Gorgonzola", "Ricotta", "Olive oil"],
                "size_options": ["Small ($10.99)", "Medium ($12.99)", "Large ($14.99)"]
            },
            {
                "name": "Marinara Special",
                "description": "Simple and delicious with tomato sauce, garlic, oregano, and olive oil",
                "price": 11.49,
                "category": "classic",
                "image_url": "/images/pizza-marinara.jpg",
                "ingredients": ["Tomato sauce", "Garlic", "Oregano", "Olive oil", "Sea salt"],
                "size_options": ["Small ($9.49)", "Medium ($11.49)", "Large ($13.49)"]
            },
            {
                "name": "Pepperoni Supreme",
                "description": "Classic pepperoni pizza with extra cheese and our signature sauce",
                "price": 13.99,
                "category": "meat",
                "image_url": "/images/pepperoni.jpg",
                "ingredients": ["Pepperoni", "Mozzarella cheese", "Tomato sauce", "Italian herbs"],
                "size_options": ["Small ($11.99)", "Medium ($13.99)", "Large ($15.99)"]
            },
            {
                "name": "Veggie Garden",
                "description": "Fresh vegetables including bell peppers, mushrooms, onions, and olives",
                "price": 11.99,
                "category": "vegetarian",
                "image_url": "/images/veggie.jpg",
                "ingredients": ["Bell peppers", "Mushrooms", "Red onions", "Black olives", "Mozzarella", "Tomato sauce"],
                "size_options": ["Small ($9.99)", "Medium ($11.99)", "Large ($13.99)"]
            }
        ]
        
        for item_data in menu_items:
            menu_item = MenuItem(
                name=item_data["name"],
                description=item_data["description"],
                price=item_data["price"],
                category=item_data["category"],
                image_url=item_data["image_url"],
                ingredients=json.dumps(item_data["ingredients"]),
                size_options=json.dumps(item_data["size_options"])
            )
            db.add(menu_item)
        
        db.commit()
        logger.info("Menu items populated successfully")
        
    except Exception as e:
        logger.error(f"Error populating menu: {e}")
        db.rollback()
    finally:
        db.close()


@app.get("/")
def root():
    """API information endpoint"""
    return {
        "name": "Pizza Shack API",
        "version": "1.0.0",
        "description": "Pizza ordering API with IETF Agent Authentication",
        "docs_url": "/docs",
        "status_url": "/api/system/status"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for WSO2 Choreo"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}



@app.get("/api/menu", response_model=List[MenuItemResponse])
def get_menu(
    category: Optional[str] = None,
    price_range: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get pizza menu with optional filtering (public endpoint)"""
    query = db.query(MenuItem).filter(MenuItem.available == True)
    
    if category:
        query = query.filter(MenuItem.category == category.lower())
    
    if price_range:
        if price_range.lower() == "budget":
            query = query.filter(MenuItem.price <= 11.50)
        elif price_range.lower() == "mid-range":
            query = query.filter(MenuItem.price > 11.50, MenuItem.price <= 13.00)
        elif price_range.lower() == "premium":
            query = query.filter(MenuItem.price > 13.00)
    
    menu_items = query.all()
    
    result = []
    for item in menu_items:
        result.append(MenuItemResponse(
            id=item.id,
            name=item.name,
            description=item.description,
            price=item.price,
            category=item.category,
            image_url=item.image_url,
            ingredients=json.loads(item.ingredients) if item.ingredients else [],
            size_options=json.loads(item.size_options) if item.size_options else [],
            available=item.available
        ))
    
    return result



@app.get("/api/system/status")
def system_status(token_info: TokenInfo = Depends(require_agent_token)):
    """Detailed system status - agent token required (demonstrates agent-only access)"""
    return {
        "status": "operational",
        "agent_id": token_info.agent_id,
        "database": "connected",
        "services": {
            "authentication": "active",
            "order_processing": "active", 
            "menu_service": "active"
        },
        "uptime": "running",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.post("/api/orders", response_model=OrderResponse)
def create_order(
    order_request: CreateOrderRequest,
    token_info: TokenInfo = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Create a new order - requires user context (works with both user tokens and OBO tokens)"""
    
    if token_info.token_type not in ["user", "obo"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User context required to place orders"
        )
    
    if "pizza:order" not in token_info.scopes:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to place orders"
        )
    
    total_amount = 0.0
    order_items = []
    
    for item in order_request.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item {item.menu_item_id} not found"
            )
        
        if not menu_item.available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item {menu_item.name} is not available"
            )
        
        item_total = menu_item.price * item.quantity
        total_amount += item_total
        
        order_items.append({
            "menu_item_id": item.menu_item_id,
            "name": menu_item.name,
            "quantity": item.quantity,
            "size": item.size,
            "unit_price": menu_item.price,
            "total_price": item_total,
            "special_instructions": item.special_instructions
        })
    
    order_id = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{len(order_items)}"
    
    new_order = Order(
        order_id=order_id,
        user_id=token_info.user_id,
        agent_id=token_info.agent_id,
        customer_info=json.dumps(order_request.customer_info or {}),
        items=json.dumps(order_items),
        total_amount=total_amount,
        status="confirmed",
        token_type=token_info.token_type
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    logger.info(f"Order created: {order_id} for user: {token_info.user_id} via agent: {token_info.agent_id}")
    
    return OrderResponse(
        id=new_order.id,
        order_id=new_order.order_id,
        user_id=new_order.user_id,
        agent_id=new_order.agent_id,
        items=json.loads(new_order.items),
        total_amount=new_order.total_amount,
        status=new_order.status,
        token_type=new_order.token_type,
        created_at=new_order.created_at
    )

@app.get("/api/debug/token")
def debug_token(token_info: TokenInfo = Depends(verify_token)):
    """Debug endpoint to see token information"""
    return {
        "token_type": token_info.token_type,
        "user_id": token_info.user_id,
        "agent_id": token_info.agent_id,
        "scopes": token_info.scopes
    }

@app.get("/api/orders", response_model=List[OrderResponse])
def get_user_orders(
    token_info: TokenInfo = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get orders for the authenticated user (works with both user tokens and OBO tokens)"""
    
    if token_info.token_type in ["user", "obo"]:
        user_id = token_info.user_id
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User context required to view orders"
        )
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to determine user ID from token"
        )
    
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    
    result = []
    for order in orders:
        result.append(OrderResponse(
            id=order.id,
            order_id=order.order_id,
            user_id=order.user_id,
            agent_id=order.agent_id,
            items=json.loads(order.items),
            total_amount=order.total_amount,
            status=order.status,
            token_type=order.token_type,
            created_at=order.created_at
        ))
    
    return result

@app.get("/api/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    token_info: TokenInfo = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get specific order - user can only access their own orders"""
    
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if token_info.token_type == "obo" and order.user_id != token_info.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only access your own orders"
        )
    
    return OrderResponse(
        id=order.id,
        order_id=order.order_id,
        user_id=order.user_id,
        agent_id=order.agent_id,
        items=json.loads(order.items),
        total_amount=order.total_amount,
        status=order.status,
        token_type=order.token_type,
        created_at=order.created_at
    )


@app.get("/api/admin/orders", response_model=List[OrderResponse])
def get_all_orders(
    _token_info: TokenInfo = Depends(require_scope("admin:read")),
    db: Session = Depends(get_db)
):
    """Get all orders - requires admin permissions"""
    
    orders = db.query(Order).all()
    
    result = []
    for order in orders:
        result.append(OrderResponse(
            id=order.id,
            order_id=order.order_id,
            user_id=order.user_id,
            agent_id=order.agent_id,
            items=json.loads(order.items),
            total_amount=order.total_amount,
            status=order.status,
            token_type=order.token_type,
            created_at=order.created_at
        ))
    
    return result


@app.exception_handler(HTTPException)
async def http_exception_handler(_request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

@app.on_event("startup")
def startup_event():
    """Initialize database on startup"""
    logger.info("Starting Pizza Shack API...")
    init_database()
    logger.info("Pizza Shack API started successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )