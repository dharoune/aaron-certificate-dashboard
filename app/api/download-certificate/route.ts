import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const cid = searchParams.get("cid");

    const certificateId =
      searchParams.get("certificateId") ??
      "certificate";

    if (!cid) {
      return new Response(
        "CID is required.",
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(cid)) {
      return new Response(
        "Invalid CID.",
        { status: 400 },
      );
    }

    const imageUrl =
      `https://gateway.pinata.cloud/ipfs/${cid}`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new Response(
        "Unable to retrieve certificate.",
        { status: response.status },
      );
    }

    const svgBuffer = Buffer.from(
      await response.arrayBuffer(),
    );

    // Convert SVG to high-quality PNG.
    const pngBuffer = await sharp(svgBuffer)
      .png()
      .toBuffer();

    // Create PDF.
    const pdfDoc =
      await PDFDocument.create();

    const pngImage =
      await pdfDoc.embedPng(pngBuffer);

    // A4 landscape size in PDF points.
    const pageWidth = 841.89;
    const pageHeight = 595.28;

    const page = pdfDoc.addPage([
      pageWidth,
      pageHeight,
    ]);

    const scaled =
      pngImage.scaleToFit(
        pageWidth - 40,
        pageHeight - 40,
      );

    page.drawImage(pngImage, {
      x: (pageWidth - scaled.width) / 2,
      y: (pageHeight - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });

    const pdfBytes =
      await pdfDoc.save();

    return new Response(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="aaron-certificate-${certificateId}.pdf"`,

          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Certificate PDF error:",
      error,
    );

    return new Response(
      "Unable to generate certificate PDF.",
      { status: 500 },
    );
  }
}