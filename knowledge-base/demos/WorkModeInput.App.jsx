/**
 * Daisan.ai — AI Work Mode Input (DEMO độc lập, copy chạy ngay).
 *
 * Cách dùng: tạo app Vite + React + Tailwind, thay src/App.jsx bằng file này.
 *   npm create vite@latest daisan-workmode -- --template react
 *   cài Tailwind (https://tailwindcss.com/docs/guides/vite)
 *   thay App.jsx -> npm run dev
 *
 * KHÔNG dùng dữ liệu thật, KHÔNG gọi API. Chỉ demo logic chế độ làm việc:
 * chọn mode -> đổi placeholder/nút gửi/ví dụ/ghi chú; chỉ "Build" mới chạy
 * nhánh build (có pre-flight); các mode khác đi nhánh tư vấn.
 */
import { useMemo, useState } from "react";

const WORK_MODES = [
  { id: "ask", label: "Hỏi", icon: "❓", description: "Hỏi kiến thức, khái niệm.",
    placeholder: "Nhập câu hỏi, ví dụ: PIM là gì và Daisan dùng PIM để làm gì?",
    submitLabel: "Trả lời", behaviorNote: "AI giải thích rõ ràng, có ví dụ Daisan. Không tự code.",
    examples: ["PIM là gì?", "Elasticsearch dùng để làm gì?", "API là gì?"] },
  { id: "consult", label: "Tư vấn", icon: "💡", description: "AI đóng vai chuyên gia.",
    placeholder: "Mô tả vấn đề, ví dụ: DaisanStore nên dùng Next.js hay React Vite?",
    submitLabel: "Tư vấn", behaviorNote: "AI đưa 2–3 phương án + ưu/nhược + khuyến nghị. Không code.",
    examples: ["Tư vấn kiến trúc DaisanStore", "So sánh React Vite và Next.js", "Có nên dùng Elasticsearch?"] },
  { id: "plan", label: "Kế hoạch", icon: "🗂️", description: "Roadmap, checklist, task.",
    placeholder: "Mô tả mục tiêu, ví dụ: Lập kế hoạch 30 ngày xây module marketplace.",
    submitLabel: "Lập kế hoạch", behaviorNote: "AI chia giai đoạn, task, checklist nghiệm thu. Không code.",
    examples: ["Lập kế hoạch 30 ngày xây DaisanStore", "Lộ trình học React cho đội IT"] },
  { id: "learn", label: "Học", icon: "🎓", description: "Dạy từ cơ bản đến nâng cao.",
    placeholder: "Nhập chủ đề, ví dụ: Dạy React từ cơ bản đến nâng cao cho nhân viên mới.",
    submitLabel: "Bắt đầu học", behaviorNote: "AI dạy từng bước, có ví dụ Daisan + bài tập.",
    examples: ["Dạy tôi React từ đầu", "Giải thích Laravel cho người mới"] },
  { id: "debug", label: "Sửa lỗi", icon: "🐞", description: "Đọc lỗi, sửa tối thiểu.",
    placeholder: "Dán lỗi console, lỗi build hoặc mô tả lỗi cần sửa.",
    submitLabel: "Phân tích lỗi", behaviorNote: "AI tìm nguyên nhân, sửa tối thiểu — không phá code cũ.",
    examples: ["Trang trắng màn hình", "React Router lỗi", "Tailwind không chạy"] },
  { id: "review", label: "Review", icon: "🔍", description: "Đánh giá, phản biện.",
    placeholder: "Dán code, prompt, giao diện hoặc kiến trúc cần review.",
    submitLabel: "Review", behaviorNote: "AI nêu điểm tốt/vấn đề + ưu tiên. Không tự sửa.",
    examples: ["Review giao diện này", "Đánh giá kiến trúc này"] },
  { id: "build", label: "Build", icon: "🔨", description: "Tạo code, component, page.",
    placeholder: "Mô tả rõ thứ cần build, ví dụ: Build trang Product Listing cho DaisanStore (React + Tailwind).",
    submitLabel: "Build", behaviorNote: "Build sẽ tạo code/giao diện. AI chạy pre-flight và hỏi lại nếu thiếu.",
    examples: ["Build landing page Daisan AI", "Build admin dashboard", "Build ProductCard gạch ốp lát"], isBuild: true },
];

const DIRECTIVE = {
  ask: "[CHẾ ĐỘ HỎI] Chỉ trả lời/giải thích, có ví dụ Daisan. KHÔNG tạo website/code.",
  consult: "[CHẾ ĐỘ TƯ VẤN] Đưa 2–3 phương án + ưu/nhược + khuyến nghị + rủi ro. KHÔNG code.",
  plan: "[CHẾ ĐỘ KẾ HOẠCH] Roadmap: giai đoạn, task, người phụ trách, checklist nghiệm thu. KHÔNG code.",
  learn: "[CHẾ ĐỘ HỌC] Dạy từ cơ bản đến nâng cao, ví dụ Daisan + bài tập.",
  debug: "[CHẾ ĐỘ SỬA LỖI] Tìm nguyên nhân, sửa TỐI THIỂU, không phá code cũ.",
  review: "[CHẾ ĐỘ REVIEW] Đánh giá theo tiêu chí, không tự sửa nếu chưa được yêu cầu.",
  build: "[CHẾ ĐỘ BUILD] Pre-flight rồi build.",
};

