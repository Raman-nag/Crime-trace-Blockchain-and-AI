import { create } from 'ipfs-http-client';

let cachedClient;

function getIpfsClient() {
  if (cachedClient) return cachedClient;

  const projectId = import.meta.env.VITE_IPFS_PROJECT_ID;
  const projectSecret = import.meta.env.VITE_IPFS_PROJECT_SECRET;
  const endpoint = import.meta.env.VITE_IPFS_ENDPOINT || 'https://ipfs.infura.io:5001';

  if (!projectId || !projectSecret) {
    throw new Error('IPFS credentials are not configured. Set VITE_IPFS_PROJECT_ID and VITE_IPFS_PROJECT_SECRET.');
  }

  const auth = `Basic ${btoa(`${projectId}:${projectSecret}`)}`;

  cachedClient = create({
    url: `${endpoint}/api/v0`,
    headers: {
      Authorization: auth,
    },
  });

  return cachedClient;
}

export async function uploadToIPFS(file) {
  if (!file) throw new Error('No file provided for IPFS upload.');
  const client = getIpfsClient();
  const added = await client.add(file);
  return added.cid.toString();
}
