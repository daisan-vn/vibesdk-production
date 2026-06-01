import { useState } from 'react';
import { useParams } from 'react-router';
import { LucideNetwork, ChevronRight, File, Download, Loader, KeyRound } from 'lucide-react';
import type { FileType } from '@/api-types';
import { apiClient } from '@/lib/api-client';
import { EnvEditorDialog } from './env-editor-dialog';
import clsx from 'clsx';

interface FileTreeItem {
	name: string;
	type: 'file' | 'folder';
	filePath: string;
	children?: { [key: string]: FileTreeItem };
	file?: FileType;
}

export function FileTreeItem({
	item,
	level = 0,
	currentFile,
	onFileClick,
}: {
	item: FileTreeItem;
	level?: number;
	currentFile: FileType | undefined;
	onFileClick: (file: FileType) => void;
}) {
	const [isExpanded, setIsExpanded] = useState(true);
	const isCurrentFile = currentFile?.filePath === item.filePath;

	if (item.type === 'file' && item.file) {
		return (
			<button
				onClick={() => onFileClick(item.file!)}
				className={`flex items-center w-full gap-2 py-1 px-3 transition-colors text-sm ${
					isCurrentFile
						? 'text-brand bg-zinc-100'
						: 'text-text-primary/80 hover:bg-accent hover:text-text-primary'
				}`}
				style={{ paddingLeft: `${level * 12 + 12}px` }}
			>
				<File className="size-3" />
				<span className="flex-1 text-left truncate">{item.name}</span>
				{/* {item.file.isGenerating ? (
					<Loader className="size-3 animate-spin" />
				) : null}
				{item.file.needsFixing && (
					<span className="text-[9px] text-orange-400">fix</span>
				)}
				{item.file.hasRuntimeError && (
					<span className="text-[9px] text-red-400">error</span>
				)} */}
			</button>
		);
	}

	return (
		<div>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-2 py-1 px-3 transition-colors text-sm text-text-primary/80 hover:bg-accent hover:text-text-primary w-full"
				style={{ paddingLeft: `${level * 12 + 12}px` }}
			>
				<ChevronRight
					className={clsx(
						'size-3 transition-transform duration-200 ease-in-out',
						isExpanded && 'rotate-90',
					)}
				/>
				<span className="flex-1 text-left truncate">{item.name}</span>
			</button>
			{isExpanded && item.children && (
				<div>
					{Object.values(item.children).map((child) => (
						<FileTreeItem
							key={child.filePath}
							item={child}
							level={level + 1}
							currentFile={currentFile}
							onFileClick={onFileClick}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function buildFileTree(files: FileType[]): FileTreeItem[] {
	const root: { [key: string]: FileTreeItem } = {};

	files.forEach((file) => {
		const parts = file.filePath.split('/');
		let currentLevel: { [key: string]: FileTreeItem } = root;

		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];
			if (!currentLevel[part]) {
				currentLevel[part] = {
					name: part,
					type: 'folder',
					filePath: parts.slice(0, i + 1).join('/'),
					children: {},
				};
			}
			if (!currentLevel[part].children) {
				currentLevel[part].children = {};
			}
			currentLevel = currentLevel[part].children;
		}

		const fileName = parts[parts.length - 1];
		currentLevel[fileName] = {
			name: fileName,
			type: 'file',
			filePath: file.filePath,
			file: file,
		};
	});

	return Object.values(root);
}

export function FileExplorer({
	files,
	currentFile,
	onFileClick,
}: {
	files: FileType[];
	currentFile: FileType | undefined;
	onFileClick: (file: FileType) => void;
}) {
	const fileTree = buildFileTree(files);
	// The chat route is /chat/:chatId, and chatId IS the agent id used by the API.
	const { chatId: agentId } = useParams();
	const [isDownloading, setIsDownloading] = useState(false);
	const [envOpen, setEnvOpen] = useState(false);

	const handleDownload = async () => {
		if (!agentId || isDownloading) {
			return;
		}
		setIsDownloading(true);
		try {
			await apiClient.downloadCodebase(agentId);
		} catch {
			// apiClient already surfaces a toast on failure.
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="w-full max-w-[200px] bg-bg-3 border-r border-text/10 h-full flex flex-col">
			<div className="p-2 px-3 text-sm flex items-center gap-1 text-text-primary/50 font-medium">
				<LucideNetwork className="size-4" />
				Files
			</div>
			<div className="flex flex-col flex-1 overflow-y-auto">
				{fileTree.map((item) => (
					<FileTreeItem
						key={item.filePath}
						item={item}
						currentFile={currentFile}
						onFileClick={onFileClick}
					/>
				))}
			</div>
			{agentId && files.length > 0 && (
				<div className="flex flex-col gap-1.5 p-2">
					<button
						onClick={() => setEnvOpen(true)}
						className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-text-primary/80 bg-accent/30 hover:bg-accent hover:text-text-primary transition-colors"
						title="Đặt biến môi trường (Supabase…) rồi redeploy"
					>
						<KeyRound className="size-4" />
						Set env vars
					</button>
					<button
						onClick={handleDownload}
						disabled={isDownloading}
						className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium text-text-primary/80 bg-accent/50 hover:bg-accent hover:text-text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
						title="Tải toàn bộ source code dự án (.zip)"
					>
						{isDownloading ? (
							<Loader className="size-4 animate-spin" />
						) : (
							<Download className="size-4" />
						)}
						{isDownloading ? 'Đang nén…' : 'Download codebase'}
					</button>
				</div>
			)}
			{agentId && <EnvEditorDialog open={envOpen} onClose={() => setEnvOpen(false)} agentId={agentId} />}
		</div>
	);
}
