import { createClient } from '../src';

async function setupRealtime() {
  const client = createClient({
    baseUrl: 'http://127.0.0.1:8000/api/v1',
    token: 'YOUR_JWT_ACCESS_TOKEN',
  });

  // 1. Real-time push notification subscription
  const notificationSub = client.notifications.subscribe({
    onOpen: () => console.log('Connected to real-time notification stream.'),
    onNotification: (notif) => {
      console.log(`[ALERT - ${notif.type?.toUpperCase()}]: ${notif.title} -> ${notif.content}`);
    },
    onError: (err) => console.error('Notification WS Error:', err),
  });

  // 2. Real-time workspace chat connection
  const workspaceId = '00000000-0000-0000-0000-000000000001';
  const chat = client.workspaces.connectChat(workspaceId, {
    onOpen: () => {
      console.log('Connected to workspace chat room.');
      chat.send({ content: 'Hello colleagues, reviewing Maharashtra Cadastral Draft.' });
    },
    onMessage: (msg) => {
      if (msg.type === 'message' && msg.data) {
        console.log(`[Chat ${msg.data.sender_id}]: ${msg.data.content}`);
      }
    },
  });

  // Clean shutdown after demonstration
  setTimeout(() => {
    console.log('Closing real-time channels...');
    notificationSub.close();
    chat.close();
  }, 10000);
}

setupRealtime();
