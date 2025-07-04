import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/app/_components/Header";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import AuthProvider from "@/app/_contexts/AuthContext";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "WebSecPlayground",
  description: "A playground for web security learning.",
};

type Props = {
  children: React.ReactNode;
};

/**
 * すべてのページに適用されるルートレイアウト
 */
const RootLayout: React.FC<Props> = (props) => {
  return (
    <html lang="ja">
      <body>
        {/* AuthProviderでアプリケーション全体をラップし、認証情報を共有する */}
        <AuthProvider>
          <Header />
          <main className="mx-4 mt-2 max-w-3xl md:mx-auto">
            {props.children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
