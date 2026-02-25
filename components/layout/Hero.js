import { QrCode, Shield, Users, ArrowRight, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function Hero() {
  return (
    <Section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden">
      {}
      <div className="absolute inset-0">
        {}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D0D8C3]/20 via-white to-[#D0D8C3]/10 dark:from-gray-900 dark:via-gray-800 dark:to-[#014421]/20"></div>

        {}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#014421] rounded-full opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#014421] rounded-full opacity-40"></div>
        <div className="absolute bottom-1/3 left-1/5 w-4 h-4 bg-[#D0D8C3] rounded-full opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[#014421] rounded-full opacity-30"></div>

        {}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 12 }).map((_, i) =>
            <div key={i} className="border-r border-[#014421]"></div>
            )}
          </div>
        </div>
      </div>

      <Container className="relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {}
          <div className="inline-flex items-center gap-2 bg-[#D0D8C3]/30 dark:bg-[#014421]/20 backdrop-blur-sm border border-[#D0D8C3] dark:border-[#014421]/30 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-[#014421] dark:text-[#D0D8C3] fill-current" />
            <span className="text-sm font-medium text-[#014421] dark:text-[#D0D8C3]">
              Trusted by 500+ UK businesses
            </span>
          </div>

          {}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Digital loyalty that
            <span className="relative inline-block">
              <span className="text-[#D0D8C3] border-b border-[#D0D8C3]">
                actually works
              </span>
            </span>
          </h1>

          {}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Create QR-based loyalty programs in minutes. Customers scan, you
            approve, rewards happen automatically. No apps required.
          </p>

          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button href="/auth/register" variant="secondary" size="lg">
              Start free trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button href="/auth/login" variant="secondary" size="lg">
              Login to dashboard
            </Button>
          </div>

          {}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-[#D0D8C3] dark:border-gray-700 rounded-full px-4 py-2 shadow-sm">
              <QrCode className="h-4 w-4 text-[#014421] dark:text-[#D0D8C3]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                QR Code Scanning
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-[#D0D8C3] dark:border-gray-700 rounded-full px-4 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-[#014421] dark:text-[#D0D8C3]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Instant Approval
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-[#D0D8C3] dark:border-gray-700 rounded-full px-4 py-2 shadow-sm">
              <Users className="h-4 w-4 text-[#014421] dark:text-[#D0D8C3]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Multi-Store Support
              </span>
            </div>
          </div>

          {}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-[#D0D8C3] dark:border-gray-700 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 uppercase tracking-wide">
              Perfect for
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-[#D0D8C3] dark:bg-[#014421] border border-[#D0D8C3] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <div className="w-8 h-8 bg-[#014421] dark:bg-white rounded-lg flex items-center justify-center">
                    <span className="text-white dark:text-[#014421] font-bold text-sm">
                      ☕
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cafes
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Coffee shops & bistros
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-[#D0D8C3] dark:bg-[#014421] border border-[#D0D8C3] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <div className="w-8 h-8 bg-[#014421] dark:bg-white rounded-lg flex items-center justify-center">
                    <span className="text-white dark:text-[#014421] font-bold text-sm">
                      ✂️
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Salons
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Hair & beauty
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-[#D0D8C3] dark:bg-[#014421] border border-[#D0D8C3] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <div className="w-8 h-8 bg-[#014421] dark:bg-white rounded-lg flex items-center justify-center">
                    <span className="text-white dark:text-[#014421] font-bold text-sm">
                      🥖
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Bakeries
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Fresh bread & pastries
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-[#D0D8C3] dark:bg-[#014421] border border-[#D0D8C3] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <div className="w-8 h-8 bg-[#014421] dark:bg-white rounded-lg flex items-center justify-center">
                    <span className="text-white dark:text-[#014421] font-bold text-sm">
                      🏪
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Retail
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Local shops
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
    </Section>);

}