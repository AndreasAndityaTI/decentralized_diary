// Service to manage diary entry CIDs and fetch data from IPFS
import { fetchEntriesFromIpfs, fetchAllDiaryEntriesFromPinata } from "./ipfs";

const ENTRIES_STORAGE_KEY = "diary-entry-cids";

// Get all stored CIDs
export function getStoredCids(): string[] {
  try {
    const stored = localStorage.getItem(ENTRIES_STORAGE_KEY);
    const cids = stored ? JSON.parse(stored) : [];
    console.log("📋 Loaded CIDs from localStorage:", cids);
    return cids;
  } catch (error) {
    console.error("Failed to load stored CIDs:", error);
    return [];
  }
}

// Add a new CID to storage
export function addCid(cid: string): void {
  console.log("🔍 addCid called with CID:", cid);
  console.log("🔍 CID length:", cid?.length);
  console.log("🔍 CID type:", typeof cid);

  const cids = getStoredCids();
  if (!cids.includes(cid)) {
    const updatedCids = [cid, ...cids]; // Add to beginning
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(updatedCids));
    console.log("💾 Added CID to localStorage:", cid);
    console.log("📋 All CIDs now:", updatedCids);
  } else {
    console.log("⚠️ CID already exists:", cid);
  }
}

// Remove a CID from storage
export function removeCid(cid: string): void {
  const cids = getStoredCids();
  const updatedCids = cids.filter((storedCid) => storedCid !== cid);
  localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(updatedCids));
}

// Clear all CIDs
export function clearAllCids(): void {
  localStorage.removeItem(ENTRIES_STORAGE_KEY);
}

// Fetch all entries from IPFS using stored CIDs (legacy method)
export async function fetchAllEntries(): Promise<
  Array<{ entry: any; cid: string }>
> {
  const cids = getStoredCids();

  if (cids.length === 0) {
    console.log("⚠️ No CIDs found in localStorage - returning empty array");
    return [];
  }

  try {
    console.log(`🔄 Fetching ${cids.length} entries from IPFS...`);
    console.log("📋 CIDs to fetch:", cids);
    const entries = await fetchEntriesFromIpfs(cids);
    console.log(`✅ Successfully fetched ${entries.length} entries from IPFS`);
    console.log("📝 Fetched entries data:", entries);
    return entries;
  } catch (error) {
    console.error("❌ Failed to fetch entries from IPFS:", error);
    return [];
  }
}

// Fetch all diary entries live from IPFS via Pinata API
export async function fetchAllEntriesLive(
  walletAddress?: string
): Promise<Array<{ entry: any; cid: string }>> {
  try {
    console.log("🌐 Fetching diary entries live from IPFS via Pinata...");
    console.log("🔍 Filtering by wallet address:", walletAddress);
    const entries = await fetchAllDiaryEntriesFromPinata(walletAddress);

    if (entries.length > 0) {
      console.log(
        `✅ Successfully fetched ${entries.length} entries live from IPFS`
      );
      return entries;
    } else {
      console.log(
        "⚠️ No entries found via Pinata API, trying localStorage fallback..."
      );
      // Fallback to localStorage CIDs if Pinata API doesn't find anything
      const cids = getStoredCids();
      if (cids.length > 0) {
        console.log(
          `🔄 Found ${cids.length} CIDs in localStorage, fetching from IPFS...`
        );
        const fallbackEntries = await fetchEntriesFromIpfs(cids);

        // Filter by wallet address if provided
        if (walletAddress && walletAddress !== "") {
          console.log(
            `🔍 Filtering fallback entries by wallet: ${walletAddress}`
          );
          const filteredEntries = fallbackEntries.filter(({ entry }) => {
            // Check if entry has wallet address that matches current wallet
            const entryWallet = entry.walletAddress || "unknown";
            const matches = entryWallet === walletAddress;
            console.log(`🔍 Entry wallet: ${entryWallet}, matches: ${matches}`);
            return matches;
          });
          console.log(
            `✅ Fallback - Successfully fetched ${filteredEntries.length} wallet-specific entries from localStorage CIDs`
          );
          return filteredEntries;
        } else {
          console.log(
            `✅ Fallback - Successfully fetched ${fallbackEntries.length} entries from localStorage CIDs`
          );
          return fallbackEntries;
        }
      } else {
        console.log("⚠️ No CIDs found in localStorage either");
        return [];
      }
    }
  } catch (error) {
    console.error("❌ Failed to fetch entries live from IPFS:", error);
    console.log("🔄 Trying localStorage fallback...");

    // Fallback to localStorage CIDs if Pinata API fails
    try {
      const cids = getStoredCids();
      if (cids.length > 0) {
        console.log(
          `🔄 Found ${cids.length} CIDs in localStorage, fetching from IPFS...`
        );
        const fallbackEntries = await fetchEntriesFromIpfs(cids);

        // Filter by wallet address if provided
        if (walletAddress && walletAddress !== "") {
          console.log(
            `🔍 Filtering error fallback entries by wallet: ${walletAddress}`
          );
          const filteredEntries = fallbackEntries.filter(({ entry }) => {
            // Check if entry has wallet address that matches current wallet
            const entryWallet = entry.walletAddress || "unknown";
            const matches = entryWallet === walletAddress;
            console.log(`🔍 Entry wallet: ${entryWallet}, matches: ${matches}`);
            return matches;
          });
          console.log(
            `✅ Error Fallback - Successfully fetched ${filteredEntries.length} wallet-specific entries from localStorage CIDs`
          );
          return filteredEntries;
        } else {
          console.log(
            `✅ Error Fallback - Successfully fetched ${fallbackEntries.length} entries from localStorage CIDs`
          );
          return fallbackEntries;
        }
      }
    } catch (fallbackError) {
      console.error("❌ Fallback method also failed:", fallbackError);
    }

    return [];
  }
}

// Fetch a single entry by CID
export async function fetchEntryByCid(
  cid: string
): Promise<{ entry: any; cid: string } | null> {
  try {
    const entries = await fetchEntriesFromIpfs([cid]);
    return entries[0] || null;
  } catch (error) {
    console.error(`Failed to fetch entry ${cid}:`, error);
    return null;
  }
}
