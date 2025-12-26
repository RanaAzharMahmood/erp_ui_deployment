import React from 'react';
import { Skeleton, TableRow, TableCell } from '@mui/material';

interface TableSkeletonProps {
  /**
   * Number of skeleton rows to display
   * @default 5
   */
  rows?: number;

  /**
   * Number of skeleton columns to display
   * @default 4
   */
  columns?: number;

  /**
   * Height of each skeleton row in pixels
   * @default 53
   */
  rowHeight?: number;
}

/**
 * Table skeleton loader for better loading UX
 * Shows animated skeleton rows while data is loading
 *
 * @example
 * <TableBody>
 *   {isLoading ? (
 *     <TableSkeleton rows={5} columns={6} />
 *   ) : (
 *     data.map((item) => <TableRow key={item.id}>...</TableRow>)
 *   )}
 * </TableBody>
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  rowHeight = 53,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} sx={{ height: rowHeight }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Skeleton
                variant="text"
                animation="wave"
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.06)',
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableSkeleton;
