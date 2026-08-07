// src/components/users/TemporaryPasswordDialog.tsx

import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Typography,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

interface TemporaryPasswordDialogProps {
    readonly open: boolean;
    readonly password: string;
    readonly title?: string;
    readonly description?: string;
    readonly onClose: () => void;
}

export const TemporaryPasswordDialog = ({
    open,
    password,
    title = 'Contraseña temporal',
    description = 'Guarda y comparte esta contraseña de forma segura. Solo se mostrará en esta ocasión.',
    onClose,
}: TemporaryPasswordDialogProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (): Promise<void> => {
        await navigator.clipboard.writeText(password);
        setCopied(true);
    };

    const handleClose = (): void => {
        setCopied(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="temporary-password-title"
        >
            <DialogTitle id="temporary-password-title" sx={{ fontWeight: 950 }}>
                {title}
            </DialogTitle>

            <DialogContent>
                <Alert severity="warning" sx={{ mb: 2, fontWeight: 750 }}>
                    {description}
                </Alert>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 1.5,
                        backgroundColor: 'color-mix(in srgb, var(--color-card) 88%, var(--color-primary) 12%)',
                    }}
                >
                    <Typography
                        component="code"
                        sx={{
                            display: 'block',
                            textAlign: 'center',
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            fontWeight: 950,
                            overflowWrap: 'anywhere',
                            color: 'var(--color-text)',
                        }}
                    >
                        {password}
                    </Typography>
                </Paper>

                {copied && (
                    <Box sx={{ mt: 1.5 }}>
                        <Alert severity="success">Contraseña copiada.</Alert>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={() => {
                        void handleCopy();
                    }}
                    disabled={!password}
                    sx={{ fontWeight: 900 }}
                >
                    Copiar
                </Button>
                <Button variant="contained" onClick={handleClose} sx={{ fontWeight: 900 }}>
                    Entendido
                </Button>
            </DialogActions>
        </Dialog>
    );
};
