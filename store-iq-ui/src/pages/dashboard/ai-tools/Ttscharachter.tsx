import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Loader from '@/components/ui/Loader';
import {
  Play,
  Square,
  Volume2,
  Users,
  FileText,
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
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-storiq-purple animate-pulse" />
              TTS Conversation Studio
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Create realistic conversations with text-to-speech technology.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 text-white/60">
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
          <div className={`bg-storiq-card-bg/60 rounded-2xl shadow-lg p-6 border ${character1Voice ? 'border-green-400' : 'border-storiq-border'}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-white">
              <Volume2 className="mr-2 text-storiq-purple" /> Character 1 Voice
            </h3>
            <select
              value={character1Voice}
              onChange={e => setCharacter1Voice(e.target.value)}
              disabled={disableControls}
              className="w-full h-12 rounded-xl border border-storiq-border bg-storiq-card-bg px-4 py-3 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-storiq-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="" className="text-white/60">Select a voice...</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI} className="text-white">{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>

          {/* Character 2 */}
          <div className={`bg-storiq-card-bg/60 rounded-2xl shadow-lg p-6 border ${character2Voice ? 'border-green-400' : 'border-storiq-border'}`}>
            <h3 className="text-xl font-semibold flex items-center mb-4 text-white">
              <Users className="mr-2 text-storiq-blue" /> Character 2 Voice
            </h3>
            <select
              value={character2Voice}
              onChange={e => setCharacter2Voice(e.target.value)}
              disabled={disableControls}
              className="w-full h-12 rounded-xl border border-storiq-border bg-storiq-card-bg px-4 py-3 text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-storiq-purple focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="" className="text-white/60">Select a voice...</option>
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI} className="text-white">{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Script Editor */}
        <div className="bg-storiq-card-bg/60 rounded-2xl shadow-lg p-6 mb-8 border border-storiq-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <FileText className="mr-2 text-storiq-purple" /> Conversation Script
            </h3>
            <Button
              onClick={resetAll}
              variant="outline"
              className="flex items-center px-4 py-2 text-white/60 hover:text-white transition"
              type="button"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
          <Textarea
            ref={scriptTextareaRef}
            rows={12}
            value={script}
            onChange={e => setScript(e.target.value)}
            disabled={disableControls}
            placeholder="Character 1: Your line here...&#10;Character 2: Another line here..."
            className="bg-black/40 border border-storiq-border text-white placeholder:text-white/40 min-h-[120px] text-base rounded-xl focus:ring-2 focus:ring-storiq-purple/50 focus:border-storiq-purple transition resize-none px-4 py-3 font-mono"
          />
          <p className="text-xs text-white/60 mt-2">
            Start each line with "Character 1:" or "Character 2:" followed by dialogue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-4 mb-8">
            <div className="p-3 bg-red-500/10 rounded-full animate-bounce">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="text-red-400 text-center font-medium flex items-center gap-2 mt-2">
              <AlertCircle className="mr-2 h-5 w-5" /> {error}
            </div>
          </div>
        )}

        {/* Playing status */}
        {status === 'playing' && (
          <div className="bg-storiq-card-bg/60 rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center border border-storiq-border">
            <Loader message="Now Speaking..." size="small" overlay={false} className="mb-4" />
            <h3 className="text-lg font-semibold text-white">Now Speaking...</h3>
            <p className="text-white/60 text-sm">Listen to your conversation come to life.</p>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handlePlay}
            disabled={disableControls || !script.trim() || !character1Voice || !character2Voice}
            className="px-6 py-3 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 text-white font-semibold rounded-xl shadow-lg hover:from-storiq-purple/90 hover:to-storiq-purple/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5 mr-2" />
            {status === 'playing' ? 'Playing...' : 'Play Conversation'}
          </Button>

          <Button
            onClick={handleStop}
            disabled={status !== 'playing'}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="h-5 w-5 mr-2" /> Stop
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TTSPlayer;
