import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the Web Speech API (not part of the standard TS DOM lib).
interface SpeechRecognitionAlternative {
	transcript: string;
}
interface SpeechRecognitionResultLike {
	readonly isFinal: boolean;
	readonly length: number;
	[index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionEventLike {
	readonly resultIndex: number;
	readonly results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	start: () => void;
	stop: () => void;
	abort: () => void;
	onresult: ((event: SpeechRecognitionEventLike) => void) | null;
	onerror: ((event: { error: string }) => void) | null;
	onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
	if (typeof window === 'undefined') {
		return null;
	}
	const w = window as unknown as {
		SpeechRecognition?: SpeechRecognitionCtor;
		webkitSpeechRecognition?: SpeechRecognitionCtor;
	};
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionArgs {
	/** Recognition language. Defaults to Vietnamese. */
	lang?: string;
	/** Called with the final transcribed text once a phrase is recognized. */
	onFinalTranscript: (text: string) => void;
}

/**
 * Thin wrapper over the browser Web Speech API for dictating into the composer.
 * Degrades gracefully: `isSupported` is false where the API is unavailable
 * (e.g. Firefox), so callers can hide the mic button entirely.
 */
export function useSpeechRecognition({ lang = 'vi-VN', onFinalTranscript }: UseSpeechRecognitionArgs) {
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
	const onFinalRef = useRef(onFinalTranscript);
	onFinalRef.current = onFinalTranscript;

	useEffect(() => {
		setIsSupported(getRecognitionCtor() !== null);
		return () => {
			recognitionRef.current?.abort();
		};
	}, []);

	const stop = useCallback(() => {
		recognitionRef.current?.stop();
	}, []);

	const start = useCallback(() => {
		const Ctor = getRecognitionCtor();
		if (!Ctor) {
			return;
		}
		const recognition = new Ctor();
		recognition.lang = lang;
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.onresult = (event) => {
			let finalText = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					finalText += result[0].transcript;
				}
			}
			const trimmed = finalText.trim();
			if (trimmed) {
				onFinalRef.current(trimmed);
			}
		};
		recognition.onerror = () => setIsListening(false);
		recognition.onend = () => setIsListening(false);
		recognitionRef.current = recognition;
		recognition.start();
		setIsListening(true);
	}, [lang]);

	const toggle = useCallback(() => {
		if (isListening) {
			stop();
		} else {
			start();
		}
	}, [isListening, start, stop]);

	return { isListening, isSupported, start, stop, toggle };
}
