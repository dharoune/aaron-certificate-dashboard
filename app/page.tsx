"use client";

import { useState } from "react";
import {
  BrowserProvider,
  Contract,
  getAddress,
} from "ethers";

import {
  AARON_CERTIFICATE_ABI,
  AARON_CERTIFICATE_ADDRESS,
} from "@/lib/aaronCertificate";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

const BSC_TESTNET_CHAIN_ID = 97;

type CertificateMetadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type?: string;
    value?: string | number;
  }>;
};

export default function Home() {
  const [walletAddress, setWalletAddress] =
    useState("");

  const [networkName, setNetworkName] =
    useState("");

  const [isAdmin, setIsAdmin] =
    useState(false);

  // Issue certificate
  const [recipient, setRecipient] =
    useState("");

  const [recipientName, setRecipientName] =
    useState("");

  const [courseName, setCourseName] =
    useState("Blockchain Technology");

  const [issueDate, setIssueDate] =
    useState("");

  const [metadataURI, setMetadataURI] =
    useState("");

  const [issueStatus, setIssueStatus] =
    useState("");

  const [transactionHash, setTransactionHash] =
    useState("");

  // Verify certificate
  const [tokenId, setTokenId] =
    useState("");

  const [certificateOwner, setCertificateOwner] =
    useState("");

  const [certificateURI, setCertificateURI] =
    useState("");

  const [verifyStatus, setVerifyStatus] =
    useState("");

  const [
    certificateMetadata,
    setCertificateMetadata,
  ] = useState<CertificateMetadata | null>(
    null,
  );

  const [metadataError, setMetadataError] =
    useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
      }

      const provider = new BrowserProvider(
        window.ethereum,
      );

      const signer = await provider.getSigner();

      const address =
        await signer.getAddress();

      const network =
        await provider.getNetwork();

      setWalletAddress(address);

      if (
        Number(network.chainId) ===
        BSC_TESTNET_CHAIN_ID
      ) {
        setNetworkName(
          "BNB Smart Chain Testnet",
        );
      } else {
        setNetworkName(
          `Wrong network (${network.chainId.toString()})`,
        );
      }

      const contract = new Contract(
        AARON_CERTIFICATE_ADDRESS,
        AARON_CERTIFICATE_ABI,
        provider,
      );

      const contractOwner: string =
        await contract.owner();

      setIsAdmin(
        contractOwner.toLowerCase() ===
          address.toLowerCase(),
      );
    } catch (error) {
      console.error(error);
      alert("Unable to connect wallet.");
    }
  }

  async function switchToBscTestnet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
      }

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x61",
            },
          ],
        });
      } catch (error: unknown) {
        const switchError = error as {
          code?: number;
        };

        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x61",
                chainName:
                  "BNB Smart Chain Testnet",
                nativeCurrency: {
                  name: "tBNB",
                  symbol: "tBNB",
                  decimals: 18,
                },
                rpcUrls: [
                  "https://bsc-testnet-dataseed.bnbchain.org",
                ],
                blockExplorerUrls: [
                  "https://testnet.bscscan.com",
                ],
              },
            ],
          });
        } else {
          throw error;
        }
      }

      await connectWallet();
    } catch (error) {
      console.error(error);
      alert(
        "Unable to switch to BNB Smart Chain Testnet.",
      );
    }
  }

  async function createCertificateMetadata(
    certificateId: string,
  ) {
    const response = await fetch(
      "/api/create-metadata",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientName,
          courseName,
          issueDate,
          certificateId,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(
        errorData.error ??
          "Unable to create certificate metadata.",
      );
    }

    const result = (await response.json()) as {
      success: boolean;
      cid: string;
      metadataURI: string;
    };

    return result;
  }

  async function issueCertificate() {
    try {
      setIssueStatus("");
      setTransactionHash("");

      if (!window.ethereum) {
        setIssueStatus(
          "MetaMask is not installed.",
        );
        return;
      }

      if (!recipientName.trim()) {
        setIssueStatus(
          "Enter the recipient's full name.",
        );
        return;
      }

      if (!courseName.trim()) {
        setIssueStatus(
          "Enter the course or program name.",
        );
        return;
      }

      if (!issueDate) {
        setIssueStatus(
          "Select the certificate issue date.",
        );
        return;
      }

      if (
        !/^0x[a-fA-F0-9]{40}$/.test(
          recipient.trim(),
        )
      ) {
        setIssueStatus(
          "Enter a valid recipient wallet address.",
        );
        return;
      }

      const cleanRecipient = getAddress(
        recipient.trim().toLowerCase(),
      );

      const provider = new BrowserProvider(
        window.ethereum,
      );

      const network =
        await provider.getNetwork();

      if (
        Number(network.chainId) !==
        BSC_TESTNET_CHAIN_ID
      ) {
        setIssueStatus(
          "Please switch to BNB Smart Chain Testnet.",
        );
        return;
      }

      const signer =
        await provider.getSigner();

      const contract = new Contract(
        AARON_CERTIFICATE_ADDRESS,
        AARON_CERTIFICATE_ABI,
        signer,
      );

      const owner: string =
        await contract.owner();

      const signerAddress =
        await signer.getAddress();

      if (
        owner.toLowerCase() !==
        signerAddress.toLowerCase()
      ) {
        setIssueStatus(
          "Only the contract owner can issue certificates.",
        );
        return;
      }

      const nextId: bigint =
        await contract.nextTokenId();

      const certificateId =
        nextId.toString();

      setIssueStatus(
        `Creating metadata for Certificate #${certificateId}...`,
      );

      const metadataResult =
        await createCertificateMetadata(
          certificateId,
        );

      setMetadataURI(
        metadataResult.metadataURI,
      );

      setIssueStatus(
        "Metadata uploaded to IPFS. Preparing blockchain transaction...",
      );

      const transaction =
        await contract.issueCertificate(
          cleanRecipient,
          metadataResult.metadataURI,
        );

      setTransactionHash(
        transaction.hash,
      );

      setIssueStatus(
        "Transaction submitted. Waiting for confirmation...",
      );

      await transaction.wait();

      setIssueStatus(
        `Certificate #${certificateId} issued successfully!`,
      );

      setRecipientName("");
      setCourseName(
        "Blockchain Technology",
      );
      setIssueDate("");
      setRecipient("");
    } catch (error) {
      console.error(
        "Certificate issuance error:",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unknown error";

      setIssueStatus(
        `Certificate issuance failed: ${message}`,
      );
    }
  }

  async function verifyCertificate() {
    try {
      setVerifyStatus("");
      setCertificateOwner("");
      setCertificateURI("");

      if (!window.ethereum) {
        setVerifyStatus(
          "MetaMask is not installed.",
        );
        return;
      }

      if (!/^\d+$/.test(tokenId.trim())) {
        setVerifyStatus(
          "Enter a valid numeric Token ID.",
        );
        return;
      }

      const provider = new BrowserProvider(
        window.ethereum,
      );

      const network =
        await provider.getNetwork();

      if (
        Number(network.chainId) !==
        BSC_TESTNET_CHAIN_ID
      ) {
        setVerifyStatus(
          "Please switch to BNB Smart Chain Testnet.",
        );
        return;
      }

      const contract = new Contract(
        AARON_CERTIFICATE_ADDRESS,
        AARON_CERTIFICATE_ABI,
        provider,
      );

      const id = BigInt(tokenId);

      const owner: string =
        await contract.ownerOf(id);

      const uri: string =
        await contract.tokenURI(id);

      setCertificateOwner(owner);
      setCertificateURI(uri);
      try {
        const cid = uri.replace("ipfs://", "");

        const response = await fetch(
          `/api/ipfs-metadata?cid=${encodeURIComponent(cid)}`,
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load metadata. Status: ${response.status}`,
          );
        }

        const metadata =
          (await response.json()) as CertificateMetadata;

        setCertificateMetadata(metadata);
      } catch (error) {
        console.error(
          "Metadata loading error:",
          error,
        );

        setMetadataError(
          "Certificate exists on-chain, but its metadata could not be loaded.",
        );
      }

      setVerifyStatus(
        `Certificate #${tokenId} is valid.`,
      );
    } catch (error) {
      console.error(error);

      setVerifyStatus(
        "Certificate not found or verification failed.",
      );
    }
  }

  function getIpfsGatewayUrl(uri: string) {

if (!uri.startsWith("ipfs://")) {

return uri;

}

return uri.replace(

"ipfs://",

"[https://ipfs.io/ipfs/]()",

);

}

function getIpfsImageUrl(uri: string) {
  if (!uri.startsWith("ipfs://")) {
    return uri;
  }

  const ipfsPath = uri.replace("ipfs://", "");

  return `https://gateway.pinata.cloud/ipfs/${ipfsPath}`;
}

function getPublicIpfsUrl(uri: string) {
  if (!uri.startsWith("ipfs://")) {
    return uri;
  }

  const ipfsPath = uri.replace("ipfs://", "");

  return `https://inbrowser.link/ipfs/${ipfsPath}`;
}

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">
          Aaron Certificate
        </h1>

        <p className="text-gray-400 mb-8">
          Issue and verify blockchain
          certificates on BNB Smart Chain
          Testnet.
        </p>

        {/* Wallet */}
        <section className="border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Wallet
          </h2>

          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="bg-white text-black px-5 py-2 rounded-lg font-semibold"
            >
              Connect MetaMask
            </button>
          ) : (
            <>
              <p className="mb-2">
                <strong>Account:</strong>{" "}
                {walletAddress}
              </p>

              <p className="mb-2">
                <strong>Network:</strong>{" "}
                {networkName}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {isAdmin
                  ? "Certificate Admin"
                  : "User"}
              </p>
            </>
          )}

          <button
            onClick={switchToBscTestnet}
            className="mt-4 border border-gray-600 px-5 py-2 rounded-lg"
          >
            Switch to BSC Testnet
          </button>
        </section>

        {/* Issue */}
        <section className="border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Issue Certificate
          </h2>

          <input
            type="text"
            placeholder="Recipient full name"
            value={recipientName}
            onChange={(event) =>
              setRecipientName(event.target.value)
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3"
          />

          <input
            type="text"
            placeholder="Course or program"
            value={courseName}
            onChange={(event) =>
              setCourseName(event.target.value)
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3"
          />

          <input
            type="date"
            value={issueDate}
            onChange={(event) =>
              setIssueDate(event.target.value)
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3"
          />

          <input
            type="text"
            placeholder="Recipient wallet address"
            value={recipient}
            onChange={(event) =>
              setRecipient(
                event.target.value,
              )
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 mb-3"
          />

          <button
            onClick={issueCertificate}
            className="bg-white text-black px-5 py-2 rounded-lg font-semibold"
          >
            Issue Certificate
          </button>

          {issueStatus && (
            <p className="mt-4">
              {issueStatus}
            </p>
          )}

          {transactionHash && (
            <a
              href={`https://testnet.bscscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 underline"
            >
              View transaction on BscScan
            </a>
          )}
        </section>

        {/* Verify */}
        <section className="border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Verify Certificate
          </h2>

          <input
            type="text"
            placeholder="Certificate Token ID, e.g. 0"
            value={tokenId}
            onChange={(event) =>
              setTokenId(
                event.target.value,
              )
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 mb-4"
          />

          <button
            onClick={verifyCertificate}
            className="bg-white text-black px-5 py-2 rounded-lg font-semibold"
          >
            Verify Certificate
          </button>

          {verifyStatus && (
            <p className="mt-4 font-semibold">
              {verifyStatus}
            </p>
          )}

          {certificateOwner && (
            <div className="mt-6 space-y-5">
              <div className="rounded-lg border border-green-700 bg-green-950/30 p-4">
                <p className="font-semibold text-green-400">
                  ✓ Verified On-Chain
                </p>

                <p className="mt-2">
                  <strong>Token ID:</strong>{" "}
                  {tokenId}
                </p>

                <p className="mt-2 break-all">
                  <strong>Owner:</strong>{" "}
                  {certificateOwner}
                </p>
              </div>

              {certificateMetadata && (
                <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
                  {certificateMetadata.image && (
                    <a
                      href={getIpfsImageUrl(
                        certificateMetadata.image,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 underline"
                    >
                      Open Certificate Image
                    </a>
                  )}

                  <div className="p-6">
                    <h3 className="text-2xl font-bold">
                      {certificateMetadata.name ??
                        `Certificate #${tokenId}`}
                    </h3>

                    {certificateMetadata.description && (
                      <p className="mt-3 text-gray-300">
                        {
                          certificateMetadata.description
                        }
                      </p>
                    )}

                    {certificateMetadata.attributes &&
                      certificateMetadata.attributes
                        .length > 0 && (
                        <div className="mt-6">
                          <h4 className="mb-3 text-lg font-semibold">
                            Certificate Details
                          </h4>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {certificateMetadata.attributes.map(
                              (attribute, index) => (
                                <div
                                  key={`${attribute.trait_type}-${index}`}
                                  className="rounded-lg border border-gray-700 bg-gray-950 p-3"
                                >
                                  <p className="text-sm text-gray-400">
                                    {attribute.trait_type ??
                                      "Attribute"}
                                  </p>

                                  <p className="font-medium">
                                    {String(
                                      attribute.value ??
                                        "",
                                    )}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    <div className="mt-6 space-y-2">
                      <p className="break-all text-sm text-gray-400">
                        <strong>
                          Metadata URI:
                        </strong>{" "}
                        {certificateURI}
                      </p>

                      <a
                        href={getPublicIpfsUrl(
                          certificateURI,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block underline"
                      >
                        Open IPFS Metadata
                      </a>

                      <br />

                      <a
                        href={`https://testnet.bscscan.com/nft/${AARON_CERTIFICATE_ADDRESS}/${tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block underline"
                      >
                        View NFT on BscScan
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {metadataError && (
                <p className="text-yellow-400">
                  {metadataError}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}