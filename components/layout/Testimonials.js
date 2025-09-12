import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "LoyaltyOS transformed how we connect with customers. The QR system is so simple that even our oldest customers love it.",
      author: "Sarah Chen",
      business: "Bloom Coffee Co.",
    },
    {
      quote:
        "We saw a 40% increase in repeat visits within the first month. The automated rewards keep customers coming back.",
      author: "Marcus Rodriguez",
      business: "The Grooming Lounge",
    },
    {
      quote:
        "Finally, a loyalty program that doesn't require customers to download another app. Our retention has never been better.",
      author: "Emma Thompson",
      business: "Fresh Bakes Bakery",
    },
  ];

  return (
    <Section
      className="bg-[#D0D8C3] dark:bg-gray-900"
      ariaLabel="Customer testimonials">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What store owners say
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Real feedback from businesses using LoyaltyOS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <Avatar name={testimonial.author} className="mr-4" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonial.business}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
