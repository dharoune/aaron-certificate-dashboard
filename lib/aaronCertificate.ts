export const AARON_CERTIFICATE_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function owner() view returns (address)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function nextTokenId() view returns (uint256)",
  "function issueCertificate(address recipient, string metadataURI) returns (uint256)",
  "event CertificateIssued(uint256 indexed tokenId, address indexed recipient, string tokenURI)",
] as const;

const contractAddress =
  process.env.NEXT_PUBLIC_CERTIFICATE_ADDRESS;

if (!contractAddress) {
  throw new Error(
    "NEXT_PUBLIC_CERTIFICATE_ADDRESS is missing from .env.local",
  );
}

export const AARON_CERTIFICATE_ADDRESS: string =
  contractAddress;