import dotenv from 'dotenv';

dotenv.config();

const MY_NODE_ID = process.env.MY_NODE_ID || 'group-careaid';
const GROUP3_PEER_URL = process.env.GROUP3_PEER_URL || '';
const P2P_SECRET = process.env.P2P_SECRET || 'campus-p2p-shared-secret-2026';

export interface P2PEventPayload {
  messageId: string;
  originNodeId: string;
  eventType: 'TICKET_CREATED' | 'TICKET_UPDATED' | 'HEARTBEAT';
  timestamp: string;
  data: any;
}

export const broadcastToGroup3 = async (eventType: P2PEventPayload['eventType'], data: any): Promise<void> => {
  if (!GROUP3_PEER_URL) {
    console.warn('⚠️ No Group 3 peer URL configured in GROUP3_PEER_URL');
    return;
  }

  const payload: P2PEventPayload = {
    messageId: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    originNodeId: MY_NODE_ID,
    eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  try {
    console.log(`📡 [P2P Outbound] Sending ${eventType} to Group 3 (${GROUP3_PEER_URL})...`);
    
    const response = await fetch(GROUP3_PEER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-P2P-Secret': P2P_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`❌ [P2P Outbound] Group 3 responded with status ${response.status}`);
      return;
    }

    console.log(`✅ [P2P Outbound] Group 3 acknowledged event ${payload.messageId}`);
  } catch (error) {
    console.error('❌ [P2P Outbound] Failed to send event to Group 3:', error);
  }
};