// src/components/common/AdminCardGrid.tsx

import type { ReactNode } from 'react';
import { Box } from '@mui/material';

interface AdminCardGridProps {
    readonly children: ReactNode;
}

export const AdminCardGrid = ({ children }: AdminCardGridProps) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.25, sm: 1.5, md: 2 },
            alignItems: 'stretch',
        }}
    >
        {children}
    </Box>
);
