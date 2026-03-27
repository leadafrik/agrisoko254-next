import { ImageResponse } from "next/og";
import { serverFetch } from "@/lib/api-server";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  formatKes,
  formatTrendLabel,
  getFallbackProductSnapshot,
  normalizeIntelligenceProduct,
} from "@/lib/market-intelligence";

export const alt = "Agrisoko live market intelligence snapshot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 120;

type Props = {
  params: {
    productKey: string;
  };
};

export default async function OpenGraphImage({ params }: Props) {
  const payload = await serverFetch<any>(API_ENDPOINTS.marketIntelligence.byProduct(params.productKey), {
    revalidate: 120,
  });
  const product =
    normalizeIntelligenceProduct(payload, params.productKey) ||
    getFallbackProductSnapshot(params.productKey);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgb(25, 15, 6) 0%, rgb(50, 30, 12) 52%, rgb(133, 74, 38) 100%)",
            color: "white",
            fontSize: 54,
            fontWeight: 700,
          }}
        >
          Agrisoko live intelligence
        </div>
      ),
      size
    );
  }

  const bestMarket = product.bestMarket;
  const weakestMarket = product.weakestMarket;
  const updatedLabel = product.lastUpdated
    ? new Date(product.lastUpdated).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Live board";
  const insightCopy =
    product.insight && product.insight.length > 180
      ? `${product.insight.slice(0, 177)}...`
      : product.insight;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at top right, rgba(237, 181, 97, 0.32), transparent 28%), linear-gradient(135deg, rgb(24, 14, 5) 0%, rgb(39, 22, 8) 45%, rgb(115, 54, 30) 100%)",
          color: "white",
          padding: "46px 48px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: "rgb(240, 195, 124)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 11,
                  height: 11,
                  borderRadius: 999,
                  background: "rgb(75, 211, 131)",
                }}
              />
              Agrisoko live intelligence
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.08)",
                fontSize: 18,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              Kenya market snapshot
            </div>
          </div>

          <div style={{ display: "flex", gap: 30, alignItems: "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1.02 }}>
                {product.productName}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 26,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                Board average
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 54,
                  fontWeight: 800,
                  color: "rgb(255, 210, 123)",
                }}
              >
                {formatKes(product.overallAverage)}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 6,
                  fontSize: 24,
                  color: "rgba(255,255,255,0.68)",
                }}
              >
                per {product.unit}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 22,
                  maxWidth: 620,
                  fontSize: 25,
                  lineHeight: 1.4,
                  color: "rgba(255,255,255,0.86)",
                }}
              >
                {insightCopy ||
                  `${product.approvedMarkets} active markets and ${product.submissionsCount} reviewed reports across Kenya.`}
              </div>
            </div>

            <div style={{ display: "flex", width: 340, flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 22,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1.8,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.64)",
                  }}
                >
                  Best sell market
                </div>
                <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 700 }}>
                  {bestMarket?.marketName || "Waiting for data"}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 6,
                    fontSize: 20,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {bestMarket?.county || "Kenya"}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 16,
                    fontSize: 34,
                    fontWeight: 800,
                    color: "rgb(123, 231, 168)",
                  }}
                >
                  {formatKes(bestMarket?.avgPrice || 0)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 22,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1.8,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.64)",
                  }}
                >
                  Lowest market
                </div>
                <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 700 }}>
                  {weakestMarket?.marketName || "Waiting for data"}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 6,
                    fontSize: 20,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {weakestMarket?.county || "Kenya"}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 16,
                    fontSize: 34,
                    fontWeight: 800,
                    color: "rgb(255, 211, 134)",
                  }}
                >
                  {formatKes(weakestMarket?.avgPrice || 0)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: 22,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1.8,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.64)",
                  }}
                >
                  Trend and freshness
                </div>
                <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 700 }}>
                  {formatTrendLabel(product.overallTrendDirection, product.overallTrendPercentage)}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 10,
                    fontSize: 20,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Updated {updatedLabel}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 10,
                    fontSize: 20,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {product.submissionsCount} reviewed field reports
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Open the live board to see the latest market intelligence.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 800,
                color: "white",
              }}
            >
              agrisoko254.com/market-intelligence/{product.productKey}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
