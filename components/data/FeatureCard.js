import Card from "@/components/ui/Card";

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card variant="default" hover className="p-6">
      <div className="w-12 h-12 bg-[#D0D8C3] dark:bg-[#014421] rounded-lg flex items-center justify-center mb-4 shadow-md border border-[#014421]/20 dark:border-[#D0D8C3]/50">
        <Icon className="h-6 w-6 text-[#014421] dark:text-white drop-shadow-sm" />
      </div>
      <h3 className="text-xl font-semibold text-primary dark:text-white mb-2 drop-shadow-sm">
        {title}
      </h3>
      <p className="text-primary/80 dark:text-gray-300">{description}</p>
    </Card>
  );
}
