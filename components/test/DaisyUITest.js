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

        {/* Button Variations */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Button System</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn-brand">Brand Button</button>
              <button className="btn-brand-outline">Brand Outline</button>
              <button className="btn-brand-ghost">Brand Ghost</button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-success">Success</button>
              <button className="btn btn-warning">Warning</button>
              <button className="btn btn-error">Error</button>
            </div>
          </div>
        </section>

        {/* Card System */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Card System</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-brand card-body">
              <h3 className="card-title text-primary-800">Brand Card</h3>
              <p className="text-neutral-600">This card uses the custom brand styling with consistent colors and shadows.</p>
              <div className="card-actions justify-end">
                <button className="btn-brand">Action</button>
              </div>
            </div>
            <div className="card bg-white shadow-brand-lg rounded-lg">
              <div className="card-body">
                <h3 className="card-title text-primary-800">Daisy UI Card</h3>
                <p className="text-neutral-600">Standard Daisy UI card with brand color overrides applied.</p>
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

        {/* Alert System */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Alert System</h2>
          <div className="space-y-3">
            <div className="alert-brand alert">
              <span>Brand alert with consistent styling</span>
            </div>
            <div className="alert-brand-success alert">
              <span>Success alert - Action completed successfully</span>
            </div>
            <div className="alert-brand-warning alert">
              <span>Warning alert - Please check your input</span>
            </div>
            <div className="alert-brand-error alert">
              <span>Error alert - Something went wrong</span>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary-800 mb-4">Form Elements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input type="text" placeholder="Standard input" className="input input-bordered w-full" />
              <input type="text" placeholder="Brand input" className="input input-brand w-full" />
              <select className="select select-bordered w-full">
                <option>Standard select</option>
              </select>
              <select className="select select-brand w-full">
                <option>Brand select</option>
              </select>
            </div>
            <div className="space-y-4">
              <textarea className="textarea textarea-bordered w-full" placeholder="Standard textarea"></textarea>
              <textarea className="textarea input-brand w-full" placeholder="Brand textarea"></textarea>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}