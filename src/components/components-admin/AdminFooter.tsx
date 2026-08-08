// src/components/components-admin/AdminFooter.tsx

import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    Box,
    Typography,
} from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { useAdminSettingsStore } from '../../store/admin/useSettingsStore';

export const AdminFooter = () => {
    const { user, loading, hasTenantContext } = useAuth();
    const { settings, fetchSettings } = useAdminSettingsStore();

    const isAuthenticated = Boolean(user);

    useEffect(() => {
        if (!loading && isAuthenticated && hasTenantContext) {
            void fetchSettings();
        }
    }, [loading, isAuthenticated, hasTenantContext, fetchSettings]);

    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                px: {
                    xs: 2,
                    md: 3,
                },
                py: {
                    xs: 2,
                    md: 1.5,
                },
                display: 'flex',
                flexDirection: {
                    xs: 'column',
                    md: 'row',
                },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-button-text)',
                borderTop: '1px solid var(--color-border)',
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 800,
                    color: 'var(--color-button-text)',
                    textAlign: 'center',
                }}
            >
                Creada por Rafael Cabanillas - 2022
            </Typography>

            {isAuthenticated && hasTenantContext && settings && (
                <Box
                    component="nav"
                    aria-label="Redes sociales administrativas"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        component={RouterLink}
                        to={settings.socials.facebook || '/'}
                        aria-label="Facebook"
                        sx={{
                            width: 36,
                            height: 36,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 1.5,
                            color: 'var(--color-button-text)',
                            backgroundColor: 'color-mix(in srgb, var(--color-button-text) 12%, transparent)',
                            '&:hover': {
                                backgroundColor: 'color-mix(in srgb, var(--color-button-text) 22%, transparent)',
                            },
                        }}
                    >
                        <FontAwesomeIcon icon={['fab', 'facebook']} />
                    </Box>

                    <Box
                        component={RouterLink}
                        to={settings.socials.instagram || '/'}
                        aria-label="Instagram"
                        sx={{
                            width: 36,
                            height: 36,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 1.5,
                            color: 'var(--color-button-text)',
                            backgroundColor: 'color-mix(in srgb, var(--color-button-text) 12%, transparent)',
                            '&:hover': {
                                backgroundColor: 'color-mix(in srgb, var(--color-button-text) 22%, transparent)',
                            },
                        }}
                    >
                        <FontAwesomeIcon icon={['fab', 'instagram']} />
                    </Box>

                    <Box
                        component={RouterLink}
                        to={settings.socials.youtube || '/'}
                        aria-label="YouTube"
                        sx={{
                            width: 36,
                            height: 36,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 1.5,
                            color: 'var(--color-button-text)',
                            backgroundColor: 'color-mix(in srgb, var(--color-button-text) 12%, transparent)',
                            '&:hover': {
                                backgroundColor: 'color-mix(in srgb, var(--color-button-text) 22%, transparent)',
                            },
                        }}
                    >
                        <FontAwesomeIcon icon={['fab', 'youtube']} />
                    </Box>
                </Box>
            )}
        </Box>
    );
};