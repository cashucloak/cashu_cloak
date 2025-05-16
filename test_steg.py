from cashu.steganography.core import hide_token, reveal_token

# Hide the token
hide_token("hello123", "test_pictures/elephant.png")  # This should overwrite fruit.jpg with the stego image

# Reveal the token
token = reveal_token("test_pictures/elephant.png")
print(token)  # Should print "hello123"
