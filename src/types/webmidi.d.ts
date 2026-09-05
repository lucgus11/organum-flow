// TypeScript ne fournit pas encore les types Web MIDI dans lib.dom.
// Déclarations minimales couvrant l'usage de ce projet (entrées MIDI en lecture seule).

interface MIDIMessageEvent extends Event {
  data: Uint8Array;
}

interface MIDIPort extends EventTarget {
  id: string;
  name?: string;
  manufacturer?: string;
  state: "connected" | "disconnected";
  connection: "open" | "closed" | "pending";
}

interface MIDIInput extends MIDIPort {
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIOutput extends MIDIPort {}

interface MIDIInputMap {
  forEach(callback: (input: MIDIInput, key: string) => void): void;
}

interface MIDIOutputMap {
  forEach(callback: (output: MIDIOutput, key: string) => void): void;
}

interface MIDIAccess extends EventTarget {
  inputs: MIDIInputMap;
  outputs: MIDIOutputMap;
  onstatechange: ((event: Event) => void) | null;
}

interface MIDIOptions {
  sysex?: boolean;
  software?: boolean;
}

interface Navigator {
  requestMIDIAccess?(options?: MIDIOptions): Promise<MIDIAccess>;
}
