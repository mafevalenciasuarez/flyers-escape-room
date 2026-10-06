import { useGame } from '../state/GameContext.jsx';
import Modal from './Modal.jsx';
import { Button, Es } from './Bilingual.jsx';

function Choice({ legend, legendEs, options, value, onChange, name }) {
  return (
    <fieldset className="setting">
      <legend>
        {legend}
        <Es>{legendEs}</Es>
      </legend>
      <div className="setting-options">
        {options.map((o) => (
          <label key={String(o.value)} className={`setting-option ${value === o.value ? 'is-on' : ''}`} style={o.style}>
            <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ label, labelEs, help, value, onChange }) {
  return (
    <label className="setting setting-toggle">
      <input type="checkbox" role="switch" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span>{label}</span>
        <Es>{labelEs}</Es>
        {help ? <small>{help}</small> : null}
      </span>
    </label>
  );
}

export default function SettingsPanel({ onClose }) {
  const { state, dispatch, t, es } = useGame();
  const s = state.settings;
  const set = (key) => (value) => dispatch({ type: 'SETTING', key, value });
  const sizes = t('sizes');
  const sizesEs = es('sizes');
  const lines = t('lineOptions');

  return (
    <Modal title={t('settingsTitle')} onClose={onClose} labelledBy="settings-title">
      <Es>{es('settingsTitle')}</Es>
      <div className="settings-grid">
        <Choice
          name="size"
          legend={t('textSize')}
          legendEs={es('textSize')}
          value={s.size}
          onChange={set('size')}
          options={sizes.map((label, i) => ({ value: i, label: sizesEs ? `${label} / ${sizesEs[i]}` : label }))}
        />
        <Choice
          name="spacing"
          legend={t('lineSpace')}
          legendEs={es('lineSpace')}
          value={s.spacing}
          onChange={set('spacing')}
          options={lines.map((label, i) => ({ value: i, label }))}
        />
        <Choice
          name="font"
          legend={t('font')}
          legendEs={es('font')}
          value={s.font}
          onChange={set('font')}
          options={[
            { value: 'lexend', label: 'Aa 1', style: { fontFamily: 'Lexend, sans-serif' } },
            { value: 'atkinson', label: 'Aa 2', style: { fontFamily: '"Atkinson Hyperlegible", sans-serif' } },
            { value: 'system', label: 'Aa 3', style: { fontFamily: 'system-ui, sans-serif' } },
          ]}
        />
        <Toggle label={t('contrast')} labelEs={es('contrast')} value={s.contrast} onChange={set('contrast')} />
        <Toggle label={t('calm')} labelEs={es('calm')} help={t('calmHelp')} value={s.calm} onChange={set('calm')} />
        <Toggle label={t('sounds')} labelEs={es('sounds')} value={s.sounds} onChange={set('sounds')} />
        <Toggle label={t('spanish')} value={s.spanish} onChange={set('spanish')} />
      </div>
      <div className="modal-actions">
        <Button icon="check" en={t('close')} es={es('close')} onClick={onClose} />
      </div>
    </Modal>
  );
}
