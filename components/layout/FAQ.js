"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
  {
    question: "Do I need special hardware?",
    answer:
    "No special hardware required. Just print your unique QR code and display it in your store. Customers can scan it with any smartphone camera."
  },
  {
    question: "Does it work on mobile devices?",
    answer:
    "Yes! Our platform is fully responsive and works perfectly on smartphones, tablets, and desktops. Both you and your customers can access everything from mobile."
  },
  {
    question: "Can customers join multiple store programs?",
    answer:
    "Absolutely. Customers create one account and can join loyalty programs for multiple stores. They see all their programs in one dashboard."
  },
  {
    question: "How are rewards calculated?",
    answer:
    "You set the rules! Configure visit-based rewards (e.g., every 10th coffee free) or spending-based rewards. Our system automatically calculates and applies rewards."
  },
  {
    question: "What if the QR code scan fails?",
    answer:
    "You can manually approve visits through your dashboard. Customers can also enter their details directly if scanning isn't working."
  },
  {
    question: "Can I export my customer data?",
    answer:
    "Yes, you own your data. Export customer lists, visit history, and reward reports as CSV or PDF files anytime from your dashboard."
  },
  {
    question: "Is there a setup fee or contract?",
    answer:
    "No setup fees or long-term contracts. Start free with our Silver plan and upgrade only when you need to. Cancel anytime."
  }];


  return (
    <Section
      id="faq"
      className="bg-white dark:bg-gray-800"
      ariaLabel="Frequently asked questions">
      <Container maxWidth="4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to know about getting started.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) =>
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
              <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              aria-expanded={openIndex === index}>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                openIndex === index ? "rotate-180" : ""}`
                } />
              
              </button>
              {openIndex === index &&
            <div className="px-6 py-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
            }
            </div>
          )}
        </div>
      </Container>
    </Section>);

}