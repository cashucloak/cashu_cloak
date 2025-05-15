from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import tempfile
import os
from .core import hide_token, reveal_token

router = APIRouter(prefix="/steganography", tags=["Steganography"])

@router.post("/hide")
async def hide_token_endpoint(
    file: UploadFile = File(...),
    token: str = Form(...),
):
    try:
        # Create a temporary file to store the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Hide the token in the image
        result_path = hide_token(token, temp_path)

        # Optionally, clean up the temp file if you want
        # os.unlink(result_path)

        return FileResponse(
            result_path,
            media_type="image/jpeg",
            filename=file.filename
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reveal")
async def reveal_token_endpoint(
    image: UploadFile = File(...)
):
    try:
        # Create a temporary file to store the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await image.read()
            temp_file.write(content)
            temp_path = temp_file.name

        # Reveal the token from the image
        token = reveal_token(temp_path)

        # Clean up the temporary file
        os.unlink(temp_path)

        return {"success": True, "message": "Token revealed successfully", "data": {"token": token}}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 