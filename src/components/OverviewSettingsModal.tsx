import React from 'react';
import { X, GripVertical, Check, RotateCcw, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { OverviewWidgetConfig } from '../types';

interface OverviewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: OverviewWidgetConfig[];
  onToggleWidget: (id: string) => void;
  onReorderWidgets: (newWidgets: OverviewWidgetConfig[]) => void;
  onResetWidgets: () => void;
}

export const OverviewSettingsModal: React.FC<OverviewSettingsModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onReorderWidgets,
  onResetWidgets,
}) => {
  if (!isOpen) return null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const updated = [...widgets];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onReorderWidgets(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1A1B20] w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#d4af37]/25 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Customize Overview Widgets
              </h2>
            </div>
            <p className="text-xs text-[#797C86] mt-0.5">
              Select which command center modules to show and arrange their display order.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#B8BAC2] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Widgets List */}
        <div className="space-y-2.5">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                widget.visible
                  ? 'bg-[#16171D] border-[#d4af37]/25'
                  : 'bg-[#16171D]/40 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Order Controls */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-[#d4af37] disabled:opacity-20 disabled:hover:text-[#797C86]"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === widgets.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded hover:bg-white/10 text-[#797C86] hover:text-[#d4af37] disabled:opacity-20 disabled:hover:text-[#797C86]"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{widget.title}</span>
                    <span className="text-[10px] text-[#797C86] font-mono">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#797C86] truncate mt-0.5">
                    {widget.description}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => onToggleWidget(widget.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                  widget.visible
                    ? 'bg-[#d4af37]/15 text-[#E5C158] border border-[#d4af37]/30'
                    : 'bg-white/5 text-[#797C86] border border-white/10 hover:text-white'
                }`}
              >
                {widget.visible ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onResetWidgets}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#B8BAC2] hover:text-white text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-b from-[#E5C158] to-[#D4AF37] text-[#121316] font-bold text-xs shadow-md shadow-[#d4af37]/20 active:scale-95 transition"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
