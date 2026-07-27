import QRCode from "qrcode";

type CreateMetadataRequest = {
  recipientName: string;
  courseName: string;
  issueDate: string;
  certificateId: string;
};

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (character) => {
      const replacements: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      };

      return replacements[character];
    },
  );
}

function getNameFontSize(name: string) {
  if (name.length <= 20) return 72;
  if (name.length <= 30) return 60;
  if (name.length <= 40) return 50;

  return 42;
}

function getCourseFontSize(course: string) {
  if (course.length <= 30) return 42;
  if (course.length <= 45) return 34;

  return 28;
}

function createCertificateSvg({
  recipientName,
  courseName,
  issueDate,
  certificateId,
  qrCodeDataUrl,
  verificationUrl,
}: CreateMetadataRequest & {
  qrCodeDataUrl: string;
  verificationUrl: string;
}) {
  const safeName = escapeXml(recipientName);
  const safeCourse = escapeXml(courseName);
  const safeDate = escapeXml(issueDate);

  const formattedId =
    certificateId.padStart(4, "0");

  const nameFontSize =
    getNameFontSize(recipientName);

  const courseFontSize =
    getCourseFontSize(courseName);

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="1400"
  height="1000"
  viewBox="0 0 1400 1000"
>
  <rect
    width="1400"
    height="1000"
    fill="#fffdf7"
  />

  <!-- Outer border -->
  <rect
    x="18"
    y="18"
    width="1364"
    height="964"
    rx="8"
    fill="none"
    stroke="#071a40"
    stroke-width="18"
  />

  <rect
    x="42"
    y="42"
    width="1316"
    height="916"
    fill="none"
    stroke="#c9952e"
    stroke-width="4"
  />

  <rect
    x="58"
    y="58"
    width="1284"
    height="884"
    fill="none"
    stroke="#e3bd63"
    stroke-width="2"
  />

  <!-- Decorative top icon -->
  <polygon
    points="700,78 728,94 728,126 700,142 672,126 672,94"
    fill="none"
    stroke="#c9952e"
    stroke-width="4"
  />

  <text
    x="700"
    y="190"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="28"
    letter-spacing="9"
    fill="#071a40"
  >
    AARON CERTIFICATE
  </text>

  <!-- Main title -->
  <text
    x="700"
    y="290"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="72"
    font-weight="700"
    fill="#071a40"
  >
    CERTIFICATE OF COMPLETION
  </text>

  <line
    x1="470"
    y1="330"
    x2="930"
    y2="330"
    stroke="#c9952e"
    stroke-width="3"
  />

  <!-- Course -->
  <text
    x="700"
    y="395"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="${courseFontSize}"
    fill="#071a40"
  >
    ${safeCourse}
  </text>

  <!-- Recipient -->
  <text
    x="700"
    y="455"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="26"
    fill="#222"
  >
    This certificate is proudly presented to
  </text>

  <text
    x="700"
    y="550"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="${nameFontSize}"
    font-style="italic"
    fill="#071a40"
  >
    ${safeName}
  </text>

  <line
    x1="330"
    y1="575"
    x2="1070"
    y2="575"
    stroke="#c9952e"
    stroke-width="2"
  />

  <!-- Description -->
  <text
    x="700"
    y="635"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="25"
    fill="#222"
  >
    for successfully completing the ${safeCourse} program
  </text>

  <text
    x="700"
    y="675"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="25"
    fill="#222"
  >
    and receiving this blockchain-verifiable certificate of completion.
  </text>

  <!-- On-chain seal -->
  <circle
    cx="700"
    cy="770"
    r="80"
    fill="#d4a63b"
    stroke="#9a6a11"
    stroke-width="8"
  />

  <circle
    cx="700"
    cy="770"
    r="62"
    fill="none"
    stroke="#fff4c5"
    stroke-width="3"
  />

  <text
    x="700"
    y="760"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="22"
    font-weight="700"
    fill="#071a40"
  >
    VERIFIED
  </text>

  <text
    x="700"
    y="790"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="22"
    font-weight="700"
    fill="#071a40"
  >
    ON-CHAIN
  </text>

  <!-- Date -->
  <text
    x="210"
    y="820"
    font-family="Georgia, serif"
    font-size="22"
    fill="#071a40"
  >
    Date Issued:
  </text>

  <text
    x="210"
    y="855"
    font-family="Georgia, serif"
    font-size="24"
    font-weight="700"
    fill="#071a40"
  >
    ${safeDate}
  </text>

  <!-- Issuer -->
  <line
    x1="1000"
    y1="810"
    x2="1230"
    y2="810"
    stroke="#c9952e"
    stroke-width="2"
  />

  <text
    x="1115"
    y="845"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="22"
    fill="#071a40"
  >
    Authorized Issuer
  </text>

  <!-- QR code -->
  <rect
    x="1080"
    y="640"
    width="170"
    height="170"
    rx="8"
    fill="#ffffff"
    stroke="#c9952e"
    stroke-width="3"
  />

  <image
    href="${qrCodeDataUrl}"
    x="1090"
    y="650"
    width="150"
    height="150"
  />

  <text
    x="1165"
    y="835"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="18"
    font-weight="700"
    fill="#071a40"
  >
    Scan to Verify
  </text>

  <!-- Footer -->
  <line
    x1="130"
    y1="895"
    x2="1270"
    y2="895"
    stroke="#d7af58"
    stroke-width="2"
  />

  <text
    x="150"
    y="930"
    font-family="Arial, sans-serif"
    font-size="19"
    fill="#071a40"
  >
    Issued through Aaron Certificate DApp
  </text>

  <text
    x="700"
    y="930"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="23"
    fill="#071a40"
  >
    Certificate ID: ${formattedId}
  </text>

  <text
    x="1250"
    y="930"
    text-anchor="end"
    font-family="Arial, sans-serif"
    font-size="19"
    fill="#071a40"
  >
    BNB Smart Chain Testnet
  </text>
</svg>
  `.trim();
}

export async function POST(request: Request) {
  try {
    const jwt = process.env.PINATA_JWT;

    if (!jwt) {
      return Response.json(
        {
          error:
            "PINATA_JWT is not configured.",
        },
        { status: 500 },
      );
    }

    const body =
      (await request.json()) as CreateMetadataRequest;

    const recipientName =
      body.recipientName?.trim();

    const courseName =
      body.courseName?.trim();

    const issueDate =
      body.issueDate?.trim();

    const certificateId =
      body.certificateId?.trim();

    if (
      !recipientName ||
      !courseName ||
      !issueDate ||
      !certificateId
    ) {
      return Response.json(
        {
          error:
            "Recipient name, course, issue date, and certificate ID are required.",
        },
        { status: 400 },
      );
    }

    if (!/^\d+$/.test(certificateId)) {
      return Response.json(
        {
          error:
            "Certificate ID must be numeric.",
        },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!appUrl) {
      return Response.json(
        {
          error: "NEXT_PUBLIC_APP_URL is not configured.",
        },
        { status: 500 },
      );
    }

    const verificationUrl =
      `${appUrl}/?tokenId=${certificateId}`;

    const qrCodeDataUrl =
      await QRCode.toDataURL(verificationUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: "#071a40",
          light: "#FFFFFF",
        },
      });

    // 1. Generate personalized SVG certificate.
    const svg = createCertificateSvg({
      recipientName,
      courseName,
      issueDate,
      certificateId,
      qrCodeDataUrl,
      verificationUrl,
    });

    // 2. Upload certificate image to Pinata.
    const imageFormData = new FormData();

    const svgBlob = new Blob(
      [svg],
      {
        type: "image/svg+xml",
      },
    );

    imageFormData.append(
      "file",
      svgBlob,
      `certificate-${certificateId}.svg`,
    );

    imageFormData.append(
      "pinataMetadata",
      JSON.stringify({
        name:
          `certificate-${certificateId}.svg`,
      }),
    );

    imageFormData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      }),
    );

    const imageResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${jwt}`,
        },

        body: imageFormData,
      },
    );

    if (!imageResponse.ok) {
      const errorText =
        await imageResponse.text();

      console.error(
        "Pinata image upload error:",
        errorText,
      );

      return Response.json(
        {
          error:
            "Unable to upload personalized certificate image.",
        },
        { status: 502 },
      );
    }

    const imageResult =
      (await imageResponse.json()) as {
        IpfsHash: string;
      };

    const imageURI =
      `ipfs://${imageResult.IpfsHash}`;

    // 3. Build NFT metadata.
    const metadata = {
      name:
        `Aaron Certificate #${certificateId}`,

      description:
        `${courseName} Certificate of Completion issued to ${recipientName} through the Aaron Certificate DApp.`,

      image: imageURI,

      attributes: [
        {
          trait_type: "Recipient",
          value: recipientName,
        },
        {
          trait_type: "Course",
          value: courseName,
        },
        {
          trait_type:
            "Certificate Type",
          value:
            "Completion Certificate",
        },
        {
          trait_type: "Issue Date",
          value: issueDate,
        },
        {
          trait_type:
            "Certificate ID",
          value: certificateId,
        },
        {
          trait_type:
            "Issued Through",
          value:
            "Aaron Certificate DApp",
        },
        {
          trait_type: "Verification",
          value: "On-Chain",
        },
        {
          trait_type: "Network",
          value:
            "BNB Smart Chain Testnet",
        },
      ],
    };

    // 4. Upload metadata JSON.
    const metadataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${jwt}`,
        },

        body: JSON.stringify({
          pinataOptions: {
            cidVersion: 1,
          },

          pinataMetadata: {
            name:
              `certificate-${certificateId}.json`,
          },

          pinataContent: metadata,
        }),
      },
    );

    if (!metadataResponse.ok) {
      const errorText =
        await metadataResponse.text();

      console.error(
        "Pinata metadata upload error:",
        errorText,
      );

      return Response.json(
        {
          error:
            "Unable to upload certificate metadata.",
        },
        { status: 502 },
      );
    }

    const metadataResult =
      (await metadataResponse.json()) as {
        IpfsHash: string;
      };

    // 5. Return everything to dashboard.
    return Response.json({
      success: true,

      imageCID:
        imageResult.IpfsHash,

      imageURI,

      cid:
        metadataResult.IpfsHash,

      metadataURI:
        `ipfs://${metadataResult.IpfsHash}`,

      metadata,
    });
  } catch (error) {
    console.error(
      "Create metadata error:",
      error,
    );

    return Response.json(
      {
        error:
          "Unable to create certificate metadata.",
      },
      { status: 500 },
    );
  }
}