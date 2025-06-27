import React, { useState, useRef, useEffect } from 'react';
import { Music, Headphones, Radio, Disc, Heart, Activity, Moon, Sun, User, Calendar, AlertCircle, Frown, Smile, AlertTriangle, Edit, UtensilsCrossed, Volume2, Droplet, Wind } from 'lucide-react';
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

const PrettySlider = styled(Slider)({
  height: 8,
  padding: '28px 0',
  '& .MuiSlider-rail': {
    height: 8,
    borderRadius: 4,
    background: '#f3f4f6',
  },
  '& .MuiSlider-track': {
    height: 8,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #ffb199 0%, #ffecd2 100%)',
  },
  '& .MuiSlider-thumb': {
    height: 32,
    width: 32,
    backgroundColor: '#fff',
    border: '3px solid #90caf9',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(33,150,243,0.10)',
    marginTop: -18,
    marginLeft: -16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 4px 12px rgba(33,150,243,0.18)',
      borderColor: '#42a5f5',
    },
    '& .MuiSlider-valueLabel': {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'transparent',
      color: '#42a5f5',
      fontWeight: 700,
      fontSize: 18,
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
  },
});

const MusicRecommendation: React.FC = () => {
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');
  const [musicPreference, setMusicPreference] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const recommendationRef = useRef<HTMLDivElement>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [todayIds, setTodayIds] = useState<string[]>([]);

  const andersonSymptomList = [
    { key: 'pain', label: '您疼痛最严重的程度为？', required: true },
    { key: 'fatigue', label: '您疲劳（乏力）最严重的程度为？', required: true },
    { key: 'distress', label: '您心烦最严重的程度为？', required: true },
    { key: 'sleep', label: '您睡眠不安最严重的程度为？', required: true },
    { key: 'nausea', label: '您恶心呕吐最严重的程度为？', required: true },
    { key: 'sadness', label: '您悲伤最严重的程度为？', required: false },
    { key: 'drymouth', label: '您口干最严重的程度为？', required: false },
    { key: 'vomit', label: '您呕吐最严重的程度为？', required: false },
    { key: 'drowsy', label: '您嗜睡（昏昏欲睡）最严重的程度为？', required: false },
    { key: 'appetite', label: '您食欲下降的程度为？', required: false },
    { key: 'insomnia', label: '您睡眠质量最差的程度为？', required: false },
    { key: 'numb', label: '您麻木感最严重的程度为？', required: false },
    { key: 'depression', label: '您情绪低落最严重的程度为？', required: false },
  ];

  const [andersonSymptoms, setAndersonSymptoms] = useState<{ [key: string]: number | undefined }>({});

  const handleSymptomChange = (key: string, value: number) => {
    setAndersonSymptoms(prev => ({ ...prev, [key]: value }));
  };

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

  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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
      // 校验必填项
      const requiredUnfilled = andersonSymptomList.filter(item => item.required && (andersonSymptoms[item.key] === undefined)).length > 0;
      // 生成安德森症状评估描述
      const symptomDescArr = andersonSymptomList
        .map(item => {
          const val = andersonSymptoms[item.key];
          if (val === undefined) return null;
          let level = '';
          if (val >= 7) level = '重度';
          else if (val >= 4) level = '中度';
          else level = '轻度';
          return `${item.label}：${val}分（${level}）`;
        })
        .filter(Boolean);
      const andersonDesc = symptomDescArr.length > 0
        ? `\n安德森症状评估（选填）：${symptomDescArr.join('，')}。请结合这些症状分数，给出更有针对性的音乐推荐和康复建议。`
        : '';
      // 动态生成 prompt
      let userInfoDesc = `年龄：${age}，性别：${gender}`;
      if (diseaseType) userInfoDesc += `，疾病类型：${diseaseType === '其他' ? customDisease : diseaseType}`;
      if (emotion) userInfoDesc += `，当前情绪：${emotion}`;
      if (symptoms.length > 0) userInfoDesc += `，症状表现：${symptoms.join('、')}`;
      userInfoDesc += `，当前时间：${timeOfDay}`;

      const prompt = `作为一位专业的音乐治疗师，请为一位${userInfoDesc}的患者，结合以下症状评估和音乐偏好，提供个性化的音乐治疗建议：\n\n- 音乐偏好：${musicPreference.join('、')}\n- 当前症状评估：${symptomDescArr.join('，')}\n\n请推荐至少5首适合患者当前状态的音乐（网易云音乐、QQ音乐或哔哩哔哩平台链接），每首歌需包含：歌曲名称、演唱者、推荐理由、治疗价值、具体收听建议。并给出整体聆听建议、康复建议和饮食建议。要求内容新颖、科学、温暖、鼓励。`;

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
              content: `你是一位经验丰富的音乐治疗师，特别擅长为恶性肿瘤康复患者提供音乐疗愈方案。你具有深厚的医学背景和丰富的临床经验，能够将音乐治疗与康复医学完美结合。\n\n你的回答应该：\n1. 体现专业性和人文关怀\n2. 根据患者的年龄、性别和当前时间特点提供个性化建议\n3. 使用温暖、鼓励的语气\n4. 提供具体、可执行的建议\n5. 关注患者的整体康复，包括身体、心理和社交层面\n6. 只推荐网易云音乐、QQ音乐或哔哩哔哩平台的音乐链接\n7. 为每首推荐的音乐提供详细的理由和具体的收听指导\n8. 说明每首音乐的治疗价值和预期效果\n9. 结合患者的具体情况和当前时间，提供个性化的收听建议\n10. 每次推荐都应该是新的组合，避免重复之前的推荐\n11. 优先推荐一些新发布或最近流行的音乐作品\n12. 根据不同时间段（早晨、中午、下午、晚上）调整推荐策略\n\n请记住，你的建议可能会对患者的康复产生重要影响，所以需要特别谨慎和用心。每个建议都应该有科学依据和临床实践支持。同时，保持推荐的新鲜度和多样性，让患者每天都能获得新的音乐体验。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          temperature: 0.9
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

      // 统计患者编号
      const today = getToday();
      const key = `musicrec_${today}`;
      let idArr: string[] = [];
      try {
        idArr = JSON.parse(localStorage.getItem(key) || '[]');
      } catch {}
      if (!idArr.includes(patientId)) {
        idArr.push(patientId);
        localStorage.setItem(key, JSON.stringify(idArr));
      }
      setTodayIds(idArr);
    } catch (error) {
      console.error('Error:', error);
      setRecommendation('获取推荐失败，请稍后重试。错误信息：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recommendationRef.current) {
      recommendationRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [recommendation]);

  useEffect(() => {
    const today = getToday();
    let idArr: string[] = [];
    try {
      idArr = JSON.parse(localStorage.getItem(`musicrec_${today}`) || '[]');
    } catch {}
    setTodayIds(idArr);
  }, []);

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
  const musicPreferenceOptions = [
    { value: '古典', icon: Disc, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: '民谣', icon: Radio, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '轻音乐', icon: Music, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '电子', icon: Activity, color: 'text-pink-500', bg: 'bg-pink-50' },
    { value: '流行', icon: Headphones, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '摇滚', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '自然', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '说唱', icon: undefined, emoji: '🕶️', color: 'text-gray-500', bg: 'bg-gray-50' },
    { value: '爵士', icon: Smile, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { value: '蓝调', icon: Heart, color: 'text-blue-800', bg: 'bg-blue-100' },
    { value: 'R&B', icon: Moon, color: 'text-pink-800', bg: 'bg-pink-100' },
  ];

  const requiredSymptoms = andersonSymptomList.filter(item => item.required);
  const optionalSymptoms = andersonSymptomList.filter(item => !item.required);
  const [showOptional, setShowOptional] = useState(false);

  const symptomEmojis: { [key: string]: string } = {
    pain: '🩹',
    fatigue: '😪',
    distress: '😣',
    sleep: '🌙',
    nausea: '🤢',
    sadness: '😢',
    drymouth: '💧',
    vomit: '🤮',
    drowsy: '😴',
    appetite: '🍽️',
    insomnia: '🛌',
    numb: '🦶',
    depression: '💔',
  };

  const requiredUnfilled = requiredSymptoms.some(item => andersonSymptoms[item.key] === undefined);

  const diseaseTypeOptions = [
    { value: '乳腺肿瘤相关', label: '乳腺肿瘤相关', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { value: '其他', label: '其他', icon: Edit, color: 'text-gray-500', bg: 'bg-gray-50' },
  ];
  const emotionOptions = [
    { value: '紧张/焦虑', label: '紧张/焦虑', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '担忧', label: '担忧', icon: AlertCircle, color: 'text-pink-500', bg: 'bg-pink-50' },
    { value: '难以放松', label: '难以放松', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '不安', label: '不安', icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '易烦躁', label: '易烦躁', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '害怕', label: '害怕', icon: Frown, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: '平静', label: '平静', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
  ];
  const bodyOptions = [
    { value: '无不良反应', label: '无不良反应', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '食欲不振', label: '食欲不振', icon: UtensilsCrossed, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '恶心呕吐', label: '恶心呕吐', icon: AlertCircle, color: 'text-pink-500', bg: 'bg-pink-50' },
    { value: '持续疼痛感', label: '持续疼痛感', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '耳鸣眩晕', label: '耳鸣眩晕', icon: Volume2, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];
  const [diseaseType, setDiseaseType] = useState<string>('');
  const [customDisease, setCustomDisease] = useState<string>('');
  const [emotion, setEmotion] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const symptomOptions = [
    { value: '疼痛', label: '疼痛', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: '疲劳', label: '疲劳', icon: Frown, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { value: '心烦', label: '心烦', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { value: '睡眠障碍', label: '睡眠障碍', icon: Moon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '恶心/呕吐', label: '恶心/呕吐', icon: AlertCircle, color: 'text-pink-500', bg: 'bg-pink-50' },
    { value: '食欲下降', label: '食欲下降', icon: UtensilsCrossed, color: 'text-green-500', bg: 'bg-green-50' },
    { value: '口干', label: '口干', icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-100' },
    { value: '嗜睡', label: '嗜睡', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { value: '情绪低落', label: '情绪低落', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '气短', label: '气短', icon: Wind, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ];
  const [symptoms, setSymptoms] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* 患者编号输入 */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">患者编号</h3>
        </div>
        <input
          type="text"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          placeholder="请输入患者编号"
          className="w-full max-w-xs px-6 py-3 text-lg rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>
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
      {/* 疾病类型选择 */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-100 to-pink-200 flex items-center justify-center mr-3">
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">疾病类型</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {diseaseTypeOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setDiseaseType(option.value)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  diseaseType === option.value
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 mr-3 ${diseaseType === option.value ? option.color : 'text-gray-400'}`} />
                <span className={`text-base font-medium ${diseaseType === option.value ? 'text-gray-700' : 'text-gray-500'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
        {diseaseType === '其他' && (
          <input
            type="text"
            value={customDisease}
            onChange={e => setCustomDisease(e.target.value)}
            placeholder="请输入疾病类型"
            className="w-full mt-4 px-4 py-3 text-base rounded-2xl border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
          />
        )}
      </div>
      {/* 当前情绪板块 */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center mr-3">
            <Smile className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">当前情绪</h3>
            <span className="text-gray-500 text-xs ml-4 whitespace-nowrap">依据GAD-7焦虑症筛查量表设计</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {emotionOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setEmotion(option.value)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  emotion === option.value
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 mr-3 ${emotion === option.value ? option.color : 'text-gray-400'}`} />
                <span className={`text-base font-medium ${emotion === option.value ? 'text-gray-700' : 'text-gray-500'}`}>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* 症状表现板块（多选） */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mr-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">症状表现</h3>
            <span className="text-gray-500 text-xs ml-4 whitespace-nowrap">依据安德森症状评估量表设计</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {symptomOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => toggleArrayItem(symptoms, option.value, setSymptoms)}
                className={`flex items-center p-4 rounded-2xl transition-all duration-300 ${
                  symptoms.includes(option.value)
                    ? `${option.bg} ring-2 ring-offset-2 ring-${option.color.split('-')[1]}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:shadow-sm'
                }`}
              >
                <Icon className={`w-6 h-6 mr-3 ${symptoms.includes(option.value) ? option.color : 'text-gray-400'}`} />
                <span className={`text-base font-medium ${symptoms.includes(option.value) ? 'text-gray-700' : 'text-gray-500'}`}>{option.label}</span>
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
          {musicPreferenceOptions.map((option) => {
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
                {option.emoji ? (
                  <span className={`w-6 h-6 text-2xl mr-3 ${musicPreference.includes(option.value) ? option.color : 'text-gray-400'}`}>{option.emoji}</span>
                ) : (
                  <option.icon className={`w-6 h-6 ${musicPreference.includes(option.value) ? option.color : 'text-gray-400'} mr-3`} />
                )}
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
          disabled={Boolean(loading || !patientId || !gender || !diseaseType || (diseaseType === '其他' && !customDisease) || !emotion || !symptoms.length || !age || ageError || musicPreference.length === 0)}
          className={`w-full py-4 px-6 rounded-2xl text-white font-medium transition-all duration-300 ${
            loading || !patientId || !gender || !diseaseType || (diseaseType === '其他' && !customDisease) || !emotion || !symptoms.length || !age || ageError || musicPreference.length === 0
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
          <div className="prose prose-lg max-w-none whitespace-pre-line">
            {(recommendation || '').replace(/[\*#]/g, '')}
          </div>
        </div>
      )}
      {/* 今日已生成推荐的编号 */}
      {todayIds.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
          今日已生成推荐的患者编号：{todayIds.join('，')}
        </div>
      )}
    </div>
  );
};

export default MusicRecommendation; 