// Enhanced IPFS upload with Pinata metadata support
// For production, use secure server-side proxy to hide keys.

import axios from "axios";

export type IpfsUploadResult = {
  cid: string;
  url: string;
  pinataMetadata?: {
    name: string;
    keyvalues: Record<string, string>;
  };
};

export type DiaryEntryMetadata = {
  title: string;
  mood: string;
  date: string;
  wordCount: number;
  walletAddress: string; // Add wallet address to metadata
};

// Option 1: Environment variables (recommended)
const IPFS_ENDPOINT = (import.meta as any).env.VITE_IPFS_ENDPOINT || ""; // e.g., https://api.pinata.cloud/pinning/pinFileToIPFS
const IPFS_AUTH = (import.meta as any).env.VITE_IPFS_AUTH || ""; // e.g., 'Bearer <token>' or 'pinata_api_key:pinata_secret_api_key'

// Option 2: Hardcoded (for quick testing only)
// const IPFS_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
// const IPFS_AUTH = "Bearer YOUR_JWT_TOKEN_HERE";

export async function uploadJsonToIpfs(
  data: any,
  metadata?: DiaryEntryMetadata
): Promise<IpfsUploadResult> {
  // Convert JSON to File for pinFileToIPFS (supports private files)
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], `${metadata?.title || "diary-entry"}.json`, {
    type: "application/json",
  });

  // Create FormData for file upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: metadata?.title || "Diary Entry",
      keyvalues: {
        mood: metadata?.mood || "unknown",
        date: metadata?.date || new Date().toISOString().split("T")[0],
        wc: metadata?.wordCount?.toString() || "0",
        type: "diary",
        wallet: metadata?.walletAddress || "unknown",
      },
    })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({
      cidVersion: 0,
      wrapWithDirectory: false,
      private: true, // Make files private
    })
  );

  const headers: Record<string, string> = {};
  if (IPFS_AUTH) headers["Authorization"] = IPFS_AUTH;

  // Use pinFileToIPFS endpoint for private files
  const endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  // Debug: Log the upload details
  console.log("🔍 Uploading file to IPFS:", {
    fileName: file.name,
    fileSize: file.size,
    metadata: metadata,
    endpoint: endpoint,
  });

  // Debug: Log the FormData contents
  console.log("🔍 FormData contents:");
  for (let [key, value] of formData.entries()) {
    if (key === "file") {
      console.log(
        `  ${key}:`,
        (value as File).name,
        `(${(value as File).size} bytes)`
      );
    } else {
      console.log(`  ${key}:`, value);
    }
  }

  const res = await axios.post(endpoint, formData, {
    headers: {
      ...headers,
      "Content-Type": "multipart/form-data",
    },
  });

  // Debug: Log the full response
  console.log("🔍 Full IPFS response:", res.data);
  console.log("🔍 Response status:", res.status);
  console.log("🔍 Response headers:", res.headers);

  const cid = res.data?.IpfsHash || res.data?.cid || res.data?.Hash;
  console.log("🔍 Extracted CID:", cid);
  console.log("🔍 CID length:", cid?.length);
  if (!cid) throw new Error("IPFS response missing CID");

  return {
    cid,
    url: `ipfs://${cid}`,
    pinataMetadata: {
      name: metadata?.title || "Diary Entry",
      keyvalues: {
        mood: metadata?.mood || "unknown",
        date: metadata?.date || new Date().toISOString().split("T")[0],
        wc: metadata?.wordCount?.toString() || "0",
        type: "diary",
        wallet: metadata?.walletAddress || "unknown",
      },
    },
  };
}

