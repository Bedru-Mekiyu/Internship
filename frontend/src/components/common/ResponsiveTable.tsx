import { type ReactNode } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';

interface ResponsiveTableProps {
  children: ReactNode;
  minWidth?: number;
}

export function ResponsiveTable({
  children,
  minWidth = 560,
}: ResponsiveTableProps) {
  return (
    <TableContainer
      sx={{
        overflowX: 'auto',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Table sx={{ minWidth }} aria-label="data table">
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  hover?: boolean;
}

export function ResponsiveTableRow({ children, hover = true }: ResponsiveTableRowProps) {
  return (
    <TableRow
      hover={hover}
      sx={{
        '& .MuiTableCell-root': {
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        '&:hover': { bgcolor: 'background.default' },
        '&:last-child .MuiTableCell-root': { borderBottom: 'none' },
      }}
    >
      {children}
    </TableRow>
  );
}

export function TableEmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={10} align="center">
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3 }}>
          {message}
        </Typography>
      </TableCell>
    </TableRow>
  );
}