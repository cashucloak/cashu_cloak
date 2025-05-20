# Cashu Cloak 🔒

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React_Native-0.72.0-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org)

A mobile app built with React Native and TypeScript that allows you to hide Cashu Tokens inside images and send/receive Lightning Invoices. Based on [Cashu Nutshell](https://github.com/cashubtc/nutshell) and [Stegano-rs](https://github.com/steganogram/stegano-rs). See [YouTube video](https://www.youtube.com/watch?v=341GjWFwyPg&t=7s) for demonstration.

<div align="center">
  <img src="mobile/src/assets/images/cashucloak2.png" alt="Cashu Cloak App Screenshot" width="300"/>
  <br/>
  <em>Cashu Cloak - Hide your tokens in plain sight</em>
</div>



## 💭 Inspiration
We've been fascinated by steganography—the art of hiding messages in plain sight. When we first learned about e-cash and its properties as a bearer asset, it struck us that we could do something similar for digital money: "hide" Bitcoin transactions inside images so that only sender and recipient know where to look—and thwart anyone trying to censor or surveil them. We realized we could build a system where transactions are encrypted **and** concealed. 

**"Cryptography protects the message; steganography protects the messenger."** 

## 🌟 Core Features

- **Steganography**: The art of hiding information within other data. Hide Cashu tokens within any image, making transactions invisible to the untrained eye
- **Bitcoin Lightning Integration**: Instant, secure payments through the Lightning Network
- **E-cash Protocols**: Leverage bearer assets for truly private digital transactions
- **Enhanced Security**: End-to-end encryption with built-in Tor support for secure, private transactions on mobile devices
- **Mobile-First**: Native Android and iOS (future build) experience built with React Native and TypeScript
- **Interactive UI**: User-friendly image selection and token management


## 📱 How It Works

### Hiding Tokens in Images

1. Select an image from your gallery
2. Choose the amount to send
3. The app will automatically hide the token in the image
4. Share the image with the recipient

### Revealing Hidden Tokens

1. Open the app
2. Select the image containing the hidden token
3. The app will automatically detect and extract the token
4. Choose to receive the token

## 🤝 Contributing
Developers are invited to contribute to CashuCloak.

## ⚠️ Disclaimer

> The author is NOT a cryptographer and this work has not been reviewed. This means that there is very likely a fatal flaw somewhere. Cashu is still experimental and not production-ready.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm
- React Native development environment setup
- iOS: Xcode and CocoaPods
- Android: Android Studio and JDK
- Tor service

### Installation

1. Install Bitcoin Lightning support, wallet, and mint servers from [Cashu Nutshell](https://github.com/cashubtc/nutshell)

2. **Clone the repository**
```bash
git clone https://github.com/ridwan102/cashu_cloak.git
cd cashu_cloak
```

3. **Install dependencies**
```bash
cd mobile
npm install
```

4. **iOS Setup**
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

5. **Start the development server from Mobile Directory**
```bash
cd mobile
npm start
```

6. **Run the app**

- Open a new terminal, from Mobile directory, use the following command to build and run your Android or iOS app:
```bash
cd mobile

# For iOS
npm run ios

# For Android
npm run android
```

## ⚙️ Configuration & Future Runs

### Wallet API Setup

Start the wallet API daemon:
```bash
uvicorn cashu.main:app --host 0.0.0.0 --port 4448
# or
cashu -d
```

Access API docs at [http://localhost:4448/docs](http://localhost:4448/docs)

### Tor Setup

```bash
# Start Tor
brew services start tor

# Stop Tor
brew services stop tor
```

### Running the Android App

After initial setup, you can start the Android app anytime with:

```bash
cd mobile
npx react-native run-android
```

> **Note**: Make sure you have an Android emulator running or a physical device connected before running this command.

## 🛠️ Development

### Project Structure
```
cashu_cloak/
├── mobile/           # React Native app
│   ├── src/         # Source code
│   ├── ios/         # iOS specific files
│   └── android/     # Android specific files
└── server/          # Backend services
```

### Running Tests
```bash
cd mobile
npm test
```
## Hiding tokens in images using CLI Command 
You can CLI Commands to hide Cashu tokens within images using Steganography. 

Ensure you have installed [Cashu Nutshell](https://github.com/cashubtc/nutshell) before doing so. 

When sending tokens, you'll be prompted to hide the token in an image:
```bash
cashu send 10
Would you like to hide this token inside of an image? [y/N]: y

Available images:
1. elephant.png
2. fruit.png
3. pumpkin.png

Select an image number: 1

Token successfully hidden in image: /path/to/test_pictures/elephant.png
```

To reveal a hidden token from an image:
```bash
cashu reveal elephant.png
Found token in image:

cashuB...

Would you like to receive this token? [Y/n]: y
Token received successfully!
Balance: 10 sat
```

Note: The image must be large enough to hold the token data. The command will warn you if the image is too small.

### Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## 🙏 Acknowledgments

- [Cashu Nutshell](https://github.com/cashubtc/nutshell) - The original project
- [Stegano-rs](https://github.com/steganogram/stegano-rs) - Steganography implementation
- [React Native](https://reactnative.dev) - Mobile framework
- [Awesome Cashu](https://github.com/cashubtc/awesome-cashu) - Resources and references


## 🔗 Other Researched References

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Cashu Protocol](https://github.com/cashubtc/nuts)
- [Minibits Wallet](https://github.com/minibits-cash/minibits_wallet)
- [Wrapnuts](https://github.com/wrapnuts/wrapnuts/tree/main)
- [Uniffi Bindgen React Native](https://github.com/jhugman/uniffi-bindgen-react-native)


