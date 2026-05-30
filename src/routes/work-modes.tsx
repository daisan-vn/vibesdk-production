import {
	HelpCircle,
	Lightbulb,
	ClipboardList,
	GraduationCap,
	Bug,
	Eye,
	Hammer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type WorkModeId =
	| 'ask'
	| 'consult'
	| 'plan'
	| 'learn'
	| 'debug'
	| 'review'
	| 'build';

export interface WorkMode {
	id: WorkModeId;
	label: string;
	icon: LucideIcon;
	description: string;
	placeholder: string;
	submitLabel: string;
	examples: string[];
	behaviorNote: string;
	/** Directive prepended to the user prompt so the AI honors the mode. */
	directive: string;
	isBuild?: boolean;
}

export const WORK_MODES: WorkMode[] = [
	{
		id: 'ask',
		label: 'Hỏi',
		icon: HelpCircle,
		description: 'Hỏi kiến thức, khái niệm, giải thích.',
		placeholder: 'Nhập câu hỏi của bạn, ví dụ: PIM là gì và Daisan dùng PIM để làm gì?',
		submitLabel: 'Trả lời',
		examples: ['PIM là gì?', 'Elasticsearch dùng để làm gì?', 'API là gì?'],
		behaviorNote: 'AI giải thích rõ ràng, có ví dụ Daisan, gợi ý bước tiếp theo. Không tự code.',
		directive:
			'[CHẾ ĐỘ HỎI] Chỉ trả lời/giải thích câu hỏi sau, có ví dụ gắn Daisan khi phù hợp, kết thúc bằng gợi ý bước tiếp theo. TUYỆT ĐỐI KHÔNG tạo dự án/website/code.',
	},
	{
		id: 'consult',
		label: 'Tư vấn',
		icon: Lightbulb,
		description: 'AI đóng vai chuyên gia tư vấn.',
		placeholder: 'Mô tả vấn đề cần tư vấn, ví dụ: DaisanStore nên dùng Next.js hay React Vite?',
		submitLabel: 'Tư vấn',
		examples: [
			'Tư vấn kiến trúc DaisanStore',
			'So sánh React Vite và Next.js',
			'Có nên dùng Elasticsearch cho Daisan.vn?',
			'Tích hợp Odoo như thế nào?',
		],
		behaviorNote: 'AI hỏi lại nếu thiếu bối cảnh, đưa 2–3 phương án + ưu/nhược + khuyến nghị + rủi ro. Không code.',
		directive:
			'[CHẾ ĐỘ TƯ VẤN] Đóng vai chuyên gia tư vấn: nếu thiếu bối cảnh hãy hỏi lại; đưa 2–3 phương án kèm ưu/nhược điểm; so sánh; khuyến nghị phương án phù hợp; cảnh báo rủi ro; nêu bước tiếp theo. KHÔNG code.',
	},
	{
		id: 'plan',
		label: 'Kế hoạch',
		icon: ClipboardList,
		description: 'Lập roadmap, checklist, task, timeline.',
		placeholder: 'Mô tả mục tiêu cần lập kế hoạch, ví dụ: Lập kế hoạch 30 ngày xây module marketplace.',
		submitLabel: 'Lập kế hoạch',
		examples: ['Lập kế hoạch 30 ngày xây DaisanStore', 'Lộ trình học React cho đội IT', 'Roadmap tích hợp Odoo'],
		behaviorNote: 'AI chia giai đoạn, task, người phụ trách, output bàn giao, checklist nghiệm thu. Không code.',
		directive:
			'[CHẾ ĐỘ KẾ HOẠCH] Chuyển mục tiêu sau thành roadmap: chia giai đoạn, task, đề xuất người phụ trách, output cần bàn giao, checklist nghiệm thu. KHÔNG code.',
	},
	{
		id: 'learn',
		label: 'Học',
		icon: GraduationCap,
		description: 'AI dạy từ cơ bản đến nâng cao.',
		placeholder: 'Nhập chủ đề muốn học, ví dụ: Dạy React từ cơ bản đến nâng cao cho nhân viên mới.',
		submitLabel: 'Bắt đầu học',
		examples: ['Dạy tôi React từ đầu', 'Giải thích Laravel cho người mới', 'Học Tailwind cho dashboard Daisan'],
		behaviorNote: 'AI xác định trình độ, dạy từ cơ bản đến nâng cao, có ví dụ Daisan + bài tập. Code có giải thích.',
		directive:
			'[CHẾ ĐỘ HỌC/ĐÀO TẠO] Xác định trình độ người học (hỏi nếu cần), dạy chủ đề sau từ cơ bản đến nâng cao, có ví dụ gắn Daisan + bài tập + câu hỏi kiểm tra; nếu có code phải giải thích từng phần. Không code quá nhiều nếu chưa cần.',
	},
	{
		id: 'debug',
		label: 'Sửa lỗi',
		icon: Bug,
		description: 'Đọc lỗi và sửa tối thiểu.',
		placeholder: 'Dán lỗi console, lỗi build hoặc mô tả lỗi cần sửa.',
		submitLabel: 'Phân tích lỗi',
		examples: ['Trang trắng màn hình', 'React Router lỗi', 'Tailwind không chạy'],
		behaviorNote: 'AI đọc lỗi, hỏi thêm file nếu thiếu, tìm nguyên nhân, sửa tối thiểu — không phá code cũ.',
		directive:
			'[CHẾ ĐỘ SỬA LỖI] Đọc lỗi sau, nếu thiếu thông tin hãy hỏi thêm file cần thiết; xác định nguyên nhân; đề xuất cách sửa TỐI THIỂU; KHÔNG viết lại toàn bộ project; KHÔNG xóa code cũ khi chưa rõ; giải thích lỗi do đâu; đưa checklist sau khi sửa.',
	},
	{
		id: 'review',
		label: 'Review',
		icon: Eye,
		description: 'Đánh giá, phản biện code/UI/kiến trúc.',
		placeholder: 'Dán code, prompt, giao diện hoặc kiến trúc cần review.',
		submitLabel: 'Review',
		examples: ['Review giao diện này', 'Kiểm tra prompt này', 'Đánh giá kiến trúc này'],
		behaviorNote: 'AI đánh giá theo tiêu chí, nêu điểm tốt/vấn đề + mức ưu tiên + đề xuất. Không tự sửa.',
		directive:
			'[CHẾ ĐỘ REVIEW] Đánh giá đối tượng sau theo tiêu chí rõ ràng: nêu điểm tốt; nêu vấn đề; xếp mức ưu tiên sửa; đề xuất cải tiến; có thể đưa checklist. KHÔNG tự sửa nếu chưa được yêu cầu.',
	},
	{
		id: 'build',
		label: 'Build',
		icon: Hammer,
		description: 'Tạo code, component, page, app.',
		placeholder: 'Mô tả rõ thứ cần build, ví dụ: Build trang Product Listing cho DaisanStore bằng React + Tailwind.',
		submitLabel: 'Build',
		examples: [
			'Build landing page Daisan AI',
			'Build marketplace giống DaisanStore',
			'Build admin dashboard',
			'Build ProductCard gạch ốp lát',
		],
		behaviorNote: 'Build mode sẽ tạo code/giao diện. AI sẽ chạy pre-flight và hỏi lại nếu thiếu thông tin.',
		directive:
			'[CHẾ ĐỘ BUILD] Người dùng muốn tạo code/giao diện. Trước khi build, nếu yêu cầu thiếu rõ ràng hãy chạy pre-flight và hỏi lại (framework, phạm vi màn hình, mock hay API thật, thuộc hệ thống Daisan nào). Nếu đã đủ rõ thì build.',
		isBuild: true,
	},
];

export const getWorkMode = (id: WorkModeId): WorkMode =>
	WORK_MODES.find((m) => m.id === id) ?? WORK_MODES[1];

/** Build the final prompt sent to the AI: mode directive + user prompt. */
export function applyWorkModeDirective(mode: WorkMode, prompt: string): string {
	return `${mode.directive}\n\n---\n${prompt}`;
}

/** Lightweight intent detection used to nudge when the chosen mode mismatches content. */
export function detectIntent(text: string): WorkModeId | null {
	const t = text.toLowerCase();
	if (/(^|\s)(lỗi|error|blank|console|không chạy|crash|stack trace)/.test(t)) return 'debug';
	if (/(lộ trình|kế hoạch|roadmap|timeline|30 ngày|checklist)/.test(t)) return 'plan';
	if (/(dạy tôi|học |bài học|từ cơ bản|đào tạo)/.test(t)) return 'learn';
	if (/(nên dùng|so sánh|có nên|tư vấn)/.test(t)) return 'consult';
	if (/(đánh giá|review|kiểm tra|phản biện)/.test(t)) return 'review';
	if (/(là gì|giải thích|tại sao|nghĩa là)/.test(t)) return 'ask';
	if (/(build|code|tạo (trang|component|page|app|dashboard)|viết .*\.(jsx|tsx))/.test(t)) return 'build';
	return null;
}

interface WorkModeSelectorProps {
	value: WorkModeId;
	onChange: (id: WorkModeId) => void;
	className?: string;
}

/** Pill/chip selector for the 7 work modes. */
export function WorkModeSelector({ value, onChange, className }: WorkModeSelectorProps) {
	return (
		<div className={`flex flex-wrap items-center justify-center gap-2 ${className ?? ''}`}>
			{WORK_MODES.map((m) => {
				const Icon = m.icon;
				const active = value === m.id;
				return (
					<button
						key={m.id}
						type="button"
						onClick={() => onChange(m.id)}
						aria-pressed={active}
						title={m.description}
						className={
							active
								? 'inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-accent/20'
								: 'inline-flex items-center gap-1.5 rounded-full border border-border-primary bg-bg-2/50 px-3 py-1.5 text-xs text-text-tertiary transition-colors hover:border-accent/40 hover:text-text-primary'
						}
					>
						<Icon className="size-3.5" strokeWidth={2} />
						{m.label}
					</button>
				);
			})}
		</div>
	);
}
