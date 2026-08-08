// src/pages/public/Contact.tsx

import { useState } from "react";
import { ContactSection } from "../../components/components-public/ContactSection";

export const Contact = () => {

    const [email, setEmail] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !emailMessage) {
            alert('Por favor completa ambos campos.');
            return;
        }

        alert('El formulario de contacto todavía no está conectado a un servicio de envío.');
    };

    return (
        <ContactSection
            email={email}
            setEmail={setEmail}
            emailMessage={emailMessage}
            setEmailMessage={setEmailMessage}
            handleSubmit={handleSubmit}
        />
    );
}