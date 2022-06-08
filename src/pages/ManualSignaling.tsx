import { useEffect, useState, useRef } from "react";

function ManualSignaling() {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();

  const sdpRemoteTextRef = useRef<HTMLTextAreaElement>(null);
  const sdpLocalTextRef = useRef<HTMLTextAreaElement>(null);

  const rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    (async () => {
      await addVideoStream();
      callAction();
    })();

    return;
  }, []);

  /** send local SDP */
  const sendSDP = (
    description: RTCSessionDescription | RTCSessionDescriptionInit
  ) => {
    if (sdpLocalTextRef.current && description.sdp) {
      sdpLocalTextRef.current.value = description.sdp;
      sdpLocalTextRef.current.select();
      sdpLocalTextRef.current.focus();
    }
  };

  /** on icecandidate event */
  const handleConnection = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      console.log(event.candidate);
    } else {
      console.log("ice candidate data is ready");
      if (!peerConnection?.remoteDescription) {
        console.log("offer in ice");
        console.log(peerConnection);
        console.log("offer");
        // createOffer();
      } else {
        // setOffer();
      }
    }
  };

  /** setup icecandidate and media stream (you should do this at first) */
  const callAction = () => {
    if (!peerConnection) {
      const newPeerConnection = new RTCPeerConnection(rtcConfig);
      console.log("calling...");
      newPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(event.candidate);
        } else {
          console.log("ice candidate data is ready");
          if (!newPeerConnection.remoteDescription) {
            console.log("ice offer");
            newPeerConnection.createOffer().then((description) => {
              console.log(description)
              newPeerConnection.setLocalDescription(description);
              sendSDP(description);
            });
          } else {
            newPeerConnection.createAnswer().then((description) => {
              newPeerConnection.setLocalDescription(description);
              sendSDP(description);
            });
            // createAnswer();
          }
        }
      };

      // settings for remote stream
      newPeerConnection.ontrack = (event: RTCTrackEvent) => {
        console.log("recieved remote stream");
        console.log(event.streams);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        } else console.log("remoteVideoRef is null");
      };

      // add WebCam stream to peer connection
      console.log("add track to connection");
      localStreamRef.current?.getTracks().forEach((track) => {
        if (localStreamRef.current)
          newPeerConnection.addTrack(track, localStreamRef.current);
      });

      setPeerConnection(newPeerConnection);
    }
  };

  const createOffer = () => {
    peerConnection
      ?.createOffer({ offerToReceiveVideo: true })
      .then((description) => {
        console.log(description);

        peerConnection
          .setLocalDescription(description)
          .then(() => {
            console.log("localpeer connection setLocalDescription success");
          })
          .catch((error) => {
            console.log("create Offer Error");
            console.log(error);
          });

        sendSDP(description);
      });
  };

  const setOffer = () => {
    const sdpText = sdpRemoteTextRef.current?.value;
    if (sdpText) {
      const remoteDescription = new RTCSessionDescription({
        type: "offer",
        sdp: sdpText,
      });
      peerConnection?.setRemoteDescription(remoteDescription).then(() => {
        console.log("remote offer is set");
        createAnswer();
      });
    }
  };

  const createAnswer = () => {
    peerConnection?.createAnswer().then((description) => {
      console.log(description);
      peerConnection
        ?.setLocalDescription(description)
        .then(() => {
          console.log("localpeer connection setLocalDescription success");
        })
        .catch((error) => {
          console.log(error);
        });

      sendSDP(description);
    });
  };

  const setAnswer = () => {
    const sdpText = sdpRemoteTextRef.current?.value;
    if (sdpText) {
      const remoteDescription = new RTCSessionDescription({
        type: "answer",
        sdp: sdpText,
      });
      peerConnection?.setRemoteDescription(remoteDescription).then(() => {
        console.log("remote answer is set");
      });
    }
  };

  /** set WebCam video stream */
  const addVideoStream = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    console.log("local stream");
    console.log(localStreamRef.current);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  return (
    <div className="App">
      <div>
        <p>socket address</p>
      </div>
      <video style={{ width: 400 }} ref={localVideoRef} autoPlay playsInline />
      <video style={{ width: 400 }} ref={remoteVideoRef} autoPlay playsInline />
      <br />
      {/* <button onClick={addVideoStream}>camera on</button> */}
      <button onClick={createOffer}>create offer</button>
      <button onClick={setOffer}>set offer</button>
      <button onClick={setAnswer}>set answer</button>
      <button onClick={() => console.log(peerConnection)}>show info</button>
      <div>
        local sdp
        <textarea ref={sdpLocalTextRef} rows={5} cols={60}></textarea>
      </div>
      <div>
        remote sdp
        <textarea ref={sdpRemoteTextRef} rows={5} cols={60}></textarea>
      </div>
    </div>
  );
}

export default ManualSignaling;
