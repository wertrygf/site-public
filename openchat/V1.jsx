import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, Moon, Sun } from 'lucide-react';

export default function OpenChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const userIdRef = useRef('user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isUsernameSet) return;

    const WEBSOCKET_URL = 'wss://socketsbay.com/wss/v2/1/demo/';
    
    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected');
        const joinMsg = {
          type: 'join',
          userId: userIdRef.current,
          username: username,
          timestamp: Date.now()
        };
        ws.send(JSON.stringify(joinMsg));

        const systemMsg = {
          id: Date.now(),
          user: 'システム',
          text: username + 'さんが参加しました',
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        };
        setMessages(prev => [...prev, systemMsg]);
        
        const broadcastMsg = {
          type: 'message',
          data: systemMsg
        };
        ws.send(JSON.stringify(broadcastMsg));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message' && data.data) {
            setMessages(prev => {
              const exists = prev.find(m => m.id === data.data.id);
              if (exists) return prev;
              return [...prev, data.data];
            });
          } else if (data.type === 'userCount') {
            setOnlineUsers(data.count);
          }
        } catch (e) {
          console.log('Message parse error:', e);
        }
      };

      ws.onerror = () => {
        console.log('WebSocket error');
      };

      ws.onclose = () => {
        console.log('Disconnected');
      };

      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', userId: userIdRef.current }));
        }
      }, 30000);

      return () => {
        clearInterval(heartbeat);
        if (ws.readyState === WebSocket.OPEN) {
          const leaveMsg = {
            id: Date.now(),
            user: 'システム',
            text: username + 'さんが退出しました',
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
          };
          ws.send(JSON.stringify({ type: 'message', data: leaveMsg }));
          ws.send(JSON.stringify({ type: 'leave', userId: userIdRef.current }));
        }
        ws.close();
      };
    } catch (error) {
      console.log('Connection error:', error);
      const errorMsg = {
        id: Date.now(),
        user: 'システム',
        text: 'ローカルモードで動作中（同一ブラウザのみ）',
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  }, [isUsernameSet, username]);

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now() + Math.random(),
        user: username,
        text: inputText,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        isSystem: false
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'message', data: newMessage }));
      }
      
      setInputText('');
    }
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  if (!isUsernameSet) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center p-4`}>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 w-full max-w-md relative`}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute top-4 right-4 p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-all`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="flex items-center justify-center mb-6">
            <MessageCircle className={`w-12 h-12 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <h1 className={`text-3xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>オープンチャット</h1>
          <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>ユーザー名を入力して参加</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, handleSetUsername)}
            placeholder="ユーザー名を入力"
            className={`w-full px-4 py-3 border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'} rounded-lg focus:outline-none focus:border-indigo-500 mb-4`}
            maxLength={20}
          />
          <button
            onClick={handleSetUsername}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            チャットに参加
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto h-screen flex flex-col p-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-2xl shadow-lg p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <MessageCircle className={`w-8 h-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>オープンチャット</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>リアルタイムで会話しましょう</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-all`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">{onlineUsers}</span>
            </div>
          </div>
        </div>

        <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 overflow-y-auto shadow-lg`}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={msg.isSystem ? 'flex justify-center' : ''}>
                {msg.isSystem ? (
                  <div className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} px-4 py-2 rounded-full text-sm`}>
                    {msg.text}
                  </div>
                ) : (
                  <div className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${msg.user === username ? 'bg-indigo-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'} rounded-2xl px-4 py-3`}>
                      {msg.user !== username && (
                        <div className="text-xs font-semibold mb-1 opacity-70">{msg.user}</div>
                      )}
                      <div className="break-words">{msg.text}</div>
                      <div className={`text-xs mt-1 ${msg.user === username ? 'text-indigo-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-b-2xl shadow-lg p-4`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
              placeholder="メッセージを入力..."
              className={`flex-1 px-4 py-3 border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800'} rounded-lg focus:outline-none focus:border-indigo-500`}
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