// Helper function to extract metadata from diary entry
export function extractDiaryMetadata(
  entry: any,
  walletAddress?: string
): DiaryEntryMetadata {
  const wordCount = (entry.content || "")
    .split(/\s+/)
    .filter((word: string) => word.length > 0).length;
  const mood = entry.mood || "neutral";
  const date = entry.createdAt
    ? new Date(entry.createdAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  console.log(
    "🔍 extractDiaryMetadata called with walletAddress:",
    walletAddress
  );

  return {
    title: entry.title || "Untitled Entry",
    mood,
    date,
    wordCount,
    walletAddress: walletAddress || "unknown",
  };
}

// IPFS Gateway URLs for fetching data (prioritize Pinata for private files)
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/", // Pinata gateway (supports private files)
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

// Function to fetch data from IPFS
export async function fetchFromIpfs(cid: string): Promise<any> {
  // Try multiple gateways for reliability
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${cid}`;

      // Add authentication headers for Pinata gateway (private files)
      const headers: any = {
        Accept: "application/json",
      };

      // Note: Removed Authorization header due to CORS issues with Pinata gateway
      // Private files will still be accessible via other gateways

      const response = await fetch(url, {
        method: "GET",
        headers,
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}${cid}:`, error);
      // Continue to next gateway
    }
  }

  throw new Error(`Failed to fetch data from IPFS for CID: ${cid}`);
}

