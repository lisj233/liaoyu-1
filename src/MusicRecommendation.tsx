import React, { useState, useRef, useEffect } from 'react';
import { Music, Headphones, Radio, Disc, Heart, Activity, Moon, Sun, User, Calendar, AlertCircle, Frown, Smile } from 'lucide-react';

const MusicRecommendation: React.FC = () => {
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');
  const [currentMood, setCurrentMood] = useState<string>('');
  const [discomfort, setDiscomfort] = useState<string[]>([]);
  const [musicPreference, setMusicPreference] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const recommendationRef = useRef<HTMLDivElement>(null);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAge(value);
    
    if (value === '') {
      setAgeError('');
      return;
    }

    const ageNum = parseInt(value);
    if (isNaN(ageNum)) {
      setAgeError('请输入有效的年龄');
    } else if (ageNum < 0) {
      setAgeError('年龄不能为负数');
    } else if (ageNum > 120) {
      setAgeError('请输入合理的年龄');
    } else {
      setAgeError('');
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleRecommendation = async () => {
    if (ageError) return;
    
    setLoading(true);
    setRecommendation('');
    try {
      // 获取当前时间
      const now = new Date();
      const currentHour = now.getHours();
      const timeOfDay = currentHour < 6 ? '凌晨' : 
                       currentHour < 12 ? '上午' : 
                       currentHour < 18 ? '下午' : '晚上';
      
      const prompt = `作为一位专业的音乐治疗师，请为一位${age}岁的${gender === '男' ? '男性' : '女性'}患者提供${timeOfDay}的音乐治疗建议。

患者目前的情况：
- 当前情绪状态：${currentMood}
- 身体不适：${discomfort.join('、')}
- 音乐偏好：${musicPreference.join('、')}

特别说明：
1. 这是一个全新的音乐推荐清单，请不要重复之前的推荐
2. 考虑到现在是${timeOfDay}，请推荐特别适合这个时间段聆听的音乐
3. 每次推荐应该包含一些最新发布或最近流行的音乐作品
4. 音乐风格要有新鲜感和多样性，不要局限于单一风格
5. 至少推荐5首歌曲，可以更多

请提供：
1. 针对性的音乐推荐（至少5首）：
   - 必须是网易云音乐、QQ音乐或哔哩哔哩平台的链接
   - 每首歌必须包含以下内容：
     a) 歌曲名称和演唱者
     b) 详细的推荐理由（包括音乐元素分析，如节奏、旋律特点等）
     c) 这首歌如何帮助缓解患者当前的情绪或症状
     d) 具体的收听建议：
        * 最佳收听时间（如晨起、午后、入睡前等）
        * 建议收听时长
        * 收听时的环境建议（如安静的房间、户外等）
        * 配合的放松技巧或简单活动

2. 整体聆听建议：
   - 每日音乐治疗的最佳时间段
   - 如何根据情绪变化调整收听计划
   - 音量和音质的控制建议
   - 所有推荐歌曲的最佳收听顺序和组合方式

3. 康复建议：
   - 结合音乐的情绪管理技巧
   - 针对具体身体不适的缓解方法
   - 如何将音乐疗愈融入日常生活

4. 饮食建议：
   - 配合音乐治疗的饮食注意事项
   - 有助于身心康复的食物推荐

请以专业、温暖的语气回复，并确保建议具有针对性和可操作性。每首推荐的音乐都要有明确的目的性，并与患者的年龄、性别、当前状态和时间段紧密相关。`;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-d8614ad8c5cc46908ab221a65d17d250'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一位经验丰富的音乐治疗师，特别擅长为恶性肿瘤康复患者提供音乐疗愈方案。你具有深厚的医学背景和丰富的临床经验，能够将音乐治疗与康复医学完美结合。

你的回答应该：
1. 体现专业性和人文关怀
2. 根据患者的年龄、性别和当前时间特点提供个性化建议
3. 使用温暖、鼓励的语气
4. 提供具体、可执行的建议
5. 关注患者的整体康复，包括身体、心理和社交层面
6. 只推荐网易云音乐、QQ音乐或哔哩哔哩平台的音乐链接
7. 为每首推荐的音乐提供详细的理由和具体的收听指导
8. 说明每首音乐的治疗价值和预期效果
9. 结合患者的具体情况和当前时间，提供个性化的收听建议
10. 每次推荐都应该是新的组合，避免重复之前的推荐
11. 优先推荐一些新发布或最近流行的音乐作品
12. 根据不同时间段（早晨、中午、下午、晚上）调整推荐策略

请记住，你的建议可能会对患者的康复产生重要影响，所以需要特别谨慎和用心。每个建议都应该有科学依据和临床实践支持。同时，保持推荐的新鲜度和多样性，让患者每天都能获得新的音乐体验。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9, // 增加随机性
          max_tokens: 2000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                setRecommendation(prev => prev + parsed.choices[0].delta.content);
              }
            } catch (e) {
              console.error('解析响应数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setRecommendation('获取推荐失败，请稍后重试。错误信息：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 添加自动滚动效果
  useEffect(() => {
    if (recommendationRef.current) {
      recommendationRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [recommendation]);

  const genderOptions = [
    { value: '男', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '女', icon: User, color: 'text-pink-500', bg: 'bg-pink-50' },
  ];

  const ageOptions = [
    { value: '18-30岁', icon: Calendar, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '31-45岁', icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '46-60岁', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '60岁以上', icon: Calendar, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const currentMoodOptions = [
    { value: '精力充沛', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '心态平稳', icon: Heart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '有些疲惫', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '感到烦恼', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '情绪低落', icon: Frown, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const discomfortOptions = [
    { value: '无不良反应', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '恶心呕吐', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '食欲不振', icon: Frown, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '持续疼痛感', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '耳鸣眩晕', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const musicOptions = [
    { value: '古典音乐', icon: Music, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: '民乐', icon: Music, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '轻音乐', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '电子音乐', icon: Music, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '流行音乐', icon: Music, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '摇滚乐', icon: Music, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '自然音乐', icon: Music, color: 'text-teal-500', bg: 'bg-teal-50' },
    { value: '说唱', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      {/* 性别选择 */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">性别</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {genderOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setGender(option.value)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  gender === option.value
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 ${gender === option.value ? option.color : 'text-gray-400'} mr-3`} />
                <span className={`text-base font-medium ${gender === option.value ? 'text-gray-700' : 'text-gray-500'}`}>
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 年龄输入 */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center mr-3">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">年龄</h3>
        </div>
        <input
          type="number"
          value={age}
          onChange={handleAgeChange}
          placeholder="请输入年龄"
          className="w-full max-w-xs px-6 py-3 text-lg rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>

      {/* 当前情绪 */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center mr-3">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">当前情绪</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentMoodOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setCurrentMood(option.value)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  currentMood === option.value
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 ${currentMood === option.value ? option.color : 'text-gray-400'} mr-3`} />
                <span className={`text-base font-medium ${currentMood === option.value ? 'text-gray-700' : 'text-gray-500'}`}>
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 身体不适选择 */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mr-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">身体不适</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {discomfortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleArrayItem(discomfort, option.value, setDiscomfort)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  discomfort.includes(option.value)
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 ${discomfort.includes(option.value) ? option.color : 'text-gray-400'} mr-3`} />
                <span className={`text-base font-medium ${discomfort.includes(option.value) ? 'text-gray-700' : 'text-gray-500'}`}>
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 音乐偏好选择 */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 flex items-center justify-center mr-3">
            <Music className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">音乐偏好</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {musicOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleArrayItem(musicPreference, option.value, setMusicPreference)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  musicPreference.includes(option.value)
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 ${musicPreference.includes(option.value) ? option.color : 'text-gray-400'} mr-3`} />
                <span className={`text-base font-medium ${musicPreference.includes(option.value) ? 'text-gray-700' : 'text-gray-500'}`}>
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="mt-12">
        <button
          onClick={handleRecommendation}
          disabled={loading || !gender || !age || ageError || !currentMood || discomfort.length === 0 || musicPreference.length === 0}
          className={`w-full py-4 px-6 rounded-2xl text-white font-medium transition-all duration-300 ${
            loading || !gender || !age || ageError || !currentMood || discomfort.length === 0 || musicPreference.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95 shadow-lg'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              获取音乐推荐中...
            </div>
          ) : (
            '获取音乐建议'
          )}
        </button>
      </div>

      {/* 推荐结果 */}
      {recommendation && (
        <div 
          ref={recommendationRef}
          className="mt-8 p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl"
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">为您推荐的音乐</h3>
          <div className="prose prose-lg max-w-none">
            {recommendation.split('\n').map((line, index) => (
              <p key={index} className="mb-4">
                {line.startsWith('http') ? (
                  <a
                    href={line}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline break-all"
                  >
                    {line}
                  </a>
                ) : (
                  <span className="whitespace-pre-wrap">{line}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicRecommendation; 