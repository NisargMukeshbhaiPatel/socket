import { LRUCache } from 'lru-cache';
import PBUser from "@/lib/pb/user";

const options = {
    ttl: 1000 * 60 * 60, // 1hr
    ttlAutopurge: true
};

const cache = new LRUCache(options);

export async function GET(request) {
    const user = await PBUser.get();
    const pb = user.pb;

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const size = searchParams.get('size') || '100'; //Supported : 64, 100, 128

    let userData;
    try {
        userData = await pb.collection('users').getOne(id);
    } catch (error) {
        return new Response(null, { status: 404 });
    }

    if (!userData || !userData.avatar) {
        return new Response(null, { status: 404 });
    }

    const url = pb.files.getUrl(userData, userData.avatar, { thumb: `${size}x${size}` });
    let buffer = cache.get(url);
    if (!buffer) {
        buffer = await fetch(url).then(res => res.arrayBuffer());
        cache.set(url, buffer);
    }

    return new Response(buffer, { 
        headers: { 
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600'
        } 
    });
}
