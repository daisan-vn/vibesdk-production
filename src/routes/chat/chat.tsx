import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type FormEvent,
} from 'react';
import { useParams, useSearchParams, useNavigate, useBlocker } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileChatHeader } from './components/mobile-chat-header';
import { BuildStatusBar } from './components/build-status-bar';
import { BlueprintCard } from './components/blueprint-card';
import { BuildLogFeed } from './components/build-log-feed';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, MoreHorizontal, RotateCcw, X } from 'lucide-react';
import clsx from 'clsx';
import { UserMessage, AIMessage } from './components/messages';
import { PhaseTimeline } from './components/phase-timeline';
import { type DebugMessage } from './components/debug-panel';
import { DeploymentControls } from './components/deployment-controls';
import { useChat } from './hooks/use-chat';
import { type ModelConfigsInfo, type BlueprintType, type PhasicBlueprint, SUPPORTED_IMAGE_MIME_TYPES, type ProjectType, type FileType } from '@/api-types';
import { featureRegistry } from '@/features';
import { useFileContentStream } from './hooks/use-file-content-stream';
import { logger } from '@/utils/logger';
import { useApp } from '@/hooks/use-app';
import { useAuth } from '@/contexts/auth-context';
import { useGitHubExport } from '@/hooks/use-github-export';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useImageUpload } from '@/hooks/use-image-upload';
import { useDragDrop } from '@/hooks/use-drag-drop';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { sendWebSocketMessage } from './utils/websocket-helpers';
import { detectContentType, isDocumentationPath, isMarkdownFile } from './utils/content-detector';
import { mergeFiles } from '@/utils/file-helpers';
import { ChatModals } from './components/chat-modals';
import { MainContentPanel } from './components/main-content-panel';
import { ChatInput } from './components/chat-input';
import { type ChatMode } from './components/mode-selector';
import { ThemePanel } from './components/theme-panel';
import { toast } from 'sonner';
import { useVault } from '@/hooks/use-vault';
import { VaultUnlockModal } from '@/components/vault';
import { useLimitsContext } from '@/contexts/limits-context';
import { checkCanSendPrompt, getBackendLimitDialog } from '@/utils/usage-limit-checker';

const isPhasicBlueprint = (blueprint?: BlueprintType | null): blueprint is PhasicBlueprint =>
	!!blueprint && 'implementationRoadmap' in blueprint;

