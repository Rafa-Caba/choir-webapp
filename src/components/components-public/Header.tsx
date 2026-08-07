// src/components/components-public/Header.tsx

import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../assets/styles/components/_header.scss';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useSettingsStore } from '../../store/public/useSettingsStore';

export const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromAdmin = new URLSearchParams(location.search).get('fromAdmin') === 'true';
    const { choirCode, choir } = usePublicGlobal();
    const settings = useSettingsStore((state) => (
        state.loadedChoirCode === choirCode ? state.settings : null
    ));
    const title = settings?.webTitle?.trim() || choir?.name || 'Coro';

    return (
        <header className="layout-header">
            <div className="titulo-nav px-0 col-12 d-flex flex-column">
                <div className="titulo mx-5 text-black d-flex flex-column flex-md-row justify-content-md-between align-items-md-center">
                    <div className="titulo text-center text-md-start">
                        <h1>{title}</h1>
                    </div>
                    {fromAdmin ? (
                        <div className="text-end mt-2 mt-md-0">
                            <Link to="/admin" className="btn btn-outline-secondary btn-sm fw-bold">
                                ← Volver al Admin
                            </Link>
                        </div>
                    ) : (
                        <button
                            className="btn btn-outline-secondary fs-6 btn-sm fw-bold"
                            onClick={() => navigate('/admin', { replace: true })}
                        >
                            Ir al admin
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
