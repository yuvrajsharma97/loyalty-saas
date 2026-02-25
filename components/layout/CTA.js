import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function CTA() {
  return (
    <section className="py-16 bg-[#014421] dark:bg-gray-900">
      <Container maxWidth="4xl" className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Launch your loyalty program in minutes
        </h2>
        <p className="text-xl text-gray-200 mb-8">
          Join hundreds of UK businesses building stronger customer
          relationships.
        </p>
        <Button
          href="/auth/register"
          size="lg"
          className="bg-[#014421] text-white hover:bg-[#014421]/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
          Get started free
        </Button>
      </Container>
    </section>);

}