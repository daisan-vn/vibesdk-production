import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Descriptor of a clicked preview element, sent by the in-preview bridge. */
export interface SelectedElement {
	tag: string;
	id: string;
	classes: string;
	text: string;
	selector: string;
}

/**
 * Drives the Lovable-style "visual edit" mode: toggles select mode in the preview
 * iframe and receives the clicked element via postMessage. The preview must carry
 * the injected visual-edit bridge (see worker/services/preview/visualEditBridge.ts).
 */
export function useVisualEdit(previewRef: RefObject<HTMLIFrameElement | null>) {
	const [active, setActive] = useState(false);
	const [selected, setSelected] = useState<SelectedElement | null>(null);
	const activeRef = useRef(active);
	activeRef.current = active;

	const post = useCallback(
		(message: Record<string, unknown>) => {
			previewRef.current?.contentWindow?.postMessage({ source: 'daisan', ...message }, '*');
		},
		[previewRef],
	);

	// Push mode changes into the preview bridge; drop any selection when leaving.
	useEffect(() => {
		post({ type: 'setMode', active });
		if (!active) {
			setSelected(null);
		}
	}, [active, post]);

	// Receive selection + readiness from the preview bridge.
	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as
				| { source?: string; type?: string; payload?: SelectedElement }
				| null;
			if (!data || data.source !== 'daisan-ve') {
				return;
			}
			if (data.type === 'ready') {
				// Preview (re)loaded — restore the current mode into the fresh bridge.
				if (activeRef.current) {
					post({ type: 'setMode', active: true });
				}
			} else if (data.type === 'selected' && data.payload) {
				setSelected(data.payload);
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [post]);

	const toggle = useCallback(() => setActive((value) => !value), []);
	const deactivate = useCallback(() => setActive(false), []);
	const clearSelection = useCallback(() => {
		setSelected(null);
		post({ type: 'clear' });
	}, [post]);

	return { active, selected, toggle, deactivate, clearSelection };
}
