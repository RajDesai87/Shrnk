import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function SettingsView() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setProfileSaving(true);

    try {
      const updated = await api.updateProfile(name.trim());
      updateProfile(updated);
      setProfileMessage('Profile name updated successfully.');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage('');
    setPwdError('');

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwdMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMessage(''), 3000);
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="dash-greeting-block">
        <h2 className="dash-greeting-title">ACCOUNT SETTINGS</h2>
        <p className="dash-greeting-sub">Manage your profile, security, and account preferences.</p>
      </div>

      <div className="dash-settings-grid">
        {/* Section 1: Profile */}
        <div className="dash-section-box">
          <div className="dash-section-box-header">
            <div className="dash-box-title">
              <span className="dash-box-title-square">■</span>
              <span>PROFILE INFORMATION</span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {profileMessage && (
              <div style={{ backgroundColor: '#E6FFD4', border: '2px solid #0D0D0D', padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '16px' }}>
                {profileMessage}
              </div>
            )}
            {profileError && (
              <div style={{ backgroundColor: '#FFE5E5', border: '2px solid #FF4444', padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', color: '#CC0000', marginBottom: '16px' }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="dash-form-group">
                <label className="dash-label">DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dash-input"
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="dash-input"
                  style={{ backgroundColor: '#FAF8F5', color: 'var(--dash-text-muted)', cursor: 'not-allowed', fontFamily: 'var(--dash-font-mono)' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginTop: '4px', display: 'block' }}>
                  Email address cannot be changed.
                </span>
              </div>

              <button type="submit" disabled={profileSaving} className="btn-dash-save">
                {profileSaving ? 'SAVING...' : 'SAVE PROFILE'}
              </button>
            </form>
          </div>
        </div>

        {/* Section 2: Security */}
        <div className="dash-section-box">
          <div className="dash-section-box-header">
            <div className="dash-box-title">
              <span className="dash-box-title-square">■</span>
              <span>CHANGE PASSWORD</span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {pwdMessage && (
              <div style={{ backgroundColor: '#E6FFD4', border: '2px solid #0D0D0D', padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '16px' }}>
                {pwdMessage}
              </div>
            )}
            {pwdError && (
              <div style={{ backgroundColor: '#FFE5E5', border: '2px solid #FF4444', padding: '10px 14px', fontWeight: 800, fontSize: '0.85rem', color: '#CC0000', marginBottom: '16px' }}>
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="dash-form-group">
                <label className="dash-label">CURRENT PASSWORD</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="dash-input"
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label">NEW PASSWORD (MIN 8 CHARACTERS)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="dash-input"
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="dash-input"
                />
              </div>

              <button type="submit" disabled={pwdSaving} className="btn-dash-save">
                {pwdSaving ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>

        {/* Section 3: Account Danger Zone */}
        <div className="dash-section-box" style={{ borderColor: 'var(--dash-danger)' }}>
          <div className="dash-section-box-header" style={{ backgroundColor: '#FFF5F5' }}>
            <div className="dash-box-title" style={{ color: 'var(--dash-danger)' }}>
              <span style={{ color: 'var(--dash-danger)' }}>■</span>
              <span>DANGER ZONE</span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px' }}>
              Delete Account
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)', marginBottom: '16px' }}>
              Permanently delete your SHRNK account and all shortened links, click metrics, and historical logs.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-dash-save"
              style={{ backgroundColor: 'var(--dash-danger)', color: '#FFFFFF' }}
            >
              DELETE ACCOUNT
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="dash-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div 
            className="dash-modal-box" 
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="dash-modal-header" style={{ backgroundColor: '#FFE5E5' }}>
              <h3 className="dash-modal-title" style={{ color: 'var(--dash-danger)' }}>
                CONFIRM ACCOUNT DELETION
              </h3>
            </div>

            <div className="dash-modal-body">
              {deleteError && (
                <div style={{
                  backgroundColor: '#FFE5E5',
                  border: '2px solid #FF4444',
                  padding: '8px 12px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#CC0000',
                  marginBottom: '14px',
                }}>
                  {deleteError}
                </div>
              )}
              <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px' }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: '0.84rem', color: 'var(--dash-text-muted)', marginBottom: '24px' }}>
                This action is irreversible. All your URLs and click history will be permanently deleted from the database.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-table-action"
                  style={{ flex: 1, padding: '12px' }}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  className="btn-dash-save"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'var(--dash-danger)', color: '#FFFFFF' }}
                >
                  {deleting ? 'DELETING...' : 'DELETE FOREVER'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsView;
