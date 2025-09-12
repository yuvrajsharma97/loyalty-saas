import { Settings, QrCode, CheckCircle } from "lucide-react";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function ProcessSteps() {
  const steps = [
    {
      icon: Settings,
      title: "Set Up Rewards",
      description:
        "Configure your loyalty program with visit-based or spending-based rewards.",
    },
    {
      icon: QrCode,
      title: "Customer Scans QR",
      description:
        "Customers scan your unique QR code to request visit confirmation.",
    },
    {
      icon: CheckCircle,
      title: "Approve & Reward",
      description:
        "You approve the visit and points are automatically earned and redeemed.",
    },
  ];

  return (
    <Section
      id="how-it-works"
      className="bg-white dark:bg-gray-800"
      ariaLabel="How it works">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Three simple steps to launch your digital loyalty program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-[#014421] rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="h-10 w-10 text-white" />
              </div>
              <div className="bg-[#014421] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
