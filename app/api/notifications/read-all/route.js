import { NextResponse } from 'next/server';
import PBUser from '@/lib/pb/user';
import PBNotification from '@/lib/pb/notification';

export async function POST(request) {
  try {
    const { orgId } = await request.json();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const notifications = await PBNotification.getMyNotifications(pbOrg);
    
    await Promise.all(notifications.map(notification => notification.markRead()));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
  }
}
