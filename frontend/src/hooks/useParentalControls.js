import React, { useState, useEffect, useCallback } from "react";
import { Settings as Api } from "@/lib/api";
import PinModal from "@/components/PinModal";

export function useParentalControls() {
    const [settings, setSettings] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        Api.get().then(setSettings).catch(() => {});
    }, []);

    const isCategoryLocked = useCallback((catName) => {
        if (!settings?.parental_pin || !settings?.locked_categories || !catName) return false;
        const name = catName.toLowerCase();
        return settings.locked_categories.some(k => name.includes(k.toLowerCase()));
    }, [settings]);

    const unlock = useCallback((action) => {
        if (!settings?.parental_pin) {
            action();
            return;
        }
        setPendingAction(() => action);
        setModalOpen(true);
    }, [settings]);

    const handleSuccess = useCallback(() => {
        setModalOpen(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    }, [pendingAction]);

    const renderModal = () => {
        if (!settings?.parental_pin) return null;
        return (
            <PinModal 
                open={modalOpen} 
                onOpenChange={setModalOpen} 
                correctPin={settings.parental_pin} 
                onSuccess={handleSuccess} 
            />
        );
    };

    return {
        isCategoryLocked,
        unlock,
        renderModal,
    };
}
