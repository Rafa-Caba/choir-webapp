// src/components/components-admin/AdminNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export const AdminNav = () => {
    const location = useLocation();
    const {
        user,
        isAdmin,
        isSuperAdmin,
        canManageContent,
        canManageInstruments,
        canManageMembers,
        canManageSettings,
        canManageSongTypes,
        canManageThemes,
    } = useAuth();
    const choirCode = user?.choirCode || 'eroc1';

    if (!user) return null;

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }

        return (
            location.pathname === path ||
            location.pathname.startsWith(path + '/')
        );
    };

    return (
        <Navbar
            expand="lg"
            className="layout-nav"
        >
            <Container fluid className="justify-content-center">
                {/* Hamburger on md/sm */}
                <Navbar.Toggle aria-controls="admin-nav-collapse" />

                <Navbar.Collapse
                    id="admin-nav-collapse"
                    className="justify-content-center"
                >
                    <Nav className="nav w-100 nav-pills nav-fill align-items-center justify-content-center admin-nav-links-wrapper flex-wrap">
                        <Nav.Item>
                            <Nav.Link
                                as={Link}
                                to="/admin"
                                active={isActive('/admin')}
                                className="admin-nav-link"
                            >
                                Inicio
                            </Nav.Link>
                        </Nav.Item>

                        {isSuperAdmin && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/choirs"
                                    active={isActive('/admin/choirs')}
                                    className="admin-nav-link"
                                >
                                    Coros
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        <Nav.Item>
                            <Nav.Link
                                as={Link}
                                to="/admin/songs"
                                active={isActive('/admin/songs')}
                                className="admin-nav-link"
                            >
                                Cantos
                            </Nav.Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Nav.Link
                                as={Link}
                                to="/admin/gallery"
                                active={isActive('/admin/gallery')}
                                className="admin-nav-link"
                            >
                                Galería
                            </Nav.Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Nav.Link
                                as={Link}
                                to="/admin/blog/view"
                                active={isActive('/admin/blog/view')}
                                className="admin-nav-link"
                            >
                                Blog
                            </Nav.Link>
                        </Nav.Item>

                        {isAdmin && (
                            <>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/users"
                                        active={isActive('/admin/users')}
                                        className="admin-nav-link"
                                    >
                                        Usuarios
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/logs"
                                        active={isActive('/admin/logs')}
                                        className="admin-nav-link"
                                    >
                                        Logs del sitio
                                    </Nav.Link>
                                </Nav.Item>
                            </>
                        )}

                        {canManageInstruments && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/instruments"
                                    active={isActive('/admin/instruments')}
                                    className="admin-nav-link"
                                >
                                    Instrumentos
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        {canManageSongTypes && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/song-types"
                                    active={isActive('/admin/song-types')}
                                    className="admin-nav-link"
                                >
                                    Tipos de Cantos
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        {canManageMembers && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/members"
                                    active={isActive('/admin/members')}
                                    className="admin-nav-link"
                                >
                                    Miembros
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        {canManageContent && (
                            <>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/announcements"
                                        active={isActive('/admin/announcements')}
                                        className="admin-nav-link"
                                    >
                                        Admin Avisos
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link
                                        as={Link}
                                        to="/admin/blog"
                                        active={isActive('/admin/blog')}
                                        className="admin-nav-link"
                                    >
                                        Admin Blogs
                                    </Nav.Link>
                                </Nav.Item>
                            </>
                        )}

                        {canManageSettings && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/settings"
                                    active={isActive('/admin/settings')}
                                    className="admin-nav-link"
                                >
                                    Ajustes de Página
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        {canManageThemes && (
                            <Nav.Item>
                                <Nav.Link
                                    as={Link}
                                    to="/admin/themes"
                                    active={isActive('/admin/themes')}
                                    className="admin-nav-link"
                                >
                                    Temas de Color
                                </Nav.Link>
                            </Nav.Item>
                        )}

                        <Nav.Item>
                            <Nav.Link
                                as={Link}
                                to={`/${choirCode}?fromAdmin=true`}
                                className="admin-nav-link"
                            >
                                Página Pública
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
