import Peer, { DataConnection } from 'peerjs';

export const createPeer = (id?: string) => {
  return new Peer(id, {
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });
};
