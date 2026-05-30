import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { ArrowRight, Info } from 'react-feather';
import { Loader2, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/auth-context';
import { type ProjectModeOption } from '../components/project-mode-selector';
import { MAX_AGENT_QUERY_LENGTH, SUPPORTED_IMAGE_MIME_TYPES, type ProjectType } from '@/api-types';
import { useFeature } from '@/features';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { usePaginatedApps } from '@/hooks/use-paginated-apps';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { AppCard } from '@/components/shared/AppCard';
import clsx from 'clsx';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { toast } from 'sonner';
import { useLimitsContext } from '@/contexts/limits-context';
import { checkCanSendPrompt } from '@/utils/usage-limit-checker';
import { PromptBox } from '@/components/prompt-box';
import { MeetDaisanSection, TemplatesTeaser, FinalCTA, LandingFooter } from './home-sections';
import { ModelQualitySelector } from './chat/components/model-quality-selector';
import {
	WorkModeSelector,
	getWorkMode,
	applyWorkModeDirective,
	detectIntent,
	type WorkModeId,
} from './work-modes';

export default function Home() {
	const navigate = useNavigate();
	const { requireAuth } = useAuthGuard();
	const [projectMode, setProjectMode] = useState<ProjectType>('app');
	const [selectedMode, setSelectedMode] = useState<WorkModeId>('consult');
	const [query, setQuery] = useState('');
	const { user } = useAuth();
	const { isLoadingCapabilities, capabilities, getEnabledFeatures } = useFeature();
	const { data: limitsData, loading: usageLimitsLoading } = useLimitsContext();
	const [showLimitDialog, setShowLimitDialog] = useState<React.ReactElement | null>(null);

	const handleConnectCloudflare = useCallback(() => {
		window.location.href = `/oauth/login?return_url=${encodeURIComponent(window.location.href)}`;
	}, []);

	const modeOptions = useMemo<ProjectModeOption[]>(() => {
		if (isLoadingCapabilities || !capabilities) return [];
		return getEnabledFeatures().map((def) => ({
			id: def.id,
			label:
				def.id === 'presentation'
					? 'Slides'
					: def.id === 'general'
						? 'General'
						: 'App',
			description: def.description,
		}));
	}, [capabilities, getEnabledFeatures, isLoadingCapabilities]);


	useEffect(() => {
		if (isLoadingCapabilities) return;
		if (modeOptions.length === 0) {
			if (projectMode !== 'app') setProjectMode('app');
			return;
		}
		if (!modeOptions.some((m) => m.id === projectMode)) {
			setProjectMode(modeOptions[0].id);
		}
	}, [isLoadingCapabilities, modeOptions, projectMode]);

	const { images, addImages, removeImage, clearImages, isProcessing } = useImageUpload({
		onError: (error) => {
			console.error('Image upload error:', error);
			toast.error(error);
		},
	});

	const { isDragging, dragHandlers } = useDragDrop({
		onFilesDropped: addImages,
		accept: [...SUPPORTED_IMAGE_MIME_TYPES],
	});


	const {
		apps,
		loading,
	} = usePaginatedApps({
		type: 'public',
		defaultSort: 'popular',
		defaultPeriod: 'week',
		limit: 6,
	});

	// Discover section should appear only when enough apps are available and loading is done
	const discoverReady = useMemo(() => !loading && (apps?.length ?? 0) > 5, [loading, apps]);

	const handleCreateApp = (query: string, mode: ProjectType) => {
		if (query.length > MAX_AGENT_QUERY_LENGTH) {
			toast.error(
				`Prompt too large (${query.length} characters). Maximum allowed is ${MAX_AGENT_QUERY_LENGTH} characters.`,
			);
			return;
		}

		if (user && usageLimitsLoading) {
			return;
		}

		const encodedQuery = encodeURIComponent(query);
		const encodedMode = encodeURIComponent(mode);

		// Encode images as JSON if present
		const imageParam = images.length > 0 ? `&images=${encodeURIComponent(JSON.stringify(images))}` : '';
		const intendedUrl = `/chat/new?query=${encodedQuery}&projectType=${encodedMode}${imageParam}`;

		if (
			!requireAuth({
				requireFullAuth: true,
				actionContext: 'to create applications',
				intendedUrl: intendedUrl,
			})
		) {
			return;
		}

		// Check usage limits before proceeding
		const limitCheck = checkCanSendPrompt(
			limitsData,
			usageLimitsLoading,
			() => { window.location.href = `/oauth/login?return_url=${encodeURIComponent(window.location.href)}`; },
			() => setShowLimitDialog(null)
		);

		if (!limitCheck.canProceed) {
			setShowLimitDialog(limitCheck.dialogComponent || null);
			return;
		}

		// User is already authenticated, navigate immediately
		navigate(intendedUrl);
		// Clear images after navigation
		clearImages();
	};

	const mode = getWorkMode(selectedMode);

	// Work-mode aware submit: advisory modes ask/advise/plan/teach/review/debug
	// do NOT auto-build — only Build mode produces code. The mode directive is
	// prepended so the AI (with the Daisan work-mode context) honors it.
	const handleWorkModeSubmit = () => {
		const text = query.trim();
		if (!text) return;

		// Build pre-flight: refuse vague build requests.
		if (mode.isBuild && text.length < 15) {
			toast.warning(
				'Build mode: hãy mô tả rõ hơn — trang/component cần build, framework, hệ thống Daisan nào, dùng mock hay API.',
			);
			return;
		}

		// Soft intent nudge: build-like content while in an advisory mode.
		const detected = detectIntent(text);
		if (!mode.isBuild && detected === 'build') {
			toast.info('Nội dung có vẻ là yêu cầu Build. Chọn chế độ "Build" nếu bạn muốn tạo code.');
		}

		handleCreateApp(applyWorkModeDirective(mode, text), projectMode);
	};

	const discoverLinkRef = useRef<HTMLDivElement>(null);

	return (
		<div className="relative flex flex-col items-center size-full">
			{/* Premium gradient hero background + subtle dotted texture */}
			<div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
				{/* Daisan glow: orange -> magenta -> electric blue, sitting under the composer */}
				<div
					className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 h-[70vh] w-[140vw] max-w-[1500px] rounded-full blur-[130px] opacity-25 dark:opacity-45"
					style={{
						background:
							'radial-gradient(closest-side, rgba(255,61,0,0.55), rgba(217,70,239,0.30) 42%, rgba(56,118,255,0.24) 68%, transparent 100%)',
					}}
				/>
				{/* Soft dotted texture */}
				<div className="absolute inset-0 text-accent opacity-[0.07]">
					<svg width="100%" height="100%">
						<defs>
							<pattern id=":S2:" viewBox="-6 -6 12 12" patternUnits="userSpaceOnUse" width="12" height="12">
								<circle cx="0" cy="0" r="1" fill="currentColor"></circle>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#:S2:)"></rect>
					</svg>
				</div>
			</div>

			<LayoutGroup>
				<div className="rounded-md w-full max-w-2xl overflow-hidden">
					<motion.div
						layout
						transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
						className={clsx(
							"px-6 p-8 flex flex-col items-center z-10",
							discoverReady ? "mt-48" : "mt-[20vh] sm:mt-[24vh] md:mt-[28vh]"
						)}>
						<h1 className="text-center font-semibold leading-[1.07] tracking-tight text-4xl sm:text-5xl md:text-[3.5rem] w-full mb-3 bg-clip-text text-transparent bg-gradient-to-br from-text-primary via-text-primary to-accent">
							Build Daisan systems with AI
						</h1>
						<p className="text-center text-text-tertiary text-sm sm:text-base max-w-xl mb-5 leading-relaxed">
							Create PIM modules, storefront pages, B2B workflows, showroom
							dashboards and sales tools — just by chatting with AI.
						</p>

						{/* Work mode selector — AI tư vấn/hỏi/lập kế hoạch trước, chỉ Build khi chọn Build */}
						<WorkModeSelector value={selectedMode} onChange={setSelectedMode} className="mb-2.5" />
						<p className="mb-4 max-w-xl text-center text-xs leading-relaxed text-text-tertiary/80">
							{mode.behaviorNote}
						</p>

						<PromptBox
							value={query}
							onChange={setQuery}
							onSubmit={handleWorkModeSubmit}
							placeholder={mode.placeholder}
							images={images}
							onAddImages={addImages}
							onRemoveImage={removeImage}
							isProcessing={isProcessing || (user ? usageLimitsLoading : false)}
							isDragging={isDragging}
							dragHandlers={dragHandlers}
							submitDisabled={user ? usageLimitsLoading : false}
							limitsData={user ? limitsData : undefined}
							onConnectCloudflare={handleConnectCloudflare}
							variant="expanded"
							submitIcon={user && usageLimitsLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
							leftActions={
								<div className="flex items-center gap-2">
									<ModelQualitySelector />
								</div>
							}
						/>

						{/* Build-mode warning */}
						{mode.isBuild && (
							<div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
								<Hammer className="size-3.5 shrink-0" />
								Build mode sẽ tạo code/giao diện. AI sẽ chạy pre-flight và hỏi lại nếu thiếu thông tin.
							</div>
						)}

						{/* Quick examples theo mode */}
						<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
							{mode.examples.map((ex) => (
								<button
									key={ex}
									type="button"
									onClick={() => setQuery(ex)}
									className="rounded-full border border-border-primary bg-bg-2/40 px-3 py-1 text-xs text-text-tertiary transition-colors hover:border-accent/40 hover:text-text-primary"
								>
									{ex}
								</button>
							))}
						</div>

						{/* Advisory tagline */}
						<p className="mt-5 max-w-lg text-center text-xs leading-relaxed text-text-tertiary/70">
							Daisan.ai sẽ tư vấn trước, lập kế hoạch khi cần, và chỉ build khi bạn chọn{' '}
							<span className="font-medium text-accent">Build</span> hoặc xác nhận rõ ràng.
						</p>

						{/* Daisan use-cases */}
						<div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-text-tertiary">
							{['PIM', 'DaisanStore', 'B2B', 'B2C', 'Showroom', 'Lead/RFQ', 'Deployment'].map((u, i) => (
								<span key={u} className="flex items-center gap-3">
									{i > 0 && <span className="size-1 rounded-full bg-text-tertiary/40" />}
									{u}
								</span>
							))}
						</div>
					</motion.div>

				</div>

				<AnimatePresence>
					{images.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="w-full max-w-2xl px-6"
						>
							<div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-bg-4/50 dark:bg-bg-2/50 border border-accent/20 dark:border-accent/30 shadow-sm">
								<Info className="size-4 text-accent flex-shrink-0 mt-0.5" />
								<p className="text-xs text-text-tertiary leading-relaxed">
									<span className="font-medium text-text-secondary">Images Beta:</span> Images guide app layout and design but may not be replicated exactly. The coding agent cannot access images directly for app assets.
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{discoverReady && (
						<motion.section
							key="discover-section"
							layout
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
							className={clsx('max-w-6xl mx-auto px-4 z-10', images.length > 0 ? 'mt-10' : 'mt-16 mb-8')}
						>
							<div className='flex flex-col items-start'>
								<h2 className="text-2xl font-medium text-text-secondary/80">Discover Apps built by the community</h2>
								<div ref={discoverLinkRef} className="text-md font-light mb-4 text-text-tertiary hover:underline underline-offset-4 select-text cursor-pointer" onClick={() => navigate('/discover')} >View All</div>
								<motion.div
									layout
									transition={{ duration: 0.4 }}
									className="grid grid-cols-2 xl:grid-cols-3 gap-6"
								>
									<AnimatePresence mode="popLayout">
										{apps.map(app => (
											<AppCard
												key={app.id}
												app={app}
												onClick={() => navigate(`/app/${app.id}`)}
												showStats={true}
												showUser={true}
												showActions={false}
											/>
										))}
									</AnimatePresence>
								</motion.div>
							</div>
						</motion.section>
					)}
				</AnimatePresence>
			</LayoutGroup>

			{/* Marketing sections */}
			<MeetDaisanSection />
			<TemplatesTeaser onUse={(prompt) => handleCreateApp(prompt, projectMode)} />
			<FinalCTA onStart={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
			<LandingFooter />

			{/* Nudge towards Discover */}
			{user && <CurvedArrow sourceRef={discoverLinkRef} target={{ x: 50, y: window.innerHeight - 60 }} />}

			{/* Usage limit dialogs */}
			{showLimitDialog}
		</div>
	);
}



type ArrowProps = {
	/** Ref to the source element the arrow starts from */
	sourceRef: React.RefObject<HTMLElement | null>;
	/** Target point in viewport/client coordinates */
	target: { x: number; y: number };
	/** Curve intensity (0.1 - 1.5 is typical) */
	curvature?: number;
	/** Optional pixel offset from source element edge */
	sourceOffset?: number;
	/** If true, hides the arrow when the source is offscreen/not measurable */
	hideWhenInvalid?: boolean;
};

type Point = { x: number; y: number };

export const CurvedArrow: React.FC<ArrowProps> = ({
	sourceRef,
	target,
	curvature = 0.5,
	sourceOffset = 6,
	hideWhenInvalid = true,
}) => {
	const [start, setStart] = useState<Point | null>(null);
	const [end, setEnd] = useState<Point | null>(null);

	const rafRef = useRef<number | null>(null);
	const roRef = useRef<ResizeObserver | null>(null);

	const compute = () => {
		const el = sourceRef.current;
		if (!el) {
			setStart(null);
			setEnd(null);
			return;
		}

		const rect = el.getBoundingClientRect();
		if (!rect || rect.width === 0 || rect.height === 0) {
			setStart(null);
			setEnd(null);
			return;
		}

		const endPoint: Point = { x: target.x, y: target.y };

		// Choose an anchor on the source: midpoint of the side facing the target
		const centers = {
			right: { x: rect.right, y: rect.top + rect.height / 2 },
			left: { x: rect.left, y: rect.top + rect.height / 2 },
		};

		// Distances to target from each side center
		const dists = Object.fromEntries(
			Object.entries(centers).map(([side, p]) => [
				side,
				(p.x - endPoint.x) ** 2 + (p.y - endPoint.y) ** 2,
			])
		) as Record<keyof typeof centers, number>;

		const bestSide = (Object.entries(dists).sort((a, b) => a[1] - b[1])[0][0] ||
			"right") as keyof typeof centers;

		// Nudge start point slightly outside the element for visual clarity
		const nudge = (p: Point, side: keyof typeof centers, offset: number) => {
			switch (side) {
				case "right":
					return { x: p.x + offset, y: p.y };
				case "left":
					return { x: p.x - offset, y: p.y };
			}
		};

		const startPoint = nudge(centers[bestSide], bestSide, sourceOffset);

		setStart(startPoint);
		setEnd(endPoint);
	};

	// Throttle updates with rAF to avoid layout thrash
	const scheduleCompute = () => {
		if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(compute);
	};

	useEffect(() => {
		scheduleCompute();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [target.x, target.y, sourceRef.current]);

	useEffect(() => {
		const onScroll = () => scheduleCompute();
		const onResize = () => scheduleCompute();

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);

		// Track source element size changes
		const el = sourceRef.current;
		if ("ResizeObserver" in window) {
			roRef.current = new ResizeObserver(() => scheduleCompute());
			if (el) roRef.current.observe(el);
		}

		scheduleCompute();

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
			if (roRef.current && el) roRef.current.unobserve(el);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const d = useMemo(() => {
		if (!start || !end) return "";

		const dx = end.x - start.x;
		const dy = end.y - start.y;

		// Control points: bend the curve based on the primary axis difference.
		// This gives a nice S or C curve without sharp kinks.
		const cpOffset = Math.max(Math.abs(dx), Math.abs(dy)) * curvature;

		const c1: Point = { x: start.x + cpOffset * (dx >= 0 ? 1 : -1), y: start.y };
		const c2: Point = { x: end.x - cpOffset * (dx >= 0 ? 1 : -1), y: end.y };

		return `M ${start.x},${start.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`;
	}, [start, end, curvature]);

	const hidden = hideWhenInvalid && (!start || !end);

	if (start && end && (end.y - start.y > 420 || start.x - end.x < 100)) {
		return null;
	}

	return (
		<svg
			aria-hidden="true"
			style={{
				position: "fixed",
				inset: 0,
				width: "100vw",
				height: "100vh",
				pointerEvents: "none",
				overflow: "visible",
				zIndex: 9999,
				display: hidden ? "none" : "block",
			}}
		>
			<defs>
				<filter id="discover-squiggle" x="-20%" y="-20%" width="140%" height="140%">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="3" result="noise" />
					<feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
				</filter>
				<marker id="discover-arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth" opacity={0.20}>
					<path d="M 0 1.2 L 7 4" stroke="var(--color-text-tertiary)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
					<path d="M 0 6.8 L 7 4" stroke="var(--color-text-tertiary)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
				</marker>
			</defs>

			<path
				d={d}
				// stroke="var(--color-accent)"
				stroke="var(--color-text-tertiary)"
				strokeOpacity={0.20}
				strokeWidth={1.6}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				markerEnd="url(#discover-arrowhead)"
			/>
			{/* Soft squiggle overlay for hand-drawn feel */}
			<g filter="url(#discover-squiggle)">
				<path
					d={d}
					// stroke="var(--color-accent)"
					stroke="var(--color-text-tertiary)"
					strokeOpacity={0.12}
					strokeWidth={1}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray="8 6 4 9 5 7"
					vectorEffect="non-scaling-stroke"
				/>
			</g>
		</svg>
	);
};
