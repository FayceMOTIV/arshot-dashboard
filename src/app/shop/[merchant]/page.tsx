import { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopClient from "./shop-client";

export interface MerchantProduct {
  id: string;
  name: string;
  glbUrl: string;
  category: string;
  scanCount: number;
  qualityScore: number;
}

export interface MerchantData {
  name: string;
  description: string;
  primaryColor: string;
  products: MerchantProduct[];
}

// Mock merchant data — swap this for a real API fetch in production
const MOCK_MERCHANTS: Record<string, MerchantData> = {
  demo: {
    name: "ARShot Demo Store",
    description:
      "Découvrez nos produits en réalité augmentée. Sans application, directement dans votre navigateur.",
    primaryColor: "#0066FF",
    products: [
      {
        id: "p1",
        name: "Astronaute Spatial",
        glbUrl:
          "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        category: "Décoration",
        scanCount: 1234,
        qualityScore: 92,
      },
      {
        id: "p2",
        name: "Robot Expressif",
        glbUrl:
          "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
        category: "Technologie",
        scanCount: 876,
        qualityScore: 88,
      },
      {
        id: "p3",
        name: "Cheval Artisanal",
        glbUrl:
          "https://modelviewer.dev/shared-assets/models/Horse.glb",
        category: "Art",
        scanCount: 543,
        qualityScore: 85,
      },
      {
        id: "p4",
        name: "Neil Armstrong",
        glbUrl:
          "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
        category: "Mobilier",
        scanCount: 321,
        qualityScore: 79,
      },
    ],
  },
};

type Props = { params: Promise<{ merchant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { merchant } = await params;
  const data = MOCK_MERCHANTS[merchant];
  if (!data) return { title: "Boutique introuvable" };
  return {
    title: `${data.name} — Showroom AR`,
    description: data.description,
    openGraph: {
      title: `${data.name} — Showroom 3D AR`,
      description: data.description,
    },
  };
}

export default async function ShopPage({ params }: Props) {
  const { merchant } = await params;
  const data = MOCK_MERCHANTS[merchant];
  if (!data) notFound();
  return <ShopClient data={data} merchantSlug={merchant} />;
}
