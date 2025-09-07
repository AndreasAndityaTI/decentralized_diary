// Simple IPFS upload via a pinning provider HTTP API (configure via env)
// For production, use secure server-side proxy to hide keys.

import axios from 'axios'

export type IpfsUploadResult = {
  cid: string
  url: string
}

const IPFS_ENDPOINT = import.meta.env.VITE_IPFS_ENDPOINT || '' // e.g., https://api.pinata.cloud/pinning/pinJSONToIPFS
const IPFS_AUTH = import.meta.env.VITE_IPFS_AUTH || '' // e.g., 'Bearer <token>' or 'pinata_api_key:pinata_secret_api_key'

export async function uploadJsonToIpfs(data: any): Promise<IpfsUploadResult> {
  if (!IPFS_ENDPOINT) throw new Error('Missing VITE_IPFS_ENDPOINT')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (IPFS_AUTH) headers['Authorization'] = IPFS_AUTH

  const res = await axios.post(IPFS_ENDPOINT, data, { headers })

  // Normalize common pinning provider responses
  const cid = res.data?.IpfsHash || res.data?.cid || res.data?.Hash
  if (!cid) throw new Error('IPFS response missing CID')

  return { cid, url: `ipfs://${cid}` }
}