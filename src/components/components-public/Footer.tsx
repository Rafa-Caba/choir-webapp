// src/components/components-public/Footer.tsx

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePublicGlobal } from '../../context/PublicGlobalContext';
import { useSettingsStore } from '../../store/public/useSettingsStore';
import '../../assets/styles/components/_footer.scss';

interface SocialItem {
    readonly label: string;
    readonly url: string;
    readonly icon: ['fab', 'facebook' | 'instagram' | 'youtube'];
}

export const Footer = () => {
    const { choirCode } = usePublicGlobal();
    const settings = useSettingsStore((state) => (
        state.loadedChoirCode === choirCode ? state.settings : null
    ));

    const allSocialItems: SocialItem[] = [
        {
            label: 'Facebook',
            url: settings?.socials.facebook?.trim() ?? '',
            icon: ['fab', 'facebook'],
        },
        {
            label: 'Instagram',
            url: settings?.socials.instagram?.trim() ?? '',
            icon: ['fab', 'instagram'],
        },
        {
            label: 'YouTube',
            url: settings?.socials.youtube?.trim() ?? '',
            icon: ['fab', 'youtube'],
        },
    ];

    const socialItems = allSocialItems.filter(
        (item) => item.url.length > 0,
    );

    return (
        <footer className="layout-footer">
            <div className="footer my-2 d-flex flex-column flex-md-row justify-content-between">
                <div className="copyright ms-0 ms-md-3">
                    <p className="text-theme-color mb-2">
                        Creada por Rafael Cabanillas
                    </p>
                </div>

                {socialItems.length > 0 && (
                    <div className="mb-3 mb-md-0 me-0 me-md-3">
                        <ul className="nav w-100 order-1 d-flex justify-content-center">
                            {socialItems.map((item) => (
                                <li className="nav-item" key={item.label}>
                                    <a
                                        aria-label={item.label}
                                        className="nav-link redes"
                                        href={item.url}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <FontAwesomeIcon icon={item.icon} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </footer>
    );
};
