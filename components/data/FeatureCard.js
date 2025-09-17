import Card from "@/components/ui/Card";

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card variant="default" hover className="p-6">
      <div className="w-12 h-12 bg-[#D0D8C3] dark:bg-[#014421] rounded-lg flex items-center justify-center mb-4 shadow-md border border-[#014421]/20 dark:border-[#D0D8C3]/30">
        <Icon className="h-6 w-6 text-[#014421] dark:text-[#D0D8C3] drop-shadow-sm" />
      </div>
      <h3 className="text-xl font-semibold text-[#014421] dark:text-[#D0D8C3] mb-2 drop-shadow-sm">
        {title}
      </h3>
      <p className="text-[#2D5A3D] dark:text-[#9CA3AF]">{description}</p>
    </Card>
  );
}
