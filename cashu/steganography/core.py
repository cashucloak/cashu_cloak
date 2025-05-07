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

def hide_token(token: str, image_name: str) -> str:
    """Hide a Cashu token in an image using LSB steganography.
    
    Args:
        token: The Cashu token to hide
        image_name: Name of the image file in test_pictures folder
        
    Returns:
        Path to the modified image containing the hidden token
    """
    # Get full path to the image
    image_path = get_image_path(image_name)
    
    # Convert token to binary
    token_bytes = token.encode('utf-8')
    binary_token = ''.join(format(byte, '08b') for byte in token_bytes)
    
    # Load and prepare image
    img = Image.open(image_path)
    pixels = np.array(img)
    
    # Check if image can hold the token
    max_bytes = pixels.size // 8
    if len(token_bytes) > max_bytes:
        raise ValueError(f"Image too small to hide token. Need {len(token_bytes)} bytes but image can only hold {max_bytes} bytes")
    
    # Add length of message to the beginning
    length = format(len(binary_token), '032b')
    binary_data = length + binary_token
    
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
    
    # Save the modified image back to the original path
    stego_img = Image.fromarray(pixels)
    stego_img.save(image_path)
    
    return image_path

def reveal_token(image_name: str) -> str:
    """Extract a hidden Cashu token from an image.
    
    Args:
        image_name: Name of the image file in test_pictures folder
        
    Returns:
        The extracted Cashu token
    """
    # Get full path to the image
    image_path = get_image_path(image_name)
    
    # Load image
    img = Image.open(image_path)
    pixels = np.array(img)
    
    # Extract the binary data
    binary_data = ''
    for i in range(pixels.shape[0]):
        for j in range(pixels.shape[1]):
            for k in range(pixels.shape[2]):
                binary_data += str(pixels[i, j, k] & 1)
                if len(binary_data) >= 32:  # First get the length
                    length = int(binary_data[:32], 2)
                    if len(binary_data) >= 32 + length:  # Then get the message
                        binary_message = binary_data[32:32+length]
                        # Convert binary message to bytes
                        message_bytes = int(binary_message, 2).to_bytes((length + 7) // 8, byteorder='big')
                        return message_bytes.decode('utf-8')
    
    raise ValueError("No token found in image") 