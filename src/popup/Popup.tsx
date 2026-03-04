import React from 'react';
import { Shield, ShieldCheck, Settings, EyeOff, Moon } from 'lucide-react';
import { useExtensionSettings } from '../hooks/useExtensionSettings';

const Popup = () => {
  const { enabled, sensitivity, blurCount, blurFemales, toggleEnabled, toggleBlurFemales, changeSensitivity } = useExtensionSettings();

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeSensitivity(e.target.value);
  };

  return (
    <div dir="rtl" className="w-full max-w-xs sm:max-w-sm max-h-[80vh] p-4 sm:p-5 bg-white text-slate-800 font-sans shadow-2xl rounded-2xl border border-emerald-100 relative overflow-auto">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-50 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors duration-300 ${enabled ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-50' : 'bg-slate-100 text-slate-400'}`}>
            {enabled ? <Moon size={24} className="fill-emerald-600" /> : <Shield size={24} />}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-900">درع التقوى</h1>
            <p className={`text-xs font-bold ${enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
              {enabled ? 'الحماية مفعلة' : 'الحماية معطلة'}
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button 
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span className="sr-only">تفعيل درع التقوى</span>
          <span 
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? '-translate-x-6' : '-translate-x-1'}`}
          />
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-100 flex items-center gap-4 relative z-10">
        <div className="bg-white text-emerald-600 p-3 rounded-xl shadow-sm border border-emerald-50">
          <EyeOff size={20} />
        </div>
        <div>
          <p className="text-sm text-emerald-800 font-bold">الصور المُعتمة</p>
          <p className="text-2xl font-black text-emerald-600 font-mono">{blurCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 mb-2">
          <Settings size={18} className="text-amber-500" />
          <span>إعدادات الحماية</span>
        </div>
        
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label htmlFor="sensitivity" className="block text-xs font-bold text-emerald-800 mb-2">
              مستوى الحساسية
            </label>
            <select 
              id="sensitivity"
              value={sensitivity}
              onChange={handleSensitivityChange}
              disabled={!enabled}
              className="w-full bg-slate-50 border border-emerald-100 text-emerald-900 text-sm font-semibold rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <option value="Low">منخفض (تعتيم إذا التأكد &gt; 80%)</option>
              <option value="Medium">متوسط (تعتيم إذا التأكد &gt; 60%)</option>
              <option value="High">عالي (تعتيم إذا التأكد &gt; 40%)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-medium">
              الحساسية العالية تعني تعتيم صور أكثر، لكن قد تزيد من الحجب الخاطئ.
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-emerald-50">
            <label className="text-xs font-bold text-emerald-800">تعتيم صور الإناث</label>
            <button 
              onClick={toggleBlurFemales}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${blurFemales ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className="sr-only">تعتيم صور الإناث</span>
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${blurFemales ? '-translate-x-6' : '-translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center relative z-10">
        <p className="text-[10px] text-emerald-600/60 font-bold">
          مدعوم بواسطة TensorFlow.js
        </p>
      </div>
    </div>
  );
};

export default Popup;
