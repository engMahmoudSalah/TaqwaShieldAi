import React, { useState, useEffect } from 'react';
import Popup from './popup/Popup';
import { Download, Code, ShieldCheck, ShieldOff, Settings, EyeOff, FileJson, FolderTree, Moon, Sun } from 'lucide-react';
import { useExtensionSettings } from './hooks/useExtensionSettings';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { enabled, toggleEnabled } = useExtensionSettings();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#ddd] dark:bg-[#0a192f] text-slate-900 dark:text-blue-50 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-300">
      {/* Islamic Pattern Background Overlay */}
      <div className="fixed inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white dark:bg-[#112240] shadow-md border border-slate-300 dark:border-blue-800/50 text-slate-600 dark:text-blue-300 hover:bg-slate-50 dark:hover:bg-[#233554] transition-all"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Fixed Floating Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-4">
        <button 
          onClick={toggleEnabled}
          title={enabled ? 'الحماية مفعلة' : 'الحماية معطلة'}
          className={`text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 ring-4 ${
            enabled 
              ? 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-600/30' 
              : 'bg-slate-500 hover:bg-slate-600 ring-slate-500/30 dark:bg-slate-600 dark:hover:bg-slate-700'
          }`}
        >
          {enabled ? <ShieldCheck size={28} /> : <ShieldOff size={28} />}
          <span className="sr-only">
            {enabled ? 'الحماية مفعلة' : 'الحماية معطلة'}
          </span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Header */}
        <header className="mb-12 sm:mb-20 text-center px-4">
          <div className="inline-flex items-center justify-center p-4 sm:p-5 bg-white dark:bg-[#112240] text-emerald-600 dark:text-emerald-400 rounded-full mb-6 sm:mb-8 ring-4 ring-white/50 dark:ring-[#112240]/50 shadow-md">
            <Moon size={48} className="fill-emerald-600 dark:fill-emerald-500 sm:w-14 sm:h-14" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-blue-100 mb-4 sm:mb-6 leading-tight">
            درع التقوى للذكاء الاصطناعي
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 dark:text-blue-300 max-w-3xl mx-auto leading-relaxed">
            إضافة لمتصفح كروم (Manifest V3) جاهزة للاستخدام، تقوم باكتشاف وتعتيم الصور غير اللائقة تلقائياً في الوقت الفعلي باستخدام تقنيات الذكاء الاصطناعي للحفاظ على غض البصر.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Right Column (RTL): Showcase & Features */}
          <div className="lg:col-span-7 space-y-10 sm:space-y-16">
            {/* Features Grid */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-3 text-slate-800 dark:text-blue-200">
                <Settings className="text-emerald-600 dark:text-emerald-400 w-8 h-8" /> الميزات الأساسية
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FeatureCard 
                  icon={<ShieldCheck />} 
                  title="معالجة محلية آمنة" 
                  desc="يتم فحص الصور بالكامل داخل متصفحك. لا يتم إرسال أي بيانات لخوادم خارجية. خصوصيتك محفوظة 100٪." 
                />
                <FeatureCard 
                  icon={<EyeOff />} 
                  title="تعتيم استباقي" 
                  desc="يقوم بتعتيم الصور والفيديوهات قبل ظهورها على الشاشة، ثم يزيل التعتيم إذا كانت آمنة." 
                />
                <FeatureCard 
                  icon={<Settings />} 
                  title="حساسية قابلة للتعديل" 
                  desc="اختر بين مستويات (منخفض، متوسط، عالي) للتحكم في دقة وقوة خوارزمية الحجب." 
                />
                <FeatureCard 
                  icon={<FileJson />} 
                  title="أحدث التقنيات" 
                  desc="مبني باستخدام أحدث معايير إضافات كروم Manifest V3 لضمان الأداء العالي والأمان." 
                />
              </div>
            </section>

            {/* Folder Structure */}
            <section className="bg-white dark:bg-[#112240] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-800/30 shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3 text-slate-800 dark:text-blue-200">
                <FolderTree className="text-emerald-600 dark:text-emerald-400 w-6 h-6" /> هيكل المشروع
              </h2>
              <pre className="text-xs sm:text-sm font-mono text-slate-700 dark:text-blue-300 bg-slate-50 dark:bg-[#0a192f] p-4 sm:p-6 rounded-2xl overflow-x-auto border border-slate-200 dark:border-blue-900/50" dir="ltr">
{`taqwashield-ai/
├── public/
│   ├── manifest.json       # إعدادات الإضافة
│   └── icons/              # أيقونات الإضافة
├── src/
│   ├── background.ts       # Service Worker
│   ├── content.ts          # سكريبت فحص الصور
│   ├── popup/
│   │   ├── Popup.tsx       # واجهة المستخدم (React)
│   │   └── index.html      # نقطة دخول الواجهة
│   └── index.css           # تنسيقات Tailwind
├── vite.config.ts          # إعدادات البناء
└── package.json            # الاعتماديات`}
              </pre>
            </section>

            {/* Installation Instructions */}
            <section className="bg-emerald-700 dark:bg-[#112240] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden border border-emerald-600 dark:border-blue-800/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-3 text-emerald-100 dark:text-emerald-400 relative z-10">
                <Download className="w-8 h-8" /> طريقة التثبيت
              </h2>
              <ol className="space-y-4 sm:space-y-5 text-emerald-50 dark:text-blue-200 list-decimal list-inside marker:text-emerald-300 dark:marker:text-emerald-500 marker:font-bold relative z-10 text-sm sm:text-base">
                <li>قم بتحميل الكود المصدري لهذا المشروع.</li>
                <li>نفذ الأمر <code className="bg-emerald-800 dark:bg-[#0a192f] text-emerald-200 dark:text-emerald-400 px-2 py-1 rounded-lg text-sm font-mono" dir="ltr">npm install</code> لتثبيت الحزم.</li>
                <li>نفذ الأمر <code className="bg-emerald-800 dark:bg-[#0a192f] text-emerald-200 dark:text-emerald-400 px-2 py-1 rounded-lg text-sm font-mono" dir="ltr">npm run build</code> لبناء الإضافة.</li>
                <li>افتح متصفح كروم وانتقل إلى <code className="bg-emerald-800 dark:bg-[#0a192f] text-emerald-200 dark:text-emerald-400 px-2 py-1 rounded-lg text-sm font-mono" dir="ltr">chrome://extensions/</code>.</li>
                <li>قم بتفعيل <strong>وضع المطور (Developer mode)</strong> في الزاوية العلوية.</li>
                <li>انقر على <strong>تحميل إضافة غير معبأة (Load unpacked)</strong> واختر مجلد <code className="bg-emerald-800 dark:bg-[#0a192f] text-emerald-200 dark:text-emerald-400 px-2 py-1 rounded-lg text-sm font-mono" dir="ltr">dist</code>.</li>
                <li>قم بتثبيت الإضافة في شريط الأدوات وتصفح بأمان!</li>
              </ol>
            </section>

            {/* Test Image Section */}
            <section className="bg-white dark:bg-[#112240] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-800/30 shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3 text-slate-800 dark:text-blue-200">
                <EyeOff className="text-rose-500 w-6 h-6" /> اختبار التعتيم الحي
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-blue-300 mb-6 leading-relaxed">
                جرّب مستويات الحساسية على صورة تجريبية آمنة لترى كيف يبدو التعتيم قبل أن تزيله. هذه معاينة توضيحية للشكل فقط، والفحص الفعلي يتم داخل الإضافة.
              </p>
              <BlurDemo />
            </section>
          </div>

          {/* Left Column (RTL): Interactive Popup Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-12 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-[#112240] rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-blue-800/30 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-blue-500"></div>
              <div className="w-full flex items-center justify-between mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-blue-200 flex items-center gap-2">
                  <Code className="text-emerald-600 dark:text-emerald-400 w-5 h-5 sm:w-6 sm:h-6" /> معاينة حية للواجهة
                </h3>
                <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full">
                  تفاعلي
                </span>
              </div>
              
              {/* Render the actual Popup component here */}
              <div className="ring-1 ring-slate-200 dark:ring-blue-800/50 rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-[1.02] w-full max-w-[320px]">
                <Popup />
              </div>
              
              <p className="text-sm text-slate-600 dark:text-blue-300 mt-8 text-center leading-relaxed">
                هذه هي الواجهة الفعلية التي ستظهر لك عند النقر على أيقونة الإضافة في شريط أدوات المتصفح.
                <br /><br />
                يمكنك أيضاً تجربتها بالنقر على زر <strong>"درع التقوى"</strong> العائم أسفل الشاشة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-[#112240] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="text-emerald-600 dark:text-emerald-400 mb-5 bg-emerald-50 dark:bg-emerald-900/20 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ring-1 ring-emerald-100 dark:ring-emerald-800/30">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-blue-100 mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-slate-600 dark:text-blue-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function BlurDemo() {
  const [level, setLevel] = React.useState(1);
  const [shown, setShown] = React.useState(false);
  const px = shown ? 0 : [8, 18, 34][level];
  const names = ['منخفض', 'متوسط', 'عالي'];
  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-blue-800/30">
        <svg viewBox="0 0 800 450" className="w-full h-full block" role="img" aria-label="منظر طبيعي توضيحي" style={{ filter: `blur(${px}px)`, transition: 'filter .35s' }}>
          <defs>
            <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6b26b" /><stop offset="1" stopColor="#f9e2b8" /></linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#sk)" />
          <circle cx="600" cy="130" r="56" fill="#fff4d6" />
          <path d="M0 300 L150 170 L260 260 L400 130 L560 280 L680 200 L800 290 V450 H0Z" fill="#2f6f5e" />
          <path d="M0 360 Q200 300 400 350 T800 340 V450 H0Z" fill="#1b4d40" />
          <rect x="120" y="318" width="70" height="46" fill="#7a4b2a" /><path d="M110 320 L155 280 L200 320Z" fill="#a33b2c" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {!shown && <span className="px-4 py-2 rounded-full bg-black/60 text-white text-sm font-bold">تم التعتيم</span>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3" role="group" aria-label="مستوى الحساسية">
        {names.map((n, k) => (
          <button key={n} type="button" onClick={() => setLevel(k)} aria-pressed={level === k}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors cursor-pointer ${level === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-[#0a192f] text-slate-700 dark:text-blue-200 border-slate-300 dark:border-blue-800'}`}>{n}</button>
        ))}
        <button type="button" onClick={() => setShown(v => !v)} aria-pressed={shown}
          className="ms-auto px-4 py-2 rounded-full text-sm font-bold bg-slate-800 text-white dark:bg-blue-200 dark:text-[#0a192f] cursor-pointer">{shown ? 'أعد التعتيم' : 'إزالة التعتيم'}</button>
      </div>
    </div>
  );
}