function detectIntent(t) {
  const s = t.toLowerCase();
  if (/(lỗi|error|blank|console|không chạy)/.test(s)) return "debug";
  if (/(lộ trình|kế hoạch|roadmap|30 ngày)/.test(s)) return "plan";
  if (/(dạy tôi|học |đào tạo)/.test(s)) return "learn";
  if (/(nên dùng|so sánh|có nên|tư vấn)/.test(s)) return "consult";
  if (/(đánh giá|review|kiểm tra)/.test(s)) return "review";
  if (/(là gì|giải thích|tại sao)/.test(s)) return "ask";
  if (/(build|code|tạo (trang|component|page|app)|\.jsx)/.test(s)) return "build";
  return null;
}

export default function App() {
  const [modeId, setModeId] = useState("consult");
  const [query, setQuery] = useState("");
  const [log, setLog] = useState([]);
  const mode = useMemo(() => WORK_MODES.find((m) => m.id === modeId), [modeId]);

  function push(kind, text) {
    setLog((l) => [{ id: Date.now() + Math.random(), kind, text }, ...l].slice(0, 8));
  }

  // Nhánh tư vấn (hỏi/tư vấn/kế hoạch/học/review/sửa lỗi) — KHÔNG build.
  function routeToAdvisoryPipeline(prompt, m) {
    push("advisory", `[${m.label}] ${DIRECTIVE[m.id]}\n→ ${prompt}`);
  }

  // Nhánh build — có pre-flight.
  function runBuildPreflight(prompt) {
    if (prompt.trim().length < 15) {
      push("warn", "Pre-flight: mô tả quá ngắn. Hãy nêu rõ trang/component, framework, hệ thống Daisan, mock hay API.");
      return;
    }
    push("build", `Pre-flight OK → BUILD: ${prompt}`);
  }

  function handleSubmit() {
    const text = query.trim();
    if (!text) return;
    const detected = detectIntent(text);
    if (!mode.isBuild && detected === "build") {
      push("nudge", 'Nội dung có vẻ là yêu cầu Build. Chọn chế độ "Build" nếu muốn tạo code.');
    }
    if (mode.isBuild) runBuildPreflight(text);
    else routeToAdvisoryPipeline(text, mode);
  }

  const logColor = { advisory: "text-sky-300", build: "text-emerald-300", warn: "text-amber-300", nudge: "text-fuchsia-300" };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-3xl sm:text-4xl font-semibold tracking-tight">
          Build Daisan systems with <span className="text-orange-500">AI</span>
        </h1>
        <p className="mt-3 text-center text-sm text-neutral-400">
          Create PIM modules, storefront pages, B2B workflows, showroom dashboards and sales tools — just by chatting with AI.
        </p>

        {/* Mode chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {WORK_MODES.map((m) => (
            <button key={m.id} onClick={() => setModeId(m.id)} title={m.description}
              className={(m.id === modeId
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                : "border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white hover:border-orange-500/40") +
                " inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"}>
              <span>{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500">{mode.behaviorNote}</p>

        {/* Composer */}
        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-3">
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={3}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            placeholder={mode.placeholder}
            className="w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-neutral-600" />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-600">⌘/Ctrl + Enter để gửi</span>
            <button onClick={handleSubmit}
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500">
              {mode.submitLabel}
            </button>
          </div>
        </div>

        {/* Build warning */}
        {mode.isBuild && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
            🔨 Build mode sẽ tạo code/giao diện. AI chạy pre-flight và hỏi lại nếu thiếu thông tin.
          </div>
        )}

        {/* Examples */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {mode.examples.map((ex) => (
            <button key={ex} onClick={() => setQuery(ex)}
              className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-400 hover:text-white hover:border-orange-500/40">
              {ex}
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-500">
          Daisan.ai sẽ tư vấn trước, lập kế hoạch khi cần, và chỉ build khi bạn chọn <span className="text-orange-500 font-medium">Build</span> hoặc xác nhận rõ ràng.
        </p>

        {/* Demo routing log */}
        {log.length > 0 && (
          <div className="mt-8">
            <p className="mb-2 text-xs uppercase tracking-wider text-neutral-600">Demo routing (không gọi API)</p>
            <div className="space-y-2">
              {log.map((l) => (
                <pre key={l.id} className={"whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs " + (logColor[l.kind] || "text-neutral-300")}>{l.text}</pre>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
