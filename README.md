# Cashu Cloak

Cashu Cloak is a mobile app built with React Native and TypeScript allowing you to hide Cashu Tokens inside images and send and receive Lightning Invoices. It is based off of [Cashu Nutshell](https://github.com/cashubtc/nutshell) and [Stegano-rs](https://github.com/steganogram/stegano-rs) that adds steganography capabilities to hide Cashu tokens within images.

Nutshell is a Chaumian Ecash wallet and mint for Bitcoin Lightning based on the Cashu protocol.

Cashu is a free and open-source [Ecash protocol](https://github.com/cashubtc/nuts) based on David Wagner's variant of Chaumian blinding called [Blind Diffie-Hellman Key Exchange](https://cypherpunks.venona.com/date/1996/03/msg01848.html) scheme written down [here](https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406).

**Disclaimer: The author is NOT a cryptographer and this work has not been reviewed. This means that there is very likely a fatal flaw somewhere. Cashu is still experimental and not production-ready.**

# Contributing
Developers are invited to contribute to CashuCloak.

# Getting Started

## Step 1: Install Wallet Dependencies
Install Bitcoin Lightning support, wallet, and mint servers from [Cashu Nutshell](https://github.com/cashubtc/nutshell)

## Step 2: Start Wallet API Daemon
From Root Directory run
``` 
uvicorn cashu.main:app --host 0.0.0.0 --port 4448 

#or
cashu -d
```
**If having issues, disconnect VPN**

You can find the API docs at [http://localhost:4448/docs](http://localhost:4448/docs).

## Step 2: Start Tor
``` 
brew services start tor 

#to stop TOR
brew services stop tor 
```

## Step 3: Start Metro from Mobile Directory

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

```sh
cd mobile
# Using npm
npm start
```

## Step 4: Build and Run Your App from Mobile Directory

Open a new terminal window/pane from the React Native project (Mobile directory), and use the following command to build and run your Android or iOS app:

### Android

```sh
cd mobile
# Using npm
npm run android
```

### iOS

For iOS, install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
cd mobile
# Using npm
npm run ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

## Step 5: Starting App in the Future on Android from Mobile Directory
```
cd mobile
npx react-native run-android
```

### References

- For adding this new React Native code to an existing application: [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- Learn more about React Native see [docs](https://reactnative.dev/docs/getting-started).

### Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

### Learn More about React Native

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Hiding tokens in images using CLI Command 
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

## Other Researched References
- [Awesome Cashu](https://github.com/cashubtc/awesome-cashu)
- [Minibits Wallet](https://github.com/minibits-cash/minibits_wallet)
- [Wrapnuts](https://github.com/wrapnuts/wrapnuts/tree/main)
- [Uniffi Bindgen React Native](https://github.com/jhugman/uniffi-bindgen-react-native)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
