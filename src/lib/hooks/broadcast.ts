/**
 * Custom hook for cross-tab communication using BroadcastChannel API
 */

import { useEffect, useRef, useCallback } from 'react';

export type BroadcastMessage = 
  | { type: 'TASK_CREATED'; data: any }
  | { type: 'TASK_UPDATED'; data: any }
  | { type: 'TASK_DELETED'; data: { id: string } }
  | { type: 'TASK_STATUS_CHANGED'; data: { id: string; status: string } }
  | { type: 'TASK_PRIORITY_CHANGED'; data: { id: string; priority: string } }
  | { type: 'REFRESH_DASHBOARD'; data?: any };

export function useBroadcastChannel(
  channelName: string = 'vibe-tasks-sync',
  onMessage?: (message: BroadcastMessage) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  
  // Update ref when callback changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Initialize channel
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      channelRef.current = new BroadcastChannel(channelName);
      
      const handleMessage = (event: MessageEvent<BroadcastMessage>) => {
        console.log('BroadcastChannel received message:', event.data);
        onMessageRef.current?.(event.data);
      };

      channelRef.current.addEventListener('message', handleMessage);

      return () => {
        if (channelRef.current) {
          channelRef.current.removeEventListener('message', handleMessage);
          channelRef.current.close();
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported:', error);
    }
  }, [channelName]); // Remove onMessage from dependencies

  // Send message to other tabs
  const sendMessage = useCallback((message: BroadcastMessage) => {
    if (channelRef.current) {
      console.log('BroadcastChannel sending message:', message);
      channelRef.current.postMessage(message);
    }
  }, []);

  // Specific message senders
  const broadcastTaskCreated = useCallback((task: any) => {
    sendMessage({ type: 'TASK_CREATED', data: task });
  }, [sendMessage]);

  const broadcastTaskUpdated = useCallback((task: any) => {
    sendMessage({ type: 'TASK_UPDATED', data: task });
  }, [sendMessage]);

  const broadcastTaskDeleted = useCallback((taskId: string) => {
    sendMessage({ type: 'TASK_DELETED', data: { id: taskId } });
  }, [sendMessage]);

  const broadcastTaskStatusChanged = useCallback((taskId: string, status: string) => {
    sendMessage({ type: 'TASK_STATUS_CHANGED', data: { id: taskId, status } });
  }, [sendMessage]);

  const broadcastTaskPriorityChanged = useCallback((taskId: string, priority: string) => {
    sendMessage({ type: 'TASK_PRIORITY_CHANGED', data: { id: taskId, priority } });
  }, [sendMessage]);

  const broadcastRefreshDashboard = useCallback(() => {
    sendMessage({ type: 'REFRESH_DASHBOARD' });
  }, [sendMessage]);

  return {
    sendMessage,
    broadcastTaskCreated,
    broadcastTaskUpdated,
    broadcastTaskDeleted,
    broadcastTaskStatusChanged,
    broadcastTaskPriorityChanged,
    broadcastRefreshDashboard,
  };
}