// Function to fetch multiple entries from IPFS
export async function fetchEntriesFromIpfs(
  cids: string[]
): Promise<Array<{ entry: any; cid: string }>> {
  const entries: Array<{ entry: any; cid: string }> = [];

  // Fetch all entries in parallel
  const fetchPromises = cids.map(async (cid) => {
    try {
      const entry = await fetchFromIpfs(cid);
      return { entry, cid };
    } catch (error) {
      console.error(`Failed to fetch entry ${cid}:`, error);
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);

  // Filter out failed fetches and sort by creation date
  return results
    .filter((result): result is { entry: any; cid: string } => result !== null)
    .sort(
      (a, b) =>
        new Date(b.entry.createdAt).getTime() -
        new Date(a.entry.createdAt).getTime()
    );
}

// Function to fetch all diary entries from Pinata API (live from IPFS)
export async function fetchAllDiaryEntriesFromPinata(
  walletAddress?: string
): Promise<Array<{ entry: any; cid: string }>> {
  // Try environment variables first
  let PINATA_API_KEY = (import.meta as any).env.VITE_PINATA_API_KEY;
  let PINATA_SECRET = (import.meta as any).env.VITE_PINATA_SECRET;

  // Fallback to hardcoded values for testing
  if (!PINATA_API_KEY || !PINATA_SECRET) {
    console.log(
      "🔄 Environment variables not loaded, using hardcoded values for testing..."
    );
    PINATA_API_KEY = "f112531b016705fc0552";
    PINATA_SECRET =
      "e3cc738ffae2f34b49c01635b173c114c4be7d989e1334cb6e791a2e4a806ff7";
  }

  console.log("🔍 Environment variables in ipfs.ts:");
  console.log("All env vars:", (import.meta as any).env);
  console.log("PINATA_API_KEY:", PINATA_API_KEY);
  console.log("PINATA_SECRET:", PINATA_SECRET);
  console.log("🔍 Filtering by wallet address:", walletAddress);
  console.log("🔍 Wallet address type:", typeof walletAddress);
  console.log("🔍 Wallet address length:", walletAddress?.length);

  if (!PINATA_API_KEY || !PINATA_SECRET) {
    console.error("❌ Missing Pinata API credentials for live fetching");
    console.error(
      "PINATA_API_KEY:",
      PINATA_API_KEY ? "✅ Present" : "❌ Missing"
    );
    console.error(
      "PINATA_SECRET:",
      PINATA_SECRET ? "✅ Present" : "❌ Missing"
    );
    return [];
  }

  try {
    console.log("🔍 Fetching all pinned files from Pinata...");

    // Get all pinned files from Pinata
    console.log("🔍 Making Pinata API request with:");
    console.log("API_KEY:", PINATA_API_KEY);
    console.log("SECRET:", PINATA_SECRET ? "Present" : "Missing");

    // Use API key + secret approach (JWT token doesn't have pinList scope)
    console.log("🔄 Using API key + secret approach...");
    const response = await fetch("https://api.pinata.cloud/data/pinList", {
      method: "GET",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
    });

    console.log("🔍 Pinata API response status:", response.status);
    console.log("🔍 Pinata API response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Pinata API error response:", errorText);
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("📋 Found pinned files:", data);
    console.log("📊 Total pinned files:", data.rows?.length || 0);

    // Log all files to see what we have
    if (data.rows && data.rows.length > 0) {
      console.log("🔍 All pinned files details:");
      data.rows.forEach((file: any, index: number) => {
        console.log(`File ${index + 1}:`, {
          name: file.metadata?.name,
          type: file.metadata?.keyvalues?.type,
          cid: file.ipfs_pin_hash,
          metadata: file.metadata,
        });
      });
    }

    // Filter for diary entries - be more flexible
    const diaryFiles = data.rows.filter((file: any) => {
      const hasDiaryType = file.metadata?.keyvalues?.type === "diary";
      const hasDiaryName =
        file.metadata?.name?.includes("Diary Entry") ||
        file.metadata?.name?.includes("diary") ||
        file.metadata?.name?.includes("entry");
      const hasDiaryKeyvalues =
        file.metadata?.keyvalues?.mood ||
        file.metadata?.keyvalues?.date ||
        file.metadata?.keyvalues?.wc;

      // Filter by wallet address if provided
      const matchesWallet =
        walletAddress && walletAddress !== ""
          ? file.metadata?.keyvalues?.wallet === walletAddress
          : file.metadata?.keyvalues?.wallet === "unknown"; // Only show old entries when no wallet connected

      console.log(`Checking file ${file.ipfs_pin_hash}:`, {
        hasDiaryType,
        hasDiaryName,
        hasDiaryKeyvalues,
        matchesWallet,
        fileWallet: file.metadata?.keyvalues?.wallet,
        requestedWallet: walletAddress,
        metadata: file.metadata,
      });

      return (
        (hasDiaryType || hasDiaryName || hasDiaryKeyvalues) && matchesWallet
      );
    });

    console.log("📝 Found diary entries:", diaryFiles);
    console.log("📊 Diary entries count:", diaryFiles.length);

    if (diaryFiles.length === 0) {
      console.log("⚠️ No diary entries found with metadata filtering");
      console.log("🔄 Trying to fetch ALL pinned files as fallback...");

      // Fallback: try to fetch all pinned files and see which ones contain diary data
      const allFiles = data.rows;
      console.log(
        `📋 Trying to fetch content from all ${allFiles.length} pinned files...`
      );

      const allEntries = await fetchEntriesFromIpfs(
        allFiles.map((file: any) => file.ipfs_pin_hash)
      );

      // Filter entries that look like diary entries based on content
      const diaryEntries = allEntries.filter(({ entry }) => {
        const hasTitle = entry.title && typeof entry.title === "string";
        const hasContent = entry.content && typeof entry.content === "string";
        const hasCreatedAt =
          entry.createdAt && typeof entry.createdAt === "string";
        const hasMood = entry.mood && typeof entry.mood === "string";

        console.log(`Checking entry content:`, {
          hasTitle,
          hasContent,
          hasCreatedAt,
          hasMood,
          title: entry.title,
          mood: entry.mood,
        });

        return hasTitle && hasContent && hasCreatedAt;
      });

      console.log(
        `✅ Found ${diaryEntries.length} diary entries from content analysis`
      );
      return diaryEntries;
    }

    // Fetch the actual content for each diary entry
    const entries = await fetchEntriesFromIpfs(
      diaryFiles.map((file: any) => file.ipfs_pin_hash)
    );

    console.log(
      `✅ Successfully fetched ${entries.length} diary entries from IPFS`
    );
    return entries;
  } catch (error) {
    console.error("❌ Failed to fetch diary entries from Pinata API:", error);
    console.log("🔄 Trying fallback method with API key + secret...");

    // Fallback: Try using API key + secret to get pinned files
    try {
      // Use API key + secret for fallback too (JWT doesn't have pinList scope)
      console.log("🔑 Using API key + secret fallback...");
      const response = await fetch("https://api.pinata.cloud/data/pinList", {
        method: "GET",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📋 Fallback - Found pinned files:", data);

        const diaryFiles = data.rows.filter(
          (file: any) =>
            file.metadata?.keyvalues?.type === "diary" ||
            file.metadata?.name?.includes("Diary Entry")
        );

        if (diaryFiles.length > 0) {
          const entries = await fetchEntriesFromIpfs(
            diaryFiles.map((file: any) => file.ipfs_pin_hash)
          );
          console.log(
            `✅ Fallback - Successfully fetched ${entries.length} diary entries`
          );
          return entries;
        }
      }
    } catch (fallbackError) {
      console.error("❌ Fallback method also failed:", fallbackError);
    }

    return [];
  }
}
