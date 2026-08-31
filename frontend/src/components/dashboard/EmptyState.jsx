import React from 'react';

export function EmptyState({ title = "NOTHING SHRUNK YET.", message = "Your first tiny URL is one click away.", onAction, actionLabel = "+ SHRNK URL →" }) {
  return (
    <div className="dash-empty-state">
      <div className="dash-empty-title">{title}</div>
      <p className="dash-empty-sub">{message}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-topbar-action"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