export default function Chat() {
	const { chatId: urlChatId } = useParams();

	const [searchParams] = useSearchParams();
	const userQuery = searchParams.get('query');
	const urlProjectType = searchParams.get('projectType') || 'app';

	// Extract images from URL params if present
	const userImages = useMemo(() => {
		const imagesParam = searchParams.get('images');
		if (!imagesParam) return undefined;
		try {
			return JSON.parse(decodeURIComponent(imagesParam));
		} catch (error) {
			console.error('Failed to parse images from URL:', error);
			return undefined;
		}
	}, [searchParams]);

	// Load existing app data if chatId is provided
	const { app, loading: appLoading, refetch: refetchApp } = useApp(urlChatId);

	// If we have an existing app, use its data
	const displayQuery = app ? app.originalPrompt || app.title : userQuery || '';
	const appTitle = app?.title;

	// Manual refresh trigger for preview
	const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);

	// Debug message utilities
	const addDebugMessage = useCallback(
		(
			type: DebugMessage['type'],
			message: string,
			details?: string,
			source?: string,
			messageType?: string,
			rawMessage?: unknown,
		) => {
			const debugMessage: DebugMessage = {
				id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
				timestamp: Date.now(),
				type,
				message,
				details,
				source,
				messageType,
				rawMessage,
			};

			setDebugMessages((prev) => [...prev, debugMessage]);
		},
		[],
	);

	const clearDebugMessages = useCallback(() => {
		setDebugMessages([]);
	}, []);

	const { state: vaultState, requestUnlock, clearUnlockRequest } = useVault();
	const handleVaultUnlockRequired = useCallback(
		(reason: string) => {
			requestUnlock(reason);
		},
		[requestUnlock],
	);

	const {
		messages,
		edit,
		bootstrapFiles,
		chatId,
		query,
		files,
		isGeneratingBlueprint,
		isBootstrapping,
		totalFiles,
		websocket,
		sendUserMessage,
		blueprint,
		previewUrl,
		clearEdit,
		projectStages,
		phaseTimeline,
		isThinking,
		// Canonical build-job state machine + connection lifecycle
		buildJob,
		connectionState,
		// Deployment and generation control
		isDeploying,
		cloudflareDeploymentUrl,
		deploymentError,
		isRedeployReady,
		isGenerationPaused,
		isGenerating,
		handleStopGeneration,
		handleResumeGeneration,
		handleDeployToCloudflare,
		// Preview refresh control
		shouldRefreshPreview,
		// Preview deployment state
		isPreviewDeploying,
		// Issue tracking and debugging state
		runtimeErrorCount,
		staticIssueCount,
		isDebugging,
		// Behavior type from backend
		behaviorType,
		projectType,
		// Template metadata
		templateDetails,
		// Backend error dialog state
		backendErrorDialog,
		setBackendErrorDialog,
	} = useChat({
		chatId: urlChatId,
		query: userQuery,
		images: userImages,
		projectType: urlProjectType as ProjectType,
		executionMode: searchParams.get('mode') === 'build' ? 'build' : undefined,
		onDebugMessage: addDebugMessage,
		onVaultUnlockRequired: handleVaultUnlockRequired,
	});

	// GitHub export functionality - use urlChatId directly from URL params
	const githubExport = useGitHubExport(websocket, urlChatId, refetchApp);
	const { user } = useAuth();

	const navigate = useNavigate();
	const isMobile = useIsMobile();
	const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

	const [activeFilePath, setActiveFilePath] = useState<string>();
	const [view, setView] = useState<'editor' | 'preview' | 'docs' | 'blueprint' | 'terminal' | 'presentation'>(
		'editor',
	);

	// Terminal state
	// const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);

	// Debug panel state
	const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
	const deploymentControlsRef = useRef<HTMLDivElement>(null);

	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
	const [isGitCloneModalOpen, setIsGitCloneModalOpen] = useState(false);

	// Usage limits state
	const { data: limitsData, loading: limitsLoading } = useLimitsContext();
	const [showLimitDialog, setShowLimitDialog] = useState<React.ReactElement | null>(null);
	
	// Debug: Log when backend error dialog state changes
	useEffect(() => {
		console.log('🔍 Backend error dialog state changed:', backendErrorDialog);
	}, [backendErrorDialog]);

	// Model config info state
	const [modelConfigs, setModelConfigs] = useState<ModelConfigsInfo | undefined>();
	const [loadingConfigs, setLoadingConfigs] = useState(false);

	// Handler for model config info requests
	const handleRequestConfigs = useCallback(() => {
		if (!websocket) return;

		setLoadingConfigs(true);
		websocket.send(JSON.stringify({
			type: 'get_model_configs'
		}));
	}, [websocket]);

	// Listen for model config info WebSocket messages
	useEffect(() => {
		if (!websocket) return;

		const handleMessage = (event: MessageEvent) => {
			try {
				const message = JSON.parse(event.data);
				if (message.type === 'model_configs_info') {
					setModelConfigs(message.configs);
					setLoadingConfigs(false);
				}
			} catch (error) {
				logger.error('Error parsing WebSocket message for model configs:', error);
			}
		};

		websocket.addEventListener('message', handleMessage);

		return () => {
			websocket.removeEventListener('message', handleMessage);
		};
	}, [websocket]);

	type AgentWebSocket = {
		send: (data: string) => void;
		readyState: number;
		addEventListener: (type: 'open', listener: () => void) => void;
		removeEventListener: (type: 'open', listener: () => void) => void;
	};

	const WS_OPEN = 1;

	const sendVaultStatusToAgent = useCallback(
		(ws: AgentWebSocket) => {
			if (vaultState.status === 'unlocked') {
				ws.send(JSON.stringify({ type: 'vault_unlocked' }));
			} else if (vaultState.status === 'locked') {
				ws.send(JSON.stringify({ type: 'vault_locked' }));
			}
		},
		[vaultState.status],
	);

	useEffect(() => {
		if (!websocket) return;

		const ws = websocket as unknown as AgentWebSocket;
		const handleOpen = () => sendVaultStatusToAgent(ws);
		ws.addEventListener('open', handleOpen);

		if (ws.readyState === WS_OPEN) {
			sendVaultStatusToAgent(ws);
		}

		return () => {
			ws.removeEventListener('open', handleOpen);
		};
	}, [sendVaultStatusToAgent, websocket]);

	useEffect(() => {
		if (!websocket) return;
		const ws = websocket as unknown as AgentWebSocket;
		if (ws.readyState !== WS_OPEN) return;
		sendVaultStatusToAgent(ws);
	}, [sendVaultStatusToAgent, vaultState.status, websocket]);

	const hasSeenPreview = useRef(false);
	const prevMarkdownCountRef = useRef(0);
	const hasSwitchedFile = useRef(false);
	// const wasChatDisabled = useRef(true);
	// const hasShownWelcome = useRef(false);

	const editorRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLIFrameElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const [newMessage, setNewMessage] = useState('');
	const [showTooltip, setShowTooltip] = useState(false);

	// Plan/Build chat mode. Defaults to 'plan' so a new session never modifies the
	// project before the user reviews a plan — UNLESS the caller explicitly asked
	// to build (?mode=build, e.g. the homepage "Build" work mode).
	const [chatMode, setChatMode] = useState<ChatMode>(
		searchParams.get('mode') === 'build' ? 'build' : 'plan',
	);
	const handleModeChange = useCallback((next: ChatMode) => {
		setChatMode((prev) => {
			if (prev === 'plan' && next === 'build') {
				toast.message('Switching to Build mode', {
					description: 'The next request may modify your project.',
				});
			}
			return next;
		});
	}, []);
	// Keyboard shortcuts: Alt+P -> Plan, Alt+B -> Build.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (!e.altKey || e.ctrlKey || e.metaKey) return;
			const k = e.key.toLowerCase();
			if (k === 'p') { e.preventDefault(); handleModeChange('plan'); }
			else if (k === 'b') { e.preventDefault(); handleModeChange('build'); }
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [handleModeChange]);

	const { images, addImages, removeImage, clearImages, isProcessing } = useImageUpload({
		onError: (error) => {
			console.error('Chat image upload error:', error);
		},
	});

	// Fake stream bootstrap files
	const { streamedFiles: streamedBootstrapFiles } =
		useFileContentStream(bootstrapFiles, {
			tps: 600,
			enabled: isBootstrapping,
		});

	// Merge streamed bootstrap files with generated files
	const allFiles = useMemo(() => {
		let result: FileType[];

		if (templateDetails?.allFiles) {
			const templateFiles = Object.entries(templateDetails.allFiles).map(
				([filePath, fileContents]) => ({
					filePath,
					fileContents,
				})
			);
			result = mergeFiles(templateFiles, files);
		} else {
			result = files;
		}

		// Use feature module's processFiles if available (e.g., for presentations to filter demo slides)
		const featureModule = featureRegistry.getModule(projectType);
		if (featureModule?.processFiles) {
			result = featureModule.processFiles(result, templateDetails);
		}

		return result;
	}, [files, templateDetails, projectType]);

	const handleFileClick = useCallback((file: FileType) => {
		logger.debug('handleFileClick()', file);
		clearEdit();
		setActiveFilePath(file.filePath);
		setView('editor');
		if (!hasSwitchedFile.current) {
			hasSwitchedFile.current = true;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleViewModeChange = useCallback((mode: 'preview' | 'editor' | 'docs' | 'blueprint' | 'presentation') => {
		setView(mode);
	}, []);

	const handleResetConversation = useCallback(() => {
		if (!websocket) return;
		sendWebSocketMessage(websocket, 'clear_conversation');
		setIsResetDialogOpen(false);
	}, [websocket]);

	// // Terminal functions
	// const handleTerminalCommand = useCallback((command: string) => {
	// 	if (websocket && websocket.readyState === WebSocket.OPEN) {
	// 		// Add command to terminal logs
	// 		const commandLog: TerminalLog = {
	// 			id: `cmd-${Date.now()}`,
	// 			content: command,
	// 			type: 'command',
	// 			timestamp: Date.now()
	// 		};
	// 		setTerminalLogs(prev => [...prev, commandLog]);

	// 		// Send command via WebSocket
	// 		websocket.send(JSON.stringify({
	// 			type: 'terminal_command',
	// 			command,
	// 			timestamp: Date.now()
	// 		}));
	// 	}
	// }, [websocket, setTerminalLogs]);

	const generatingCount = useMemo(
		() =>
			files.reduce(
				(count, file) => (file.isGenerating ? count + 1 : count),
				0,
			),
		[files],
	);

	const codeGenState = useMemo(() => {
		return projectStages.find((stage) => stage.id === 'code')?.status;
	}, [projectStages]);

	const generatingFile = useMemo(() => {
		// code gen status should be active
		if (codeGenState === 'active') {
			for (let i = files.length - 1; i >= 0; i--) {
				if (files[i].isGenerating) return files[i];
			}
		}
		return undefined;
	}, [files, codeGenState]);

	const activeFile = useMemo(() => {
		if (!hasSwitchedFile.current && generatingFile) {
			return generatingFile;
		}
		if (!hasSwitchedFile.current && isBootstrapping) {
			return streamedBootstrapFiles.find(
				(file) => file.filePath === activeFilePath,
			);
		}
		return (
			files.find((file) => file.filePath === activeFilePath) ??
			streamedBootstrapFiles.find(
				(file) => file.filePath === activeFilePath,
			) ??
			// Fallback to allFiles for template files that were merged in
			allFiles.find((file) => file.filePath === activeFilePath)
		);
	}, [
		activeFilePath,
		generatingFile,
		files,
		streamedBootstrapFiles,
		isBootstrapping,
		allFiles,
	]);

	const isPhase1Complete = useMemo(() => {
		return phaseTimeline.length > 0 && phaseTimeline[0].status === 'completed';
	}, [phaseTimeline]);

	// Canonical gates from the server-driven build-job state machine.
	// Deploy is only allowed when the job is genuinely deployable; the build is
	// only "Done" when the state machine says so (never on 0/1 phases). Fall back
	// to the legacy phase-1 heuristic only when no buildJob exists yet (old sessions).
	const isDeployable = buildJob ? buildJob.deployable === true : isPhase1Complete;
	const isBuildDone = buildJob ? buildJob.state === 'done' : false;
	const isReconnecting = connectionState === 'reconnecting';

	// Stall watchdog: while a build is active and connected, periodically ask the
	// server for the canonical build-job. The server lazily fails a phase that has
	// exceeded its timeout (see buildJob.checkTimeout) and broadcasts the result.
	const buildActiveForWatch = isGenerating || isGeneratingBlueprint || isDebugging;
	useEffect(() => {
		if (!buildActiveForWatch || connectionState !== 'connected' || !websocket) return;
		const id = setInterval(() => {
			sendWebSocketMessage(websocket, 'get_build_state');
		}, 30000);
		return () => clearInterval(id);
	}, [buildActiveForWatch, connectionState, websocket]);

	const isGitHubExportReady = useMemo(() => {
		if (behaviorType === 'agentic') {
			return files.length > 0 && !!urlChatId;
		}
		return isPhase1Complete && !!urlChatId;
	}, [behaviorType, files.length, isPhase1Complete, urlChatId]);

	// Detect if agentic mode is showing static content (docs, markdown)
	const isStaticContent = useMemo(() => {
		if (behaviorType !== 'agentic' || files.length === 0) return false;
		return files.every(file => isDocumentationPath(file.filePath.toLowerCase()));
	}, [behaviorType, files]);

	// Detect content type (documentation detection - works in any projectType)
	const contentDetection = useMemo(() => {
		return detectContentType(files);
	}, [files]);

    const hasDocumentation = useMemo(() => {
        return Object.values(contentDetection.Contents).some(bundle => bundle.type === 'markdown');
    }, [contentDetection]);

	// Preview available based on projectType and content
	const previewAvailable = useMemo(() => {
		if (hasDocumentation || !!previewUrl) return true;
		return false;
	}, [hasDocumentation, previewUrl]);

	const showMainView = useMemo(() => {
		// For agentic mode: show preview panel when files exist or preview URL exists
		if (behaviorType === 'agentic') {
			const hasFiles = files.length > 0;
			const hasPreview = !!previewUrl;
			const result = hasFiles || hasPreview;
			return result;
		}
		// For phasic mode: keep existing logic
		const result = streamedBootstrapFiles.length > 0 || !!blueprint || files.length > 0;
		return result;
	}, [behaviorType, blueprint, files.length, previewUrl, streamedBootstrapFiles.length]);

	// --- Navigation guard while a build is running ---
	// Authoritative "is a build running": prefer the server build-job state
	// machine (survives reload/reconnect where local flags reset to false), and
	// fall back to the live activity flags. This is what keeps the Stop button
	// visible whenever generation is actually in progress.
	const RUNNING_BUILD_STATES = useMemo(
		() => new Set(['analyzing', 'planning', 'blueprint_ready', 'generating_code', 'installing_dependencies', 'preview_starting']),
		[],
	);
	const isJobRunning = buildJob ? RUNNING_BUILD_STATES.has(buildJob.state) : false;
	const isBuildActive =
		isGenerating || isGeneratingBlueprint || isDebugging || isThinking || isJobRunning;

	// Warn on tab reload/close while building (beforeunload)
	useEffect(() => {
		if (!isBuildActive) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [isBuildActive]);

	// Block internal navigation while building; confirm + abort cleanly on leave
	const navBlocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			isBuildActive && currentLocation.pathname !== nextLocation.pathname,
	);
	useEffect(() => {
		if (navBlocker.state !== 'blocked') return;
		const ok = window.confirm(
			'Daisan AI đang dựng ứng dụng. Rời trang sẽ dừng tiến trình hiện tại. Bạn có chắc muốn rời đi?',
		);
		if (ok) {
			try {
				handleStopGeneration();
			} catch {
				/* best effort abort */
			}
			navBlocker.proceed();
		} else {
			navBlocker.reset();
		}
	}, [navBlocker, handleStopGeneration]);

	const [mainMessage, ...otherMessages] = useMemo(() => messages, [messages]);

	const { scrollToBottom } = useAutoScroll(messagesContainerRef, { behavior: 'smooth', watch: [messages] });

	const prevMessagesLengthRef = useRef(0);

	useEffect(() => {
		// Force scroll when a new message is appended (length increase)
		if (messages.length > prevMessagesLengthRef.current) {
			requestAnimationFrame(() => scrollToBottom());
		}
		prevMessagesLengthRef.current = messages.length;
	}, [messages.length, scrollToBottom]);

	useEffect(() => {
		if (hasSeenPreview.current) return;

		const markdownFiles = files.filter(isMarkdownFile);
		const isGeneratingMarkdown = markdownFiles.some(f => f.isGenerating);
		const newMarkdownAdded = markdownFiles.length > prevMarkdownCountRef.current;

		// Auto-switch to docs ONLY when NEW markdown is being generated
		if (hasDocumentation && newMarkdownAdded && isGeneratingMarkdown) {
			setView('docs');
			setShowTooltip(true);
			setTimeout(() => setShowTooltip(false), 3000);
			hasSeenPreview.current = true;
		} else if (isStaticContent && files.length > 0 && !hasDocumentation) {
			// For other static content (non-documentation), show editor view
			setView('editor');
			// Auto-select first file if none selected
			if (!activeFilePath) {
				setActiveFilePath(files[0].filePath);
			}
			hasSeenPreview.current = true;
		} else if (previewUrl) {
			const isExistingChat = urlChatId !== 'new';
			const shouldSwitch =
				behaviorType === 'agentic' ||
				(behaviorType === 'phasic' && isPhase1Complete) ||
				(isExistingChat && behaviorType !== 'phasic');

			if (shouldSwitch) {
				setView('preview');
				setShowTooltip(true);
				setTimeout(() => {
					setShowTooltip(false);
				}, 3000);
				hasSeenPreview.current = true;
			}
		}

		// Update ref for next comparison
		prevMarkdownCountRef.current = markdownFiles.length;
	}, [previewUrl, isPhase1Complete, isStaticContent, files, activeFilePath, behaviorType, hasDocumentation, projectType, urlChatId]);

	useEffect(() => {
		if (chatId) {
			navigate(`/chat/${chatId}`, {
				replace: true,
			});
		}
	}, [chatId, navigate]);

	useEffect(() => {
		if (!edit) return;
		if (files.some((file) => file.filePath === edit.filePath)) {
			setActiveFilePath(edit.filePath);
			setView('editor');
		}
	}, [edit, files]);

	useEffect(() => {
		if (
			isBootstrapping &&
			streamedBootstrapFiles.length > 0 &&
			!hasSwitchedFile.current
		) {
			setActiveFilePath(streamedBootstrapFiles.at(-1)!.filePath);
		} else if (
			view === 'editor' &&
			!activeFile &&
			files.length > 0 &&
			!hasSwitchedFile.current
		) {
			setActiveFilePath(files.at(-1)!.filePath);
		}
	}, [view, activeFile, files, isBootstrapping, streamedBootstrapFiles]);

	// Preserve active file when generation completes
	useEffect(() => {
		if (!generatingFile && activeFile && !hasSwitchedFile.current) {
			// Generation just ended, preserve the current active file
			setActiveFilePath(activeFile.filePath);
		}
	}, [generatingFile, activeFile]);

	useEffect(() => {
		if (view !== 'blueprint' && isGeneratingBlueprint) {
			setView('blueprint');
		} else if (
			!hasSwitchedFile.current &&
			view === 'blueprint' &&
			!isGeneratingBlueprint
		) {
			setView('editor');
		}
	}, [isGeneratingBlueprint, view]);
    
	const isRunning = useMemo(() => {
		return (
			isBootstrapping || isGeneratingBlueprint // || codeGenState === 'active'
		);
	}, [isBootstrapping, isGeneratingBlueprint]);

	// Check if chat input should be disabled (before blueprint completion, or during debugging)
	const isChatDisabled = useMemo(() => {
		const blueprintStage = projectStages.find(
			(stage) => stage.id === 'blueprint',
		);
		const blueprintNotCompleted = !blueprintStage || blueprintStage.status !== 'completed';

		return blueprintNotCompleted || isDebugging;
	}, [projectStages, isDebugging]);

	const chatFormRef = useRef<HTMLFormElement>(null);
	const { isDragging: isChatDragging, dragHandlers: chatDragHandlers } = useDragDrop({
		onFilesDropped: addImages,
		accept: [...SUPPORTED_IMAGE_MIME_TYPES],
		disabled: isChatDisabled,
	});

	const onNewMessage = useCallback(
		(e: FormEvent) => {
			e.preventDefault();

			// Allow sending while Daisan is building (the backend queues the
			// instruction into pendingUserInputs, consumed between phases). Only
			// block truly empty messages or when there is no live socket.
			if (!newMessage.trim() || !websocket) {
				return;
			}

			// Check usage limits before sending
			const limitCheck = checkCanSendPrompt(
				limitsData,
				limitsLoading,
				() => { window.location.href = `/oauth/login?return_url=${encodeURIComponent(window.location.href)}`; },
				() => setShowLimitDialog(null)
			);

			if (!limitCheck.canProceed) {
				setShowLimitDialog(limitCheck.dialogComponent || null);
				return;
			}

			// When generation is active, send as conversational AI suggestion.
			// Include the current Plan/Build mode so the backend honours it.
			sendWebSocketMessage(websocket, 'user_suggestion', {
				message: newMessage,
				mode: chatMode,
				images: images.length > 0 ? images : undefined,
			});
			sendUserMessage(newMessage);
			setNewMessage('');
			// Clear images after sending
			if (images.length > 0) {
				clearImages();
			}
			// Ensure we scroll after sending our own message
			requestAnimationFrame(() => scrollToBottom());
		},
		[newMessage, websocket, sendUserMessage, isChatDisabled, scrollToBottom, images, clearImages, limitsData, limitsLoading, chatMode],
	);

	// Themes panel: apply a design-token change via the Build pipeline.
	const applyTheme = useCallback(
		(instruction: string, summary: string) => {
			if (!websocket || isChatDisabled) return;
			sendWebSocketMessage(websocket, 'user_suggestion', {
				message: instruction,
				mode: 'build',
			});
			sendUserMessage(summary);
			requestAnimationFrame(() => scrollToBottom());
		},
		[websocket, isChatDisabled, sendUserMessage, scrollToBottom],
	);

	// --- Blueprint card actions ---
	const handleBuildNow = useCallback(() => {
		if (!websocket) return;
		if (chatMode !== 'build') handleModeChange('build');
		sendWebSocketMessage(websocket, 'user_suggestion', {
			message: 'Proceed to build the app now based on the approved blueprint.',
			mode: 'build',
		});
		sendUserMessage('Build now');
		requestAnimationFrame(() => scrollToBottom());
	}, [websocket, chatMode, handleModeChange, sendUserMessage, scrollToBottom]);

	const handleEditPlan = useCallback(() => {
		setView('blueprint');
		if (isMobile) setMobilePreviewOpen(true);
	}, [isMobile]);

	const handleAddRequirement = useCallback(() => {
		const el = document.getElementById('daisan-composer') as HTMLTextAreaElement | null;
		el?.focus();
		el?.scrollIntoView({ block: 'nearest' });
	}, []);

	const [progress, total] = useMemo((): [number, number] => {
		// Calculate phase progress instead of file progress
		const completedPhases = phaseTimeline.filter(p => p.status === 'completed').length;

		// Get predicted phase count from blueprint, fallback to current phase count
		const predictedPhaseCount = isPhasicBlueprint(blueprint)
			? blueprint.implementationRoadmap.length
			: 0;
		const totalPhases = Math.max(predictedPhaseCount, phaseTimeline.length, 1);

		return [completedPhases, totalPhases];
	}, [phaseTimeline, blueprint]);

	if (import.meta.env.DEV) {
		logger.debug({
			messages,
			files,
			blueprint,
			query,
			userQuery,
			chatId,
			previewUrl,
			generatingFile,
			activeFile,
			bootstrapFiles,
			streamedBootstrapFiles,
			isGeneratingBlueprint,
			view,
			totalFiles,
			generatingCount,
			isBootstrapping,
			activeFilePath,
			progress,
			total,
			isRunning,
			projectStages,
		});
	}

	return (
		<div className="size-full flex flex-col min-h-0 text-text-primary">
			<MobileChatHeader
				appTitle={appTitle}
				building={isBuildActive}
				progressLabel={total > 0 ? `${progress}/${total}` : undefined}
				hasPreview={showMainView}
				previewOpen={mobilePreviewOpen}
				onTogglePreview={() => setMobilePreviewOpen((v) => !v)}
				onReset={chatId ? () => setIsResetDialogOpen(true) : undefined}
			/>
			<div className="flex-1 flex min-h-0 overflow-hidden justify-center">
				<motion.div
					layout="position"
					className="flex-1 shrink-0 flex flex-col basis-0 w-full max-w-none md:max-w-lg relative z-10 h-full min-h-0"
				>
					{isReconnecting && !(buildJob && buildJob.state !== 'queued') && (
						<div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-500">
							<LoaderCircle className="size-3.5 animate-spin" />
							Mất kết nối — đang kết nối lại… (tiến trình build được giữ nguyên)
						</div>
					)}
					{buildJob && buildJob.state !== 'queued' && (
						<BuildStatusBar
							state={buildJob.state}
							lastError={buildJob.lastError}
							progress={progress}
							total={total}
							previewUrl={previewUrl}
							isReconnecting={isReconnecting}
							onStop={handleStopGeneration}
							onRetry={handleResumeGeneration}
							onOpenPreview={() => {
								setView('preview');
								if (isMobile) setMobilePreviewOpen(true);
							}}
						/>
					)}
					<div
					className={clsx(
						'flex-1 overflow-y-auto min-h-0 chat-messages-scroll',
						isDebugging && 'animate-debug-pulse'
					)}
					ref={messagesContainerRef}
				>
						<div className="pt-5 px-4 pb-4 text-sm flex flex-col gap-5">
							{appLoading ? (
								<div className="flex items-center gap-2 text-text-tertiary">
									<LoaderCircle className="size-4 animate-spin" />
									Loading app...
								</div>
							) : (
								<>
									{(appTitle || chatId) && (
								<div className="flex items-center justify-between mb-2">
									<div className="text-lg font-semibold">{appTitle}</div>
								</div>
							)}
									<UserMessage
										message={query ?? displayQuery}
									/>
								</>
							)}

							{mainMessage && (
							<div className="relative">
								<AIMessage
									message={mainMessage.content}
									isThinking={mainMessage.ui?.isThinking}
									toolEvents={mainMessage.ui?.toolEvents}
								/>
								{chatId && (
									<div className="absolute right-1 top-1">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="hover:bg-bg-3/80 cursor-pointer"
												>
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Chat actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-56">
												<DropdownMenuItem
														onClick={(e) => {
															e.preventDefault();
															setIsResetDialogOpen(true);
														}}
												>
													<RotateCcw className="h-4 w-4 mr-2" />
													Reset conversation
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}
							</div>
						)}

							{otherMessages
								.filter(message => message.role === 'assistant' && message.ui?.isThinking)
								.map((message) => (
									<div key={message.conversationId} className="mb-4">
										<AIMessage
											message={message.content}
											isThinking={true}
											toolEvents={message.ui?.toolEvents}
										/>
									</div>
								))}

							{isThinking && !otherMessages.some(m => m.ui?.isThinking) && (
								<div className="mb-4">
									<AIMessage
										message="Planning next phase..."
										isThinking={true}
									/>
								</div>
							)}

							{/* Blueprint summary card (inline in the chat stream) */}
							{isPhasicBlueprint(blueprint) && (
								<BlueprintCard
									blueprint={blueprint}
									isBuilding={isBuildActive}
									onBuildNow={handleBuildNow}
									onEditPlan={handleEditPlan}
									onAddRequirement={handleAddRequirement}
								/>
							)}

							{/* Only show PhaseTimeline for phasic mode */}
							{behaviorType !== 'agentic' && (
								<PhaseTimeline
									projectStages={projectStages}
									phaseTimeline={phaseTimeline}
									files={files}
									view={view}
									activeFile={activeFile}
									onFileClick={handleFileClick}
									isThinkingNext={isThinking}
									isPreviewDeploying={isPreviewDeploying}
									progress={progress}
									total={total}
									parentScrollRef={messagesContainerRef}
									onViewChange={(viewMode) => {
										setView(viewMode);
										hasSwitchedFile.current = true;
									}}
									chatId={chatId}
									isDeploying={isDeploying}
									handleDeployToCloudflare={handleDeployToCloudflare}
									runtimeErrorCount={runtimeErrorCount}
									staticIssueCount={staticIssueCount}
									isDebugging={isDebugging}
									isGenerating={isGenerating}
									isThinking={isThinking}
									buildDone={isBuildDone}
									isReconnecting={isReconnecting}
								/>
							)}

							{/* Readable build activity (Summary / Technical) */}
							{behaviorType !== 'agentic' && phaseTimeline.length > 0 && (
								<BuildLogFeed phaseTimeline={phaseTimeline} />
							)}

							{/* Deployment and Generation Controls - Only for phasic mode */}
							{chatId && behaviorType !== 'agentic' && (
								<motion.div
									ref={deploymentControlsRef}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
									className="px-4 mb-6"
								>
									<DeploymentControls
										isPhase1Complete={isDeployable}
										isDeploying={isDeploying}
										deploymentUrl={cloudflareDeploymentUrl}
										instanceId={chatId || ''}
										isRedeployReady={isRedeployReady}
										deploymentError={deploymentError}
										appId={app?.id || chatId}
										appVisibility={app?.visibility}
										isGenerating={
											isGenerating ||
											isGeneratingBlueprint
										}
										isPaused={isGenerationPaused}
										onDeploy={handleDeployToCloudflare}
										onStopGeneration={handleStopGeneration}
										onResumeGeneration={
											handleResumeGeneration
										}
										onVisibilityUpdate={(newVisibility) => {
											// Update app state if needed
											if (app) {
												app.visibility = newVisibility;
											}
										}}
									/>
								</motion.div>
							)}

							{otherMessages
								.filter(message => !message.ui?.isThinking)
								.map((message) => {
									if (message.role === 'assistant') {
										return (
											<AIMessage
												key={message.conversationId}
												message={message.content}
												isThinking={message.ui?.isThinking}
												toolEvents={message.ui?.toolEvents}
											/>
										);
									}
									return (
										<UserMessage
											key={message.conversationId}
											message={message.content}
										/>
									);
								})}

						</div>
					</div>


				<div className="flex items-center justify-end px-4 pt-1">
					<ThemePanel onApply={applyTheme} disabled={isChatDisabled} />
				</div>
				<ChatInput
					newMessage={newMessage}
					onMessageChange={setNewMessage}
					onSubmit={onNewMessage}
					images={images}
					onAddImages={addImages}
					onRemoveImage={removeImage}
					isProcessing={isProcessing}
					isChatDragging={isChatDragging}
					chatDragHandlers={chatDragHandlers}
					isChatDisabled={isChatDisabled}
					isRunning={isRunning}
					isGenerating={isGenerating}
					isGeneratingBlueprint={isGeneratingBlueprint}
					isDebugging={isDebugging}
					websocket={websocket}
					chatFormRef={chatFormRef}
					limitsData={limitsData}
					onConnectCloudflare={() => { window.location.href = `/oauth/login?return_url=${encodeURIComponent(window.location.href)}`; }}
						mode={chatMode}
						onModeChange={handleModeChange}
						connectionState={connectionState}
						onStop={handleStopGeneration}
						isBuildActive={isBuildActive}
				/>
				</motion.div>

				<AnimatePresence mode="wait">
					{showMainView && (!isMobile || mobilePreviewOpen) && (
						<motion.div
							key="main-content-panel"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className={clsx(
								'flex-1 flex shrink-0 basis-0 p-4 pl-0 ml-2 z-30 min-h-0',
								isMobile && 'mobile-preview-overlay bg-bg-1 flex-col',
							)}
						>
							{isMobile && (
								<button
									type="button"
									onClick={() => setMobilePreviewOpen(false)}
									aria-label="Đóng xem trước"
									className="touch-target absolute right-3 top-3 z-[70] flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-bg-2/90 text-text-primary shadow-lg backdrop-blur"
								>
									<X className="size-5" />
								</button>
							)}
							<MainContentPanel
								view={view}
								onViewChange={handleViewModeChange}
								hasDocumentation={hasDocumentation}
								contentDetection={contentDetection}
								projectType={projectType}
								previewUrl={previewUrl}
								previewAvailable={previewAvailable}
								showTooltip={showTooltip}
								shouldRefreshPreview={shouldRefreshPreview}
								manualRefreshTrigger={manualRefreshTrigger}
								onManualRefresh={() => setManualRefreshTrigger(Date.now())}
								blueprint={blueprint}
								activeFile={activeFile}
								allFiles={allFiles}
								edit={edit}
								onFileClick={handleFileClick}
								isGenerating={isGenerating}
								isGeneratingBlueprint={isGeneratingBlueprint}
								modelConfigs={modelConfigs}
								loadingConfigs={loadingConfigs}
								onRequestConfigs={handleRequestConfigs}
								onGitCloneClick={() => setIsGitCloneModalOpen(true)}
								isGitHubExportReady={isGitHubExportReady}
								githubExport={githubExport}
								behaviorType={behaviorType}
								websocket={websocket}
								previewRef={previewRef}
								editorRef={editorRef}
								templateDetails={templateDetails}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<ChatModals
				debugMessages={debugMessages}
				chatId={chatId}
				onClearDebugMessages={clearDebugMessages}
				isResetDialogOpen={isResetDialogOpen}
				onResetDialogChange={setIsResetDialogOpen}
				onResetConversation={handleResetConversation}
				githubExport={githubExport}
				app={app}
				urlChatId={urlChatId}
				isGitCloneModalOpen={isGitCloneModalOpen}
				onGitCloneModalChange={setIsGitCloneModalOpen}
				user={user}
			/>

			<VaultUnlockModal
				open={vaultState.unlockRequested && vaultState.status === 'locked'}
				onOpenChange={(open) => {
					if (!open) clearUnlockRequest();
				}}
				reason={vaultState.unlockReason ?? undefined}
			/>

			{/* Usage limit dialogs */}
			{showLimitDialog}
			
			{/* Backend error dialog - shows when backend blocks request due to limits */}
			{(() => {
				if (backendErrorDialog.isOpen && backendErrorDialog.errorCode === 'USAGE_LIMIT_EXCEEDED') {
					const limitCheckResult = getBackendLimitDialog(
						limitsData,
						() => {
							setBackendErrorDialog({ isOpen: false });
							window.location.href = '/settings';
						},
						() => setBackendErrorDialog({ isOpen: false })
					);
					
					return limitCheckResult.dialogComponent || null;
				}
				return null;
			})()}
		</div>
	);
}
