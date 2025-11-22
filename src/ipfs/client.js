export async function uploadToIPFS(file) {
  if (!file) throw new Error('No file provided for IPFS upload.');

  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const apiSecret = import.meta.env.VITE_PINATA_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Pinata API credentials are not configured. Set VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your environment.'
    );
  }

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
      body: formData,
    });

    let payload;
    try {
      payload = await response.json();
    } catch (e) {
      payload = null;
    }

    if (!response.ok) {
      let message = '';
      if (payload && (payload.error || payload.message)) {
        message = String(payload.error || payload.message);
      } else {
        message = `HTTP ${response.status} ${response.statusText || ''}`.trim();
      }

      const lower = message.toLowerCase();
      if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('forbidden')) {
        throw new Error(
          'Pinata authentication failed. Check that VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET match your Pinata project settings.'
        );
      }

      throw new Error('Failed to upload document to IPFS. Please try again.');
    }

    const cid =
      (payload && (payload.IpfsHash || payload.ipfsHash || payload.cid)) ||
      null;

    if (!cid) {
      throw new Error('Pinata response did not include a CID.');
    }

    return cid;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to upload document to IPFS. Please try again.');
  }
}
