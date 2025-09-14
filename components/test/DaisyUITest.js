export default function DaisyUITest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Daisy UI Test Components</h1>

      {/* Button Test */}
      <div className="space-x-2">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-accent">Accent Button</button>
        <button className="btn btn-ghost">Ghost Button</button>
      </div>

      {/* Card Test */}
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Test Card</h2>
          <p>If you're seeing styled buttons above and this card with proper styling, Daisy UI is working!</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Action</button>
          </div>
        </div>
      </div>

      {/* Glass Effect Test */}
      <div className="glass p-4 rounded-lg">
        <p>This should have a glass/blur effect if Daisy UI is working properly.</p>
      </div>

      {/* Alert Test */}
      <div className="alert alert-success">
        <span>Success alert - Daisy UI is working if this is styled!</span>
      </div>
    </div>
  );
}