import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSettings } from '../../context/SettingsContext';
import { useI18n } from '../../utils/i18n';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [local, setLocal] = useState(settings);
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) setLocal(settings);
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(local);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} size="md">
      <div className="space-y-6">
        {/* Aparência */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.appearance')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{t('settings.appearance.theme')}</label>
              <select
                value={local.theme || 'system'}
                onChange={(e) => setLocal({ ...local, theme: e.target.value })}
                className="select-light w-32 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900"
              >
                <option value="system">{t('settings.appearance.theme_system')}</option>
                <option value="light">{t('settings.appearance.theme_light')}</option>
                <option value="dark">{t('settings.appearance.theme_dark')}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Idioma */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.language')}</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">{t('settings.language.label')}</label>
            <select
              value={local.language || 'pt-BR'}
              onChange={(e) => setLocal({ ...local, language: e.target.value })}
              className="select-light w-40 border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900"
            >
              <option value="pt-BR">{t('settings.language.ptBR')}</option>
              <option value="en-US">{t('settings.language.enUS')}</option>
            </select>
          </div>
        </section>
        {/* Geral */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.general')}</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settings.general.compactMode')}</span>
              <input
                type="checkbox"
                checked={!!local.compactMode}
                onChange={(e) => setLocal({ ...local, compactMode: e.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('settings.general.topNotifications')}</span>
              <input
                type="checkbox"
                checked={!!local.showNotifications}
                onChange={(e) => setLocal({ ...local, showNotifications: e.target.checked })}
              />
            </label>
          </div>
        </section>

        {/* Navegação */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.navigation')}</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('settings.navigation.showFutureModules')}</span>
            <input
              type="checkbox"
              checked={!!local.showFutureUpgrade}
              onChange={(e) => setLocal({ ...local, showFutureUpgrade: e.target.checked })}
            />
          </label>
        </section>

        {/* Listas */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.lists')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{t('settings.lists.itemsPerPageServices')}</label>
              <input
                type="number"
                min={1}
                max={50}
                value={Number(local.itemsPerPage) || 5}
                onChange={(e) => setLocal({ ...local, itemsPerPage: Math.max(1, Math.min(50, parseInt(e.target.value || '5', 10))) })}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Atividades */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('settings.sections.activities')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{t('settings.activities.dashboardLimit')}</label>
              <input
                type="number"
                min={1}
                max={50}
                value={Number(local.dashboardActivitiesLimit) || 5}
                onChange={(e) => setLocal({ ...local, dashboardActivitiesLimit: Math.max(1, Math.min(50, parseInt(e.target.value || '5', 10))) })}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{t('settings.activities.pageLimit')}</label>
              <input
                type="number"
                min={1}
                max={50}
                value={Number(local.activitiesPageLimit) || 50}
                onChange={(e) => setLocal({ ...local, activitiesPageLimit: Math.max(1, Math.min(50, parseInt(e.target.value || '50', 10))) })}
                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            className="btn-secondary"
            onClick={() => { resetSettings(); onClose(); }}
          >
            {t('settings.actions.restoreDefaults')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
          >
            {t('settings.actions.save')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;