declare module 'react-native-parallax-scroll-view' {
    import { Component } from 'react';
    import { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
  
    interface ParallaxScrollViewProps extends ScrollViewProps {
      backgroundColor?: string;
      contentBackgroundColor?: string;
      parallaxHeaderHeight: number;
      renderForeground?: () => JSX.Element;
      renderBackground?: () => JSX.Element;
      fadeOutForeground?: boolean;
    }
  
    export default class ParallaxScrollView extends Component<ParallaxScrollViewProps> {}
  }
  