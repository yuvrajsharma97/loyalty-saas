import { Check } from "lucide-react";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function Pricing() {
  const plans = [
    {
      name: "Silver",
      users: "1-100 users",
      price: "Free",
      features: [
        "Basic QR loyalty program",
        "Visit tracking & approval",
        "Email notifications",
        "Basic reporting",
      ],
    },
    {
      name: "Gold",
      users: "101-500 users",
      price: "TBD",
      features: [
        "Everything in Silver",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
        "CSV/PDF exports",
      ],
      popular: true,
    },
    {
      name: "Platinum",
      users: "501-1000 users",
      price: "£1/user/month",
      features: [
        "Everything in Gold",
        "Multi-location support",
        "API access",
        "White-label options",
        "Dedicated support",
      ],
    },
  ];

  return (
    <Section
      id="pricing"
      className="bg-gray-50 dark:bg-gray-900"
      ariaLabel="Pricing">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free and scale as your business grows. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-center">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative ${
                plan.popular ? "md:scale-110 md:z-10" : "md:scale-95"
              } transition-transform duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant="primary">Most Popular</Badge>
                </div>
              )}

              <Card
                hover={false}
                className={`p-8 h-full ${
                  plan.popular ? "ring-2 ring-primary shadow-xl" : "shadow-md"
                }`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.users}
                  </p>
                  <div className="text-4xl font-bold text-[#014421] dark:text-[#D0D8C3] mb-2">
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/auth/register"
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full">
                  Start free
                </Button>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Billing simulated for now; upgrade flows
            coming soon.
          </p>
        </div>
      </Container>
    </Section>
  );
}
