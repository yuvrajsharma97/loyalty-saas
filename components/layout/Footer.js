import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import Container from "@/components/layout/Container";

const Logo = () =>
<Link href="/" className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-[#014421] rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">L</span>
    </div>
    <span className="font-bold text-xl text-white">LoyaltyOS</span>
  </Link>;


export default function Footer() {
  const productLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "How it works", href: "#how-it-works" }];


  const companyLinks = [
  { name: "About", href: "#" },
  { name: "Contact", href: "#" }];


  const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" }];


  return (
    <footer className="bg-gray-900 text-white">
      <div className="border-t border-gray-800 pt-8 w-11/12 justify-center mx-auto"></div>
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Digital loyalty programs that work. Help your customers return,
              and reward them for their loyalty.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) =>
              <li key={link.name}>
                  <a
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 mb-6">
              {companyLinks.map((link) =>
              <li key={link.name}>
                  <a
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              )}
            </ul>

            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) =>
              <li key={link.name}>
                  <a
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-center">
            <span className="font-bold text-[#D0D8C3]">
              © {new Date().getFullYear()}{" "}
              <span className="border-b border-[#D0D8C3]">LoyaltyOS</span>
            </span>
            . All rights reserved.
          </p>
        </div>
      </Container>
    </footer>);

}