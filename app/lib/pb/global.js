import PocketBase from "pocketbase";
import { LRUCache } from 'lru-cache';
import { POCKETBASE_URL } from "../env";

export const createPB = (() => {
  const pb = new PocketBase(
    POCKETBASE_URL || "http://127.0.0.1:8090",
  );
  pb.autoCancellation(false);
  return pb;
});

export const globalPB = createPB();

const options = {
  ttl: 1000 * 60 * 30, // 30 minutes
  ttlAutopurge: true
};

export const pbUserCache = new LRUCache(options);