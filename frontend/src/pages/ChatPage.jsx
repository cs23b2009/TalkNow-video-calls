import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessages, sendMessage, notifyUser, getChatUsers } from "../lib/api";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import { Send, Image, Video, Phone, ArrowLeft, MoreVertical, Search, Smile, Film } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

import ChatLoader from "../components/ChatLoader";
import PageLoader from "../components/PageLoader";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const { socket, onlineUsers } = useSocket();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Fetch messages history
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", targetUserId],
    queryFn: () => getMessages(targetUserId),
    enabled: !!targetUserId,
  });

  // Fetch target user info (from friends/users list)
  const { data: users = [] } = useQuery({
    queryKey: ["chatUsers"],
    queryFn: getChatUsers,
  });

  const targetUser = users.find((u) => u._id === targetUserId);
  const isOnline = onlineUsers.includes(targetUserId);

  // Send message mutation
  const { mutate: sendMsg, isPending: isSending } = useMutation({
    mutationFn: (data) => sendMessage(targetUserId, data),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(["messages", targetUserId], (old) => [...old, newMessage]);
      setMessage("");
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !targetUserId) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === targetUserId || newMessage.receiverId === targetUserId) {
        queryClient.setQueryData(["messages", targetUserId], (old = []) => {
          if (old.some(m => m._id === newMessage._id)) return old;
          return [...old, newMessage];
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, targetUserId, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    sendMsg({ text: message });
  };

  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleGifSearch = async (e) => {
    const term = e.target.value;
    setGifSearch(term);
    if (term.length > 2) {
      try {
        const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${term}&key=LIVD6SJCUA3R&client_key=talknow&limit=12`);
        const data = await res.json();
        setGifs(data.results || []);
      } catch (err) {
        console.error("Gif fetch error", err);
      }
    }
  };

  const selectGif = (gifUrl) => {
    sendMsg({ image: gifUrl });
    setShowGifPicker(false);
  };

  const handleVideoCall = () => {
    const callUrl = `${window.location.origin}/call/${[authUser._id, targetUserId].sort().join("-")}`;
    sendMsg({ text: `I've started a video call. Join me here: ${callUrl}` });
    notifyUser(targetUserId, "call").catch(err => console.log("Call notification error:", err));
    navigate(`/call/${[authUser._id, targetUserId].sort().join("-")}`);
  };

  if (messagesLoading) return <ChatLoader />;

  return (
    <div className="flex flex-col h-[93vh] bg-base-100 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-circle md:hidden">
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={targetUser?.profilePic || "/avatar.png"} alt={targetUser?.fullName} />
              </div>
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100 animate-pulse"></span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base">{targetUser?.fullName || "Chat"}</h3>
            <p className="text-xs opacity-60">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleVideoCall} className="btn btn-circle btn-ghost btn-sm text-primary">
            <Video size={20} />
          </button>
          <button className="btn btn-circle btn-ghost btn-sm opacity-60">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100 pattern-grid">
        {messages.map((msg) => (
          <div
            key={msg._id || Math.random()}
            className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="w-8 rounded-full">
                <img
                  src={msg.senderId === authUser._id ? authUser.profilePic : targetUser?.profilePic || "/avatar.png"}
                  alt="Avatar"
                />
              </div>
            </div>
            <div className={`chat-bubble max-w-[80%] ${
              msg.senderId === authUser._id ? "chat-bubble-primary" : "bg-base-200"
            } p-0 overflow-hidden`}>
              {msg.image ? (
                <div className="flex flex-col">
                   <img 
                    src={msg.image} 
                    alt="Media" 
                    className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(msg.image, "_blank")}
                   />
                   {msg.text && <p className="px-3 py-2 text-sm md:text-base">{msg.text}</p>}
                </div>
              ) : (
                <p className="px-3 py-2 text-sm md:text-base">{msg.text}</p>
              )}
            </div>
            <div className="chat-footer opacity-50 text-[10px] mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Gif Picker Popover */}
      {showGifPicker && (
        <div className="absolute bottom-24 left-4 right-4 bg-base-200 rounded-2xl shadow-2xl p-4 border border-base-300 z-50 animate-in slide-in-from-bottom-5">
           <div className="flex items-center gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Search GIFs..." 
                className="input input-sm input-bordered flex-1"
                value={gifSearch}
                onChange={handleGifSearch}
                autoFocus
              />
              <button onClick={() => setShowGifPicker(false)} className="btn btn-sm btn-ghost">Close</button>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {gifs.map((gif) => (
                <img 
                  key={gif.id} 
                  src={gif.media_formats.tinygif.url} 
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => selectGif(gif.media_formats.gif.url)}
                />
              ))}
              {gifs.length === 0 && <p className="col-span-full text-center opacity-50 py-8">Search for awesome GIFs!</p>}
           </div>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden" ref={emojiPickerRef}>
          <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-base-200/50 border-t border-base-300 z-20">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button 
                type="button" 
                className={`btn btn-ghost btn-circle btn-sm ${showEmojiPicker ? 'text-primary' : ''}`}
                onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
            >
              <Smile size={22} />
            </button>
            <button 
                type="button" 
                className={`btn btn-ghost btn-circle btn-sm ${showGifPicker ? 'text-primary' : ''}`}
                onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
            >
              <Film size={24} />
            </button>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message...`}
              className="input input-bordered w-full pr-10 focus:ring-2 focus:ring-primary transition-all rounded-2xl"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => { setShowEmojiPicker(false); setShowGifPicker(false); }}
              disabled={isSending}
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-60 hover:opacity-100">
              <Image size={20} />
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-circle shadow-lg active:scale-95"
            disabled={!message.trim() || isSending}
          >
            <Send size={20} className="rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
