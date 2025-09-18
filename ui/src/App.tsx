import { ConfigProvider, Layout, Tabs } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { AliasToken } from "antd/es/theme/interface";
import backgroundImage from "./assets/images/fondoVP.svg";
// import validProofLogo from "./assets/images/logo-ValidProf.svg";
import { BlockchainProvider } from "./providers/BlockchainProvider";
import WalletConnection from "./components/WalletConnection";
import CertificateUploader from "./components/CertificateUploader";
import CertificateVerifier from "./components/CertificateVerifier";
import PDFSigner from "./components/PDFSigner";

function App() {
  const styleToken: Partial<AliasToken> = {
    colorPrimary: import.meta.env.VITE_PRIMARY_COLOR || "#0084B8",
    fontFamily: import.meta.env.VITE_FONT_FAMILY || "Montserrat, sans-serif",
  };

  const componentToken = {
    Steps: {},
  };

  const tabItems = [
    {
      key: 'wallet',
      label: 'Wallet Connection',
      children: <WalletConnection />,
    },
    {
      key: 'sign',
      label: 'Sign PDF',
      children: <PDFSigner />,
    },
    {
      key: 'upload',
      label: 'Upload Certificate',
      children: <CertificateUploader />,
    },
    {
      key: 'verify',
      label: 'Verify Certificate',
      children: <CertificateVerifier />,
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: styleToken,
        components: componentToken,
      }}
    >
      <Layout
        className="relative flex flex-col bg-cover bg-fixed"
        style={{
          backgroundImage: `url(${
            import.meta.env.VITE_BACKGROUND_IMAGE
              ? import.meta.env.VITE_BACKGROUND_IMAGE
              : backgroundImage
          })`,
          backgroundRepeat: "no-repeat",
        }}
      >
        <Header
          className="absolute w-full bg-transparent"
          style={{ height: 64, paddingInline: 50 }}
        >
          <img
            className="py-8 px-4 z-0"
            src={
              import.meta.env.VITE_LOGO
                // ? import.meta.env.VITE_LOGO
                // : validProofLogo
            }
          />
        </Header>
        <Content className="min-h-screen bg-transparent">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Certificate Registry
              </h1>
              <p className="text-xl text-white/80">
                Blockchain-verified certificates on Polygon Amoy
              </p>
            </div>

            <BlockchainProvider>
              <Tabs
                items={tabItems}
                centered
                size="large"
                className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg"
              />
            </BlockchainProvider>
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
