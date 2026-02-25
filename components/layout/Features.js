import {
  QrCode,
  CheckCircle,
  Mail,
  Users,
  FileText,
  Shield } from
"lucide-react";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import FeatureCard from "@/components/data/FeatureCard";

export default function Features() {
  const features = [
  {
    icon: QrCode,
    title: "QR Visit Requests",
    description:
    "Customers scan QR codes to request visit approval. No apps required."
  },
  {
    icon: CheckCircle,
    title: "Smart Approval System",
    description:
    "Store owners approve visits in seconds with automated reward calculations."
  },
  {
    icon: Mail,
    title: "Automated Notifications",
    description:
    "Email customers when rewards are earned or ready to redeem."
  },
  {
    icon: Users,
    title: "Multi-Store Dashboards",
    description:
    "Customers can join multiple loyalty programs from a single account."
  },
  {
    icon: FileText,
    title: "Export Everything",
    description: "Download visit logs and reward data as CSV or PDF reports."
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
    "Multi-tenant architecture with admin, store owner, and customer roles."
  }];


  return (
    <Section
      id="features"
      className="bg-gray-50 dark:bg-gray-900"
      ariaLabel="Features">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to build loyalty
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Simple tools that make customer retention effortless and rewarding
            for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) =>
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description} />

          )}
        </div>
      </Container>
    </Section>);

}