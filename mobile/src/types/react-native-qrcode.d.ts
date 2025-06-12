declare module 'react-native-qrcode-svg' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface QRCodeProps extends ViewProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    enableLinearGradient?: boolean;
    linearGradient?: string[];
    getRef?: (ref: any) => void;
  }

  export default class QRCode extends Component<QRCodeProps> {}
} 