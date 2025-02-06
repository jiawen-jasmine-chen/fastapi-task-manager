declare module 'react-native-parallax-scroll-view' {
    import { ComponentType, ReactNode } from 'react';
    import { ViewStyle, StyleProp, ScrollViewProps } from 'react-native';
  
    interface ParallaxScrollViewProps extends ScrollViewProps {
      backgroundColor?: string;
      contentBackgroundColor?: string;
      parallaxHeaderHeight: number;
      renderForeground?: () => ReactNode;
      renderBackground?: () => ReactNode;
      renderContentBackground?: () => ReactNode;
      stickyHeaderHeight?: number;
      fadeOutForeground?: boolean;
      outputScaleValue?: number;
      style?: StyleProp<ViewStyle>;
    }
  
    const ParallaxScrollView: ComponentType<ParallaxScrollViewProps>;
  
    export default ParallaxScrollView;
  }
  