import { useEffect, useRef, useState } from "react";

interface UseMidiOptions {
  enabled: boolean;
  onNoteOn?: (note: number, velocity: number, timeMs: number) => void;
  onNoteOff?: (note: number, timeMs: number) => void;
}

interface UseMidiResult {
  supported: boolean;
  connectedDevices: string[];
  error: string | null;
  ready: boolean;
}

/**
 * Se connecte au premier / à tous les périphériques MIDI disponibles via navigator.requestMIDIAccess
 * et remonte les événements noteOn / noteOff. Les codes de statut MIDI 0x90 (noteOn) et 0x80
 * (noteOff) sont interprétés directement depuis les messages bruts.
 */
export function useMidi({ enabled, onNoteOn, onNoteOff }: UseMidiOptions): UseMidiResult {
  const [supported, setSupported] = useState(true);
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }

    if (!("requestMIDIAccess" in navigator)) {
      setSupported(false);
      setError("Web MIDI API non disponible sur ce navigateur (essayez Chrome ou Edge).");
      return;
    }

    let cancelled = false;
    let midiAccess: MIDIAccess | null = null;

    const handleMessage = (event: MIDIMessageEvent) => {
      const data = event.data;
      if (!data || data.length < 2) return;
      const [statusByte, note, velocity = 0] = data;
      const command = statusByte & 0xf0;
      const now = performance.now();

      if (command === 0x90 && velocity > 0) {
        onNoteOnRef.current?.(note, velocity, now);
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        onNoteOffRef.current?.(note, now);
      }
    };

    const attachListeners = (access: MIDIAccess) => {
      const names: string[] = [];
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMessage;
        names.push(input.name ?? "Périphérique MIDI");
      });
      if (!cancelled) setConnectedDevices(names);
    };

    navigator
      .requestMIDIAccess!()
      .then((access) => {
        if (cancelled) return;
        midiAccess = access;
        attachListeners(access);
        access.onstatechange = () => attachListeners(access);
        setReady(true);
        setError(null);
      })
      .catch((err) => {
        console.error("[useMidi] accès MIDI refusé", err);
        if (!cancelled) {
          setError("Accès MIDI refusé par le navigateur.");
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
      if (midiAccess) {
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = null;
        });
        midiAccess.onstatechange = null;
      }
    };
  }, [enabled]);

  return { supported, connectedDevices, error, ready };
}
