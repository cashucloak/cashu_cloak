import os
from typing import Optional
from PIL import Image
import numpy as np
from ..core.base import Token

def get_image_path(image_name: str) -> str:
    """Get the full path to an image in the test_pictures folder.
    
    Args:
        image_name: Name of the image file
        
    Returns:
        Full path to the image
    """
    # Get the project root directory (where test_pictures folder is)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    image_path = os.path.join(project_root, "test_pictures", image_name)
    
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_name} in test_pictures folder")
    
    return image_path

def hide_token(token: str, image_path: str) -> str:
    """Hide a Cashu token in an image using LSB steganography.
    
    Args:
        token: The Cashu token to hide
        image_path: Path to the image file
        
    Returns:
        Path to the modified image containing the hidden token
    """
    # Convert token to binary
    token_bytes = token.encode('utf-8')
    binary_token = ''.join(format(byte, '08b') for byte in token_bytes)
    print(f"[hide_token] Token: {token}")
    print(f"[hide_token] Binary token length: {len(binary_token)} bits")
    print(f"[hide_token] First 64 bits of binary token: {binary_token[:64]}")
    
    # Load and prepare image
    img = Image.open(image_path)
    print(f"[DEBUG] Original image mode: {img.mode}")
    if img.mode != 'RGB':
        img = img.convert('RGB')
    pixels = np.array(img)
    print(f"[DEBUG] Pixel array shape: {pixels.shape}")
    
    # Check if image can hold the token
    max_bytes = pixels.size // 8
    if len(token_bytes) > max_bytes:
        raise ValueError(f"Image too small to hide token. Need {len(token_bytes)} bytes but image can only hold {max_bytes} bytes")
    
    # Add length of message to the beginning
    length = format(len(binary_token), '032b')
    binary_data = length + binary_token
    print(f"[hide_token] Length prefix (32 bits): {length}")
    print(f"[hide_token] First 64 bits of binary_data: {binary_data[:64]}")
    
    # Modify pixels to hide data
    data_index = 0
    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            for k in range(pixels.shape[2]):
                if data_index < len(binary_data):
                    pixels[i, j, k] = (pixels[i, j, k] & 254) | int(binary_data[data_index])
                    data_index += 1
                else:
                    break
    
    # Save the modified image (overwrite original)
    stego_img = Image.fromarray(pixels)
    stego_img.save(image_path, format='PNG')
    print(f"[hide_token] Saving stego image to: {image_path}")
    
    return image_path

def reveal_token(image_path: str) -> str:
    """Extract a hidden Cashu token from an image.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        The extracted Cashu token
    """
    # Load image
    img = Image.open(image_path)
    print(f"[DEBUG] Original image mode: {img.mode}")
    if img.mode != 'RGB':
        img = img.convert('RGB')
    pixels = np.array(img)
    print(f"[DEBUG] Pixel array shape: {pixels.shape}")
    
    # Extract the binary data
    binary_data = ''
    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            for k in range(pixels.shape[2]):
                binary_data += str(pixels[i, j, k] & 1)
                if len(binary_data) == 32:
                    print(f"[reveal_token] First 32 bits (length prefix): {binary_data}")
                    length = int(binary_data[:32], 2)
                    print(f"[reveal_token] Length to extract: {length} bits")
                if len(binary_data) >= 32 + 8 and 'length' in locals():
                    # Print the first 64 bits for sanity
                    print(f"[reveal_token] First 64 bits of binary_data: {binary_data[:64]}")
                if len(binary_data) >= 32 + length if 'length' in locals() else False:
                    binary_message = binary_data[32:32+length]
                    message_bytes = int(binary_message, 2).to_bytes((length + 7) // 8, byteorder='big')
                    print(f"[reveal_token] Reading image: {image_path}")
                    return message_bytes.decode('utf-8')
    
    raise ValueError("No token found in image")

def hide_token_with_default_dir(token: str, image_path: str) -> str:
    if not os.path.isabs(image_path):
        image_path = get_image_path(image_path)
    return hide_token(token, image_path)

def reveal_token_with_default_dir(image_path: str) -> str:
    if not os.path.isabs(image_path):
        image_path = get_image_path(image_path)
    return reveal_token(image_path) 