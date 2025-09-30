import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Play,
  Square,
  Volume2,
  Users,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_SCRIPT = `Character 1: Welcome to our TTS Conversation Studio!
Character 2: This is where your scripts come to life with realistic voices.
Character 1: Simply edit this text or write your own dialogue.
Character 2: Then choose voices and hit play to hear the conversation!`;

type Status = 'idle' | 'playing';

const playConversation = (script, voices, voice1URI, voice2URI, textareaRef, onEnd) => {
  window.speechSynthesis.cancel();
  const lines = script.split('\n').filter(line => line.trim() !== '');
  if (!lines.length) {
    onEnd();
    return;
  }

  let charIndexOffset = 0;
  const utterances = lines.map(line => {
    const trimmedLine = line.trim();
    let textToSpeak = null, voiceURI = null;

    if (trimmedLine.toLowerCase().startsWith('character 1:')) {
      voiceURI = voice1URI;
      textToSpeak = trimmedLine.substring('character 1:'.length).trim();
    } else if (trimmedLine.toLowerCase().startsWith('character 2:')) {
      voiceURI = voice2URI;
      textToSpeak = trimmedLine.substring('character 2:'.length).trim();
    }

    if (textToSpeak && voiceURI) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;

      const lineStartIndex = script.indexOf(line, charIndexOffset);
      const textStartIndex = line.indexOf(textToSpeak) + lineStartIndex;

      utterance.onboundary = event => {
        if (textareaRef.current && event.name === 'word') {
          const start = textStartIndex + event.charIndex;
          const end = start + event.charLength;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, end);
        }
      };

      charIndexOffset += line.length + 1;
      return utterance;
    }
    return null;
  }).filter(u => u !== null);

  if (utterances.length > 0) {
    const lastUtterance = utterances[utterances.length - 1];
    lastUtterance.onend = () => {
      if (textareaRef.current) textareaRef.current.setSelectionRange(0, 0);
      onEnd();
    };
    utterances.forEach(u => window.speechSynthesis.speak(u));
  } else {
    onEnd();
  }
};

const TTSPlayer = () => {
  const [voices, setVoices] = useState([]);
  const [character1Voice, setCharacter1Voice] = useState('');
  const [character2Voice, setCharacter2Voice] = useState('');
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
          if (englishVoices.length > 0) {
            setCharacter1Voice(v => v || englishVoices[0].voiceURI);
            setCharacter2Voice(v => v || (englishVoices[1] || englishVoices[0]).voiceURI);
          }
        }
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        handleStop();
      };
    }
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setStatus('idle');
  }, []);

  const handlePlay = () => {
    if (status !== 'idle') return;
    setError('');
    setStatus('playing');
    playConversation(script, voices, character1Voice, character2Voice, scriptTextareaRef, () => setStatus('idle'));
  };

  const resetAll = () => {
    setScript(DEFAULT_SCRIPT);
    setError('');
    handleStop();
  };

  const disableControls = status !== 'idle';

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            TTS Conversation Studio
          </h1>
          <p className="text-gray-300 mt-2">Create realistic conversations with text-to-speech technology.</p>
        </div>

        {/* Workflow steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 text-gray-400">
            <div className={`flex items-center ${character1Voice ? 'text-green-400' : ''}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Voice 1
            </div>
            <div>—</div>
            <div className={`flex items-center ${character2Voice ? 'text-green-400' : ''}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" /> Voice 2
            </div>
            <div>—</div>
            <div className={`flex items-center ${script.trim() ? 'text-green-400' : ''}`}>
              <Sparkles className="mr-2 h-5 w-5" /> Ready
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Character 1 */}
          <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 border ${character1Voice ? 'border-green-400' : 'border-gray-700'}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-gray-100">
              <Volume2 className="mr-2 text-purple-400" /> Character 1 Voice
            </h3>
            <select
              value={character1Voice}
              onChange={e => setCharacter1Voice(e.target.value)}
              disabled={disableControls}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-purple-500 focus:border-purple-500 transition"
            >
              <option value="" className="text-gray-400">Select a voice...</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI} className="text-gray-100">{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          {/* Character 2 */}
          <div className={`bg-gray-800 rounded-2xl shadow-lg p-6 border ${character2Voice ? 'border-green-400' : 'border-gray-700'}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-gray-100">
              <Users className="mr-2 text-blue-400" /> Character 2 Voice
            </h3>
            <select
              value={character2Voice}
              onChange={e => setCharacter2Voice(e.target.value)}
              disabled={disableControls}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="" className="text-gray-400">Select a voice...</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI} className="text-gray-100">{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Script Editor */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center text-gray-100">
              <FileText className="mr-2 text-green-400" /> Conversation Script
            </h3>
            <button onClick={resetAll} className="flex items-center px-4 py-2 text-gray-300 hover:text-white transition">
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </button>
          </div>
          <textarea
            ref={scriptTextareaRef}
            rows={12}
            value={script}
            onChange={e => setScript(e.target.value)}
            disabled={disableControls}
            placeholder="Character 1: Your line here...&#10;Character 2: Another line here..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 placeholder-gray-500 resize-y font-mono text-sm focus:ring-green-500 focus:border-green-500 transition"
          />
          <p className="text-xs text-gray-400 mt-2">
            Start each line with "Character 1:" or "Character 2:" followed by dialogue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-xl p-4 mb-8 text-red-300 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" /> <p>{error}</p>
          </div>
        )}

        {/* Playing status */}
        {status === 'playing' && (
          <div className="bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center border border-gray-700">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-100">Now Speaking...</h3>
            <p className="text-gray-400 text-sm">Listen to your conversation come to life.</p>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePlay}
            disabled={disableControls || !script.trim() || !character1Voice || !character2Voice}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play className="h-5 w-5 mr-2" />
            {status === 'playing' ? 'Playing...' : 'Play Conversation'}
          </button>

          <button
            onClick={handleStop}
            disabled={status !== 'playing'}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Square className="h-5 w-5 mr-2" /> Stop
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TTSPlayer;
