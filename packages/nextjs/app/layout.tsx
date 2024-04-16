import { ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://localhost:${process.env.PORT}`;
const imageUrl = `${baseUrl}/thumbnail.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Scaffold-Nillion App",
    template: "%s | Scaffold-Nillion",
  },
  description: "Built with 🏗 Scaffold-Nillion",
  openGraph: {
    title: {
      default: "Scaffold-Nillion App",
      template: "%s | Scaffold-Nillion",
    },
    description: "Built with 🏗 Scaffold-Nillion",
    images: [
      {
        url: imageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
    title: {
      default: "Scaffold-Nillion",
      template: "%s | Scaffold-Nillion",
    },
    description: "Built with 🏗 Scaffold-Nillion",
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ChakraProvider>
            <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
          </ChakraProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
