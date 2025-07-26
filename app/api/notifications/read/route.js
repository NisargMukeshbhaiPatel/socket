import { NextResponse } from 'next/server';
import PBUser from '@/lib/pb/user';
import PBNotification from '@/lib/pb/notification';

export async function POST(request) {
  try {
    const { orgId, notificationId } = await request.json();
    if (!orgId || !notificationId) {
      throw new Error('Organization ID and Notification ID are required');
    }

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const notification = await PBNotification.get(pbOrg, notificationId);
    await notification.markRead();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
