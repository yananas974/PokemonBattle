import React, { memo, useMemo, useState, useEffect, useRef } from 'react';

interface VirtualizedGridProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  itemsPerRow: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
}

// ✅ COMPOSANT DE GRILLE VIRTUALISÉE POUR LES PERFORMANCES
function VirtualizedGridComponent<T>({
  items,
  itemHeight,
  containerHeight,
  itemsPerRow,
  renderItem,
  gap = 16
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculer les éléments visibles
  const visibleItems = useMemo(() => {
    const rowHeight = itemHeight + gap;
    const visibleRowsCount = Math.ceil(containerHeight / rowHeight) + 2; // Buffer
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(startRow + visibleRowsCount, Math.ceil(items.length / itemsPerRow));
    
    const visibleElements = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          visibleElements.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }
    
    return {
      items: visibleElements,
      startRow,
      endRow,
      totalRows: Math.ceil(items.length / itemsPerRow)
    };
  }, [items, itemHeight, containerHeight, itemsPerRow, scrollTop, gap]);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  const totalHeight = Math.ceil(items.length / itemsPerRow) * (itemHeight + gap);
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
      className="relative"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.items.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (100 / itemsPerRow) + '%',
              width: `calc(${100 / itemsPerRow}% - ${gap}px)`,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ EXPORT AVEC MEMO POUR L'OPTIMISATION
export const VirtualizedGrid = memo(VirtualizedGridComponent) as <T>(
  props: VirtualizedGridProps<T>
) => React.ReactElement;

// ✅ EXPORT PAR DÉFAUT POUR LE LAZY LOADING
export default VirtualizedGrid;