import React, { useState } from 'react';
import { Header, AppTab } from './components/Header';
import { ScenesTimelineTab } from './components/ScenesTimelineTab';
import { VideoGeneratorTab, GeneratedVideoItem } from './components/VideoGeneratorTab';
import { FrameDecomposerTab } from './components/FrameDecomposerTab';
import { EncapsulationVisualizerTab } from './components/EncapsulationVisualizerTab';
import { TroubleshootingTab } from './components/TroubleshootingTab';
import { SlidesExportTab } from './components/SlidesExportTab';
import { YouTubeDecomposerTab } from './components/YouTubeDecomposerTab';
import { CartesiaStudioTab } from './components/CartesiaStudioTab';
import { PresentationScene, PRESENTATION_SCENES } from './utils/osiData';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('youtube');
  const [studioScenes, setStudioScenes] = useState<PresentationScene[]>(PRESENTATION_SCENES);
  const [isCustomSource, setIsCustomSource] = useState<boolean>(false);
  const [sourceMeta, setSourceMeta] = useState<any>(null);
  const [selectedSceneForVideo, setSelectedSceneForVideo] = useState<PresentationScene | null>(null);
  const [selectedSceneForCartesia, setSelectedSceneForCartesia] = useState<PresentationScene | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoItem[]>([]);

  // When user clicks "Gemini Omni Video" on a scene card
  const handleSelectSceneForVideo = (scene: PresentationScene) => {
    setSelectedSceneForVideo(scene);
    setActiveTab('video-gen');
  };

  // When user clicks "Cartesia TTS" on a scene card
  const handleSelectSceneForCartesia = (scene: PresentationScene) => {
    setSelectedSceneForCartesia(scene);
    setActiveTab('cartesia');
  };

  // When user navigates from 1 FPS Frame Decomposer to Gemini Omni Video
  const handleSelectFramePromptForVideo = (promptText: string) => {
    const frameScene: PresentationScene = {
      id: `custom-frame-${Date.now()}`,
      sceneNumber: 99,
      title: 'Frame-Exakter Replikations-Prompt',
      speaker: '1:1 Frame Replikation',
      speakerRole: 'Replikation',
      speakerColor: 'border-cyan-500',
      timeStart: '00:00',
      timeEnd: '00:05',
      startSeconds: 0,
      endSeconds: 5,
      durationSeconds: 5,
      layers: [1, 2, 3, 4, 5, 6, 7],
      slides: 'Frame 1:1',
      topic: '1 FPS Replikation',
      scriptText: promptText,
      cues: [],
      directorNotes: '1 FPS Replikation',
      aiVideoPrompt: promptText,
      spokenScript: promptText,
      description: promptText,
      cartesiaVoiceId: 'german-narrator'
    };
    setSelectedSceneForVideo(frameScene);
    setActiveTab('video-gen');
  };

  // When user navigates from 1 FPS Frame Decomposer to Cartesia TTS
  const handleSelectFrameTextForCartesia = (text: string) => {
    const frameScene: PresentationScene = {
      id: `custom-cartesia-${Date.now()}`,
      sceneNumber: 99,
      title: 'Transkript-Schnipsel',
      speaker: 'Cartesia Voice',
      speakerRole: 'Audio-Generierung',
      speakerColor: 'border-amber-500',
      timeStart: '00:00',
      timeEnd: '00:05',
      startSeconds: 0,
      endSeconds: 5,
      durationSeconds: 5,
      layers: [1, 2, 3, 4, 5, 6, 7],
      slides: 'Cartesia Prompt',
      topic: 'Cartesia Sonic Audio-Generierung',
      scriptText: text,
      cues: [],
      directorNotes: 'Cartesia Sonic Audio-Generierung',
      aiVideoPrompt: '',
      spokenScript: text,
      description: text,
      cartesiaVoiceId: 'german-moderator'
    };
    setSelectedSceneForCartesia(frameScene);
    setActiveTab('cartesia');
  };

  // When user applies decomposed YouTube scenes into the main studio pipeline
  const handleApplyScenesToStudio = (newScenes: PresentationScene[], meta?: any) => {
    setStudioScenes(newScenes);
    setIsCustomSource(true);
    setSourceMeta(meta);
    setActiveTab('scenes');
  };

  // Reset to original 12:00 comcave presentation
  const handleResetDefaultScenes = () => {
    setStudioScenes(PRESENTATION_SCENES);
    setIsCustomSource(false);
    setSourceMeta(null);
  };

  const handleVideoCreated = (newVideo: GeneratedVideoItem) => {
    setGeneratedVideos((prev) => [newVideo, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        generatedVideoCount={generatedVideos.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'youtube' && (
          <YouTubeDecomposerTab
            onApplyScenesToStudio={handleApplyScenesToStudio}
            onNavigateToVideoGen={handleSelectSceneForVideo}
            onNavigateToCartesia={handleSelectSceneForCartesia}
          />
        )}

        {activeTab === 'frame-decomposer' && (
          <FrameDecomposerTab
            scenes={studioScenes}
            onNavigateToVideoGen={handleSelectFramePromptForVideo}
            onNavigateToCartesia={handleSelectFrameTextForCartesia}
          />
        )}

        {activeTab === 'cartesia' && (
          <CartesiaStudioTab
            currentScenes={studioScenes}
            selectedScene={selectedSceneForCartesia}
          />
        )}

        {activeTab === 'scenes' && (
          <ScenesTimelineTab
            scenes={studioScenes}
            onSelectSceneForVideo={handleSelectSceneForVideo}
            onNavigateToCartesia={handleSelectSceneForCartesia}
            onResetDefaultScenes={handleResetDefaultScenes}
            isCustomSource={isCustomSource}
          />
        )}

        {activeTab === 'video-gen' && (
          <VideoGeneratorTab
            scenes={studioScenes}
            initialSelectedScene={selectedSceneForVideo}
            onVideoCreated={handleVideoCreated}
            generatedVideos={generatedVideos}
          />
        )}

        {activeTab === 'encapsulation' && <EncapsulationVisualizerTab />}

        {activeTab === 'troubleshooting' && <TroubleshootingTab />}

        {activeTab === 'slides' && <SlidesExportTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              {isCustomSource && sourceMeta?.title ? `${sourceMeta.title} • 720p Studio` : 'OSI-Modell 720p Studio'}
            </span>
            <span>&bull;</span>
            <span>YouTube Decomposer &bull; Cartesia TTS &bull; Gemini Omni 1.1 Flash</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{isCustomSource ? `${studioScenes.length} Segmente geladen` : 'Schichten 1–7 • Kapselung • Troubleshooting'}</span>
            <span className="font-mono text-amber-500/80">
              Gesamt: {studioScenes.reduce((acc, s) => acc + s.durationSeconds, 0)}s
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
