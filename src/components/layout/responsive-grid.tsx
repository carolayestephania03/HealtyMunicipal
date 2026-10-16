
import React, { ReactNode, useState } from 'react';

import {
  View,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';

type ResponsiveGridProps = {
  children: ReactNode;
  maxColumns?: 1 | 2 | 3 | 4;
  minItemWidth?: number;
  gap?: number;
};

export function ResponsiveGrid({
  children,
  maxColumns = 4,
  minItemWidth = 210,
  gap = 12,
}: ResponsiveGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;

    if (Math.abs(nextWidth - containerWidth) > 1) {
      setContainerWidth(nextWidth);
    }
  };

  const breakpointColumns =
    containerWidth >= 920
      ? maxColumns
      : containerWidth >= 580
        ? Math.min(maxColumns, 2)
        : 1;

  const fittingColumns =
    containerWidth > 0
      ? Math.max(
          1,
          Math.floor(
            (containerWidth + gap) / (minItemWidth + gap)
          )
        )
      : 1;

  const columns = Math.min(
    breakpointColumns,
    fittingColumns
  );

  const itemWidth =
    containerWidth > 0
      ? Math.max(
          0,
          (containerWidth - gap * (columns - 1)) / columns
        )
      : undefined;

  return (
    <View
      onLayout={onLayout}
      style={[styles.container, { gap }]}
    >
      {React.Children.toArray(children).map((child, index) => (
        <View
          key={index}
          style={{
            width: itemWidth ?? '100%',
            minWidth: 0,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
});
