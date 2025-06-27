import React, { useState, useEffect } from 'react';
import MusicRecommendation from './MusicRecommendation';
import { Music, Pause, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audio] = useState(new Audio('/Limerick -班得瑞.mp3'));
  const navigate = useNavigate();

  useEffect(() => {
    audio.loop = true;
    
    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('自动播放被阻止，需要用户手动触发播放');
        setIsPlaying(false);
      }
    };

    attemptAutoplay();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  useEffect(() => {
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('播放被阻止:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* 右上角按钮组 */}
      <div className="fixed top-4 right-4 flex gap-3 z-50">
        <button
          onClick={() => navigate('/admin')}
          className="p-3 rounded-full bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group"
          title="管理后台"
        >
          <Shield className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group"
          title={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          ) : (
            <Music className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">音乐治疗推荐系统</h1>
          <p className="text-lg text-gray-600">
            让音乐为您的康复之旅带来温暖与力量
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl p-8">
          <MusicRecommendation />
        </div>
      </div>
    </div>
  );
};

export default App;