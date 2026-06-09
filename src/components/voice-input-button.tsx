import { Mic, Square } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface VoiceInputButtonProps {
	/** Receives the final transcribed text (caller decides how to append it). */
	onTranscript: (text: string) => void;
	disabled?: boolean;
	/** Recognition language. Defaults to Vietnamese. */
	lang?: string;
	className?: string;
}

/**
 * Mic button for dictating into the composer (Web Speech API). Renders nothing
 * when the browser has no speech recognition support.
 */
export function VoiceInputButton({ onTranscript, disabled = false, lang, className = '' }: VoiceInputButtonProps) {
	const { isListening, isSupported, toggle } = useSpeechRecognition({ lang, onFinalTranscript: onTranscript });

	if (!isSupported) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={toggle}
			disabled={disabled}
			aria-label={isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'}
			aria-pressed={isListening}
			title={isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'}
			className={`flex size-9 items-center justify-center rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
				isListening
					? 'animate-pulse bg-red-500/15 text-red-400'
					: 'text-text-tertiary hover:bg-white/5 hover:text-text-primary'
			} ${className}`}
		>
			{isListening ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}
		</button>
	);
}
