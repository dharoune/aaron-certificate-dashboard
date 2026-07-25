export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cid = searchParams.get("cid");

    if (!cid) {
      return Response.json(
        { error: "CID is required." },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(cid)) {
      return Response.json(
        { error: "Invalid CID." },
        { status: 400 },
      );
    }

    const metadataUrl =
      `https://gateway.pinata.cloud/ipfs/${cid}`;

    const response = await fetch(metadataUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          error: `Unable to retrieve metadata. Status: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const metadata = await response.json();

    return Response.json(metadata);
  } catch (error) {
    console.error(
      "IPFS metadata route error:",
      error,
    );

    return Response.json(
      {
        error: "Unable to retrieve IPFS metadata.",
      },
      { status: 500 },
    );
  }
}