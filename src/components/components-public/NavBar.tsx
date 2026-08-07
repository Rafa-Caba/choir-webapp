// src/components/components-public/NavBar.tsx

import { Link } from 'react-router-dom';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { buildPublicChoirPath } from '../../utils/choirCode';

export const NavBar = () => {
    const { choirCode } = usePublicGlobal();
    const basePath = buildPublicChoirPath(choirCode);

    return (
        <nav className="layout-nav d-flex">
            <ul className="nav w-100 nav-pills nav-fill">
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={basePath}>
                        Inicio
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={`${basePath}/members`}>
                        Miembros
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={`${basePath}/songs`}>
                        Cantos
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={`${basePath}/blog`}>
                        Blog
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={`${basePath}/about`}>
                        Nosotros
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link text-theme-color" to={`${basePath}/contact`}>
                        Contacto
                    </Link>
                </li>
            </ul>
        </nav>
    );
};
