export default function DaisyUITest() {
  return (
    <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-800 mb-2">LoyaltyOS Design System</h1>
        <p className="text-neutral-600 text-lg mb-8">Unified brand color system with Daisy UI components</p>

        {/* Brand Colors Showcase */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-800 rounded-lg shadow-brand mx-auto mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-neutral-500">#014421</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-300 rounded-lg shadow-secondary mx-auto mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-neutral-500">#D0D8C3</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-success-500 rounded-lg shadow-brand mx-auto mb-2"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-neutral-500">#22c55e</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-neutral-800 rounded-lg shadow-brand mx-auto mb-2"></div>
              <p className="text-sm font-medium">Neutral</p>
              <p className="text-xs text-neutral-500">#3c4043</p>
            </div>
          </div>
        </section>

        {/* Brand-Only Button System */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Brand Button System</h2>
          <p className="text-muted mb-6">All buttons use only brand colors (primary and secondary)</p>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">Daisy Primary</button>
              <button className="btn-brand">Brand Button</button>
              <button className="btn-brand-outline">Brand Outline</button>
              <button className="btn-brand-ghost">Brand Ghost</button>
              <button className="btn-brand-secondary">Brand Secondary</button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-secondary">Daisy Secondary</button>
              <button className="btn btn-sm btn-primary">Small Primary</button>
              <button className="btn btn-lg btn-primary">Large Primary</button>
            </div>
          </div>
        </section>

        {/* Brand Card System */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Brand Card System</h2>
          <p className="text-muted mb-6">Cards with brand shadows and text colors</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-brand p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Brand Card</h3>
              <p className="text-muted mb-4">This card uses brand shadows and text colors only.</p>
              <div className="flex gap-2">
                <button className="btn-brand">Primary Action</button>
                <button className="btn-brand-outline">Secondary</button>
              </div>
            </div>
            <div className="card bg-white shadow-brand-lg rounded-lg">
              <div className="card-body">
                <h3 className="card-title">Daisy UI Card</h3>
                <p className="text-subtle">Standard Daisy UI card with brand shadows.</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Action</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradients & Effects */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Brand Gradients</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="brand-gradient p-6 rounded-lg">
              <h3 className="font-semibold text-primary-800">Brand Gradient</h3>
              <p className="text-primary-700">Light gradient background</p>
            </div>
            <div className="brand-gradient-dark p-6 rounded-lg text-white">
              <h3 className="font-semibold">Dark Gradient</h3>
              <p className="text-secondary-100">Dark themed gradient</p>
            </div>
            <div className="brand-gradient-radial p-6 rounded-lg">
              <h3 className="font-semibold text-white">Radial Gradient</h3>
              <p className="text-secondary-100">Radial brand effect</p>
            </div>
          </div>
        </section>

        {/* Alert System - Semantic Colors Preserved */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alert System</h2>
          <p className="text-muted mb-6">Alerts use semantic colors (not restricted to brand colors for clarity)</p>
          <div className="space-y-3">
            <div className="alert alert-info">
              <span>Info alert - Standard semantic blue color for information</span>
            </div>
            <div className="alert alert-success">
              <span>Success alert - Green for positive actions</span>
            </div>
            <div className="alert alert-warning">
              <span>Warning alert - Orange for caution</span>
            </div>
            <div className="alert alert-error">
              <span>Error alert - Red for errors and critical issues</span>
            </div>
          </div>
        </section>

        {/* Brand Form Elements */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Brand Form Elements</h2>
          <p className="text-muted mb-6">Forms with brand color focus states and text</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input type="text" placeholder="Standard input" className="input input-bordered w-full" />
              <input type="text" placeholder="Brand input with focus colors" className="input input-brand w-full" />
              <select className="select select-bordered w-full">
                <option>Standard select</option>
              </select>
              <select className="select select-brand w-full">
                <option>Brand select with focus</option>
              </select>
            </div>
            <div className="space-y-4">
              <textarea className="textarea textarea-bordered w-full" placeholder="Standard textarea"></textarea>
              <textarea className="textarea input-brand w-full" placeholder="Brand textarea with focus"></textarea>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}