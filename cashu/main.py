from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .steganography.router import router as steganography_router
from .wallet.api.app import app as wallet_app
from .wallet.wallet import Wallet
from .core.settings import settings
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include both routers
app.include_router(steganography_router)
app.include_router(wallet_app.router)

@app.on_event("startup")
async def startup_event():
    # Initialize wallet with mint host and port
    mint_url = f"https://{settings.mint_host}:{settings.mint_port}"
    db_path = os.path.join(settings.cashu_dir, settings.wallet_name)
    wallet = await Wallet.with_db(
        mint_url,
        db_path,
        name=settings.wallet_name,
        unit=settings.wallet_unit
    )
    # Store wallet in app state for access in routes
    app.state.wallet = wallet