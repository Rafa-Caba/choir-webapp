// src/components/common/AdminCardPagination.tsx

import { Box, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { PAGE_SIZE_OPTIONS, isPageSize, type PageSize } from '../../types/pagination';

interface AdminCardPaginationProps {
    readonly page: number;
    readonly pageSize: PageSize;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly onPageChange: (page: number) => void;
    readonly onPageSizeChange: (pageSize: PageSize) => void;
    readonly disabled?: boolean;
}

export const AdminCardPagination = ({
    page,
    pageSize,
    totalPages,
    totalItems,
    onPageChange,
    onPageSizeChange,
    disabled = false,
}: AdminCardPaginationProps) => {
    if (totalItems === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' },
                justifyContent: 'space-between',
                gap: 1.25,
                pt: 1,
            }}
        >
            <Typography sx={{ color: 'var(--color-secondary-text)', fontWeight: 800 }}>
                {totalItems} elemento{totalItems === 1 ? '' : 's'}
            </Typography>

            <Pagination
                count={totalPages}
                page={Math.min(page, totalPages)}
                onChange={(_event, nextPage) => onPageChange(nextPage)}
                disabled={disabled}
                shape="rounded"
                color="primary"
                siblingCount={0}
                boundaryCount={1}
                sx={{ alignSelf: 'center' }}
            />

            <TextField
                select
                size="small"
                label="Por página"
                value={String(pageSize)}
                disabled={disabled}
                onChange={(event) => {
                    const nextPageSize = Number(event.target.value);
                    if (isPageSize(nextPageSize)) {
                        onPageSizeChange(nextPageSize);
                    }
                }}
                sx={{ minWidth: 128, maxWidth: 200 }}
            >
                {PAGE_SIZE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={String(option)}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        </Box>
    );
};
