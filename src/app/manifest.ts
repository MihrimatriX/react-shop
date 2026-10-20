import type { MetadataRoute } from "next";
import { BASE_PATH, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#f27a1a",
    lang: "tr",
    icons: [
      {
        src: `${BASE_PATH}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
