import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useSocket } from "../context/SocketContext";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, User } from "lucide-react";
import toast from "react-hot-toast";

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { socket } = useSocket();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  
  // Perfect Negotiation States
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);
  const isSettingRemoteAnswerPending = useRef(false);
  const iceCandidatesBuffer = useRef([]);

  // Derive target user ID from callId
  const targetUserId = callId.split("-").find((id) => id !== authUser?._id);
  
  // We are "polite" if our ID is alphabetically higher (standard convention)
  const polite = authUser?._id > targetUserId;

  const createPeer = useCallback(() => {
    console.log("Creating RTCPeerConnection, polite:", polite);
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate to:", targetUserId);
        socket.emit("ice-candidate", { to: targetUserId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      console.log("Remote track received");
      setRemoteStream(event.streams[0]);
      setIsConnecting(false);
    };

    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      if (peer.connectionState === "connected") {
        setIsConnecting(false);
        toast.success("Connected!");
      }
      if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
        toast.error("Call disconnected");
        setTimeout(() => navigate(-1), 2000);
      }
    };

    return peer;
  }, [socket, targetUserId, polite, navigate]);

  // Handle Negotiation Needed (Perfect Negotiation style)
  const onNegotiationNeeded = useCallback(async () => {
    try {
      makingOffer.current = true;
      await peerRef.current.setLocalDescription();
      socket.emit("peer:nego:needed", { to: targetUserId, offer: peerRef.current.localDescription });
    } catch (err) {
      console.error("Negotiation error:", err);
    } finally {
      makingOffer.current = false;
    }
  }, [socket, targetUserId]);

  useEffect(() => {
    if (!socket || !authUser || !targetUserId) return;

    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const peer = createPeer();
        peerRef.current = peer;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.onnegotiationneeded = onNegotiationNeeded;

        // Signaling handlers
        socket.on("peer:nego:needed", async ({ offer }) => {
          try {
            const description = new RTCSessionDescription(offer);
            const readyForOffer = !makingOffer.current && (peer.signalingState === "stable" || isSettingRemoteAnswerPending.current);
            const offerCollision = !readyForOffer;

            ignoreOffer.current = !polite && offerCollision;
            if (ignoreOffer.current) {
                console.log("Ignoring offer collision (impolite)");
                return;
            }

            isSettingRemoteAnswerPending.current = description.type === "answer";
            await peer.setRemoteDescription(description);
            isSettingRemoteAnswerPending.current = false;

            if (description.type === "offer") {
              await peer.setLocalDescription();
              socket.emit("peer:nego:done", { to: targetUserId, answer: peer.localDescription });
            }

            // Flush buffered candidates
            while (iceCandidatesBuffer.current.length) {
              await peer.addIceCandidate(iceCandidatesBuffer.current.shift());
            }
          } catch (err) {
            console.error("Signal handling error:", err);
          }
        });

        socket.on("peer:nego:final", async ({ answer }) => {
           try {
             await peer.setRemoteDescription(new RTCSessionDescription(answer));
           } catch (err) {
             console.error("Final negotiation error:", err);
           }
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          try {
            const iceCandidate = new RTCIceCandidate(candidate);
            if (peer.remoteDescription && peer.remoteDescription.type) {
                await peer.addIceCandidate(iceCandidate);
            } else {
                iceCandidatesBuffer.current.push(iceCandidate);
            }
          } catch (err) {
            console.error("ICE candidate error:", err);
          }
        });

        // Initiator logic (Initial call signaling)
        socket.on("incoming:call", async ({ from, offer }) => {
            if (from !== targetUserId) return;
            console.log("Handling incoming call from:", from);
            // This is handled by the generic negotiation logic now
            // But we can trigger it here if it's the first offer
        });

      } catch (err) {
        console.error("Media access error:", err);
        toast.error("Could not access camera/microphone");
      }
    };

    setupMedia();

    return () => {
      socket.off("peer:nego:needed");
      socket.off("peer:nego:final");
      socket.off("ice-candidate");
      socket.off("incoming:call");
      localStream?.getTracks().forEach(track => track.stop());
      peerRef.current?.close();
    };
  }, [socket, authUser, targetUserId, createPeer, onNegotiationNeeded]);

  // Handle video display
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    localStream.getAudioTracks()[0].enabled = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    localStream.getVideoTracks()[0].enabled = !isCameraOff;
    setIsCameraOff(!isCameraOff);
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    peerRef.current?.close();
    navigate(-1);
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full"></div>

      {/* Main Video Area */}
      <div className="w-full max-w-6xl aspect-video bg-black/40 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white">
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
              <User size={64} className="opacity-40" />
            </div>
            <p className="text-xl font-light tracking-widest uppercase">Connecting...</p>
          </div>
        )}

        {/* Local Video Pip */}
        <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-black/60 rounded-2xl overflow-hidden border border-white/20 shadow-xl z-20 transition-all hover:scale-105">
           <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="mt-8 flex items-center gap-6 p-4 px-8 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl z-30 transform transition-transform hover:scale-105">
        <button 
          onClick={toggleMute}
          className={`btn btn-circle btn-lg border-none ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"} text-white transition-all`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={toggleCamera}
          className={`btn btn-circle btn-lg border-none ${isCameraOff ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"} text-white transition-all`}
        >
          {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        <div className="w-[1px] h-10 bg-white/10 mx-2"></div>

        <button 
          onClick={endCall}
          className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-900/40 transform hover:rotate-12 transition-all"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Info Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-tighter uppercase px-3 py-1 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
        P2P Encrypted Session • WebRTC 1.0
      </div>
    </div>
  );
};

export default CallPage;
