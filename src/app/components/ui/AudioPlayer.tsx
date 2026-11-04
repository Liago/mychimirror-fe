"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

const SPEEDS = [1, 1.25, 1.5];
const SKIP_SECONDS = 15;

const formatTime = (seconds: number) => {
	const total = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const SkipIcon = ({ forward }: { forward: boolean }) => (
	<svg
		aria-hidden="true"
		width="26"
		height="26"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.4"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={forward ? "-scale-x-100" : undefined}
	>
		<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
		<path d="M4 4v4h4" />
	</svg>
);

type Props = {
	src: string;
	label: string;
};

const skipClassName =
	"relative flex h-9 w-9 items-center justify-center text-black transition-colors hover:text-fake-black";

/**
 * Lettore audio del racconto: l'elemento <audio> resta nascosto e i comandi sono
 * nostri. La barra è un input range, così funziona anche da tastiera e con gli
 * screen reader.
 */
const AudioPlayer = ({ src, label }: Props) => {
	const { t } = useI18n();
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [current, setCurrent] = useState(0);
	const [duration, setDuration] = useState(0);
	const [speed, setSpeed] = useState(SPEEDS[0]);

	// I metadati possono arrivare prima dell'idratazione: l'evento è già passato
	useEffect(() => {
		const audio = audioRef.current;
		if (audio && audio.duration) setDuration(audio.duration);
	}, []);

	const togglePlay = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) void audio.play();
		else audio.pause();
	};

	const seek = (time: number) => {
		const audio = audioRef.current;
		if (!audio) return;
		const end = audio.duration || duration;
		audio.currentTime = Math.min(Math.max(time, 0), end);
		setCurrent(audio.currentTime);
	};

	const changeSpeed = () => {
		const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
		setSpeed(next);
		if (audioRef.current) audioRef.current.playbackRate = next;
	};

	const progress = duration ? (current / duration) * 100 : 0;

	return (
		<div className="border border-fake-black/25 bg-white px-4 pb-4 pt-[14px] sm:px-5">
			<audio
				ref={audioRef}
				src={src}
				preload="metadata"
				onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
				onDurationChange={(e) => setDuration(e.currentTarget.duration)}
				onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onEnded={() => setPlaying(false)}
			/>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={togglePlay}
					aria-label={playing ? t.post.pause : t.post.play}
					className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fake-black text-white transition-colors hover:bg-black"
				>
					<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						{playing ? (
							<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
						) : (
							<path d="M8 5v14l11-7z" />
						)}
					</svg>
				</button>
				<div className="min-w-0 flex-1">
					<p className="font-playfair text-[17px] italic leading-[21px] text-black">
						{label}
					</p>
					<p className="font-open-sans text-[11px] font-medium leading-4 tracking-[0.08em] text-body-text [font-variant-numeric:tabular-nums]">
						{formatTime(current)} / {formatTime(duration)}
					</p>
				</div>
				<div className="flex shrink-0 items-center">
					<button
						type="button"
						onClick={() => seek(current - SKIP_SECONDS)}
						aria-label={t.post.back15}
						className={skipClassName}
					>
						<SkipIcon forward={false} />
						<span aria-hidden="true" className="absolute font-open-sans text-[8px] font-semibold">
							{SKIP_SECONDS}
						</span>
					</button>
					<button
						type="button"
						onClick={() => seek(current + SKIP_SECONDS)}
						aria-label={t.post.forward15}
						className={skipClassName}
					>
						<SkipIcon forward />
						<span aria-hidden="true" className="absolute font-open-sans text-[8px] font-semibold">
							{SKIP_SECONDS}
						</span>
					</button>
					<button
						type="button"
						onClick={changeSpeed}
						aria-label={`${t.post.speed}: ${speed}x`}
						className="ml-1 h-9 min-w-[42px] font-open-sans text-[11px] font-semibold text-black transition-colors hover:text-fake-black"
					>
						{speed}x
					</button>
				</div>
			</div>
			<input
				type="range"
				min={0}
				max={duration || 0}
				step={1}
				value={Math.min(current, duration)}
				onChange={(e) => seek(Number(e.target.value))}
				aria-label={t.post.seek}
				aria-valuetext={`${formatTime(current)} / ${formatTime(duration)}`}
				style={{ "--progress": `${progress}%` } as React.CSSProperties}
				className="audio-range mt-3"
			/>
		</div>
	);
};

export default AudioPlayer;
