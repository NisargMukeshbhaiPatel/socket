import { NextResponse } from 'next/server';
import PBUser from '@/lib/pb/user';
import PBNotification from '@/lib/pb/notification';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const pbUser = await PBUser.get();
    const pbOrg = await pbUser.getOrg(orgId);
    const notifications = await PBNotification.getMyNotifications(pbOrg);
    
    return NextResponse.json(notifications.map(n => n.notification));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
