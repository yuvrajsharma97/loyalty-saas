export default function DaisyUITest() {
  return (
    <div className="p-8 space-y-8 min-h-screen" style={{backgroundColor: '#D0D8C3'}}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2" style={{color: '#014421'}}>LoyaltyOS - Button Component Color System</h1>
        <p className="text-lg mb-8 text-muted">Exact styling from your Button component: brandPrimary (#014421) & brandSecondary (#D0D8C3)</p>

        {/* Only 2 Brand Colors Showcase */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Only 2 Colors Allowed</h2>
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <div className="w-32 h-32 rounded-lg mx-auto mb-4 border-4" style={{backgroundColor: '#014421', borderColor: '#014421'}}></div>
              <h3 className="text-lg font-semibold">Brand Primary</h3>
              <p className="text-sm">#014421</p>
              <p className="text-xs text-muted">Dark Green - Text, Buttons, Borders</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-lg mx-auto mb-4 border-4" style={{backgroundColor: '#D0D8C3', borderColor: '#014421'}}></div>
              <h3 className="text-lg font-semibold">Brand Secondary</h3>
              <p className="text-sm">#D0D8C3</p>
              <p className="text-xs text-muted">Light Green - Backgrounds, Cards</p>
            </div>
          </div>
        </section>

        {/* Button Component Exact Styling */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Button Component Exact Styling</h2>
          <p className="text-muted mb-6">Perfect match to your provided Button component with all variants</p>

          {/* Primary and Secondary Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Primary & Secondary (Exact Match)</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-brand-primary px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95">Primary Button</button>
              <button className="btn-brand-secondary px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95">Secondary Button</button>
            </div>
          </div>

          {/* Outline and Ghost Variants */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Outline & Ghost (Exact Match)</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn-brand-outline px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-brandPrimary hover:text-white">Outline Button</button>
              <button className="btn-brand-ghost px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-10">Ghost Button</button>
            </div>
          </div>

          {/* Daisy UI Buttons (Overridden) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Daisy UI Buttons (All Overridden)</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-primary">Primary</button>
              <button className="btn btn-secondary">Secondary</button>
              <button className="btn btn-accent">Accent → Primary</button>
              <button className="btn btn-neutral">Neutral → Primary</button>
            </div>
          </div>

          {/* Semantic Buttons (All Overridden) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Semantic Buttons (All Forced to Brand Colors)</h3>
            <div className="flex flex-wrap gap-4">
              <button className="btn btn-success">Success → Primary</button>
              <button className="btn btn-warning">Warning → Primary</button>
              <button className="btn btn-error">Error → Primary</button>
              <button className="btn btn-info">Info → Primary</button>
            </div>
          </div>
        </section>

        {/* 2-Color Only Card System */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Card System (2 Colors Only)</h2>
          <p className="text-muted mb-6">All cards forced to use only 2 brand colors</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-brand p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Brand Card</h3>
              <p className="text-muted mb-4">brandSecondary background, brandPrimary text and border.</p>
              <div className="flex gap-2">
                <button className="btn-brand-primary px-4 py-2 rounded">Primary Action</button>
                <button className="btn-brand-secondary px-4 py-2 rounded">Secondary</button>
              </div>
            </div>
            <div className="card p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Daisy UI Card (Overridden)</h3>
              <p className="text-subtle mb-4">All default Daisy UI colors overridden to use brand colors only.</p>
              <div className="flex gap-2">
                <button className="btn btn-primary px-4 py-2">Primary</button>
                <button className="btn btn-secondary px-4 py-2">Secondary</button>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Color Only Gradients */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Gradients (2 Colors Only)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="brand-gradient p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Standard Gradient</h3>
              <p className="text-muted">brandSecondary to brandPrimary</p>
            </div>
            <div className="brand-gradient-reverse p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2" style={{color: '#D0D8C3'}}>Reverse Gradient</h3>
              <p style={{color: '#D0D8C3', opacity: 0.8}}>brandPrimary to brandSecondary</p>
            </div>
          </div>
        </section>

        {/* Alert System - All Overridden to 2 Colors */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alert System (Overridden to 2 Colors)</h2>
          <p className="text-muted mb-6">All alerts forced to use only brandPrimary and brandSecondary</p>
          <div className="space-y-4">
            <div className="alert alert-info p-4 rounded">
              <span>Info alert - Overridden to brandSecondary bg, brandPrimary text</span>
            </div>
            <div className="alert alert-success p-4 rounded">
              <span>Success alert - No longer green, uses brand colors only</span>
            </div>
            <div className="alert alert-warning p-4 rounded">
              <span>Warning alert - No orange, brandPrimary text on brandSecondary bg</span>
            </div>
            <div className="alert alert-error p-4 rounded">
              <span>Error alert - No red, strictly brand colors only</span>
            </div>
          </div>
        </section>

        {/* Form Elements - 2 Colors Only */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Form Elements (2 Colors Only)</h2>
          <p className="text-muted mb-6">All form elements restricted to brandPrimary and brandSecondary</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input type="text" placeholder="Standard input (overridden)" className="input input-bordered w-full p-3" />
              <input type="text" placeholder="Brand input" className="input-brand w-full p-3" />
              <select className="select select-bordered w-full p-3">
                <option>Standard select (overridden)</option>
              </select>
            </div>
            <div className="space-y-4">
              <textarea className="textarea textarea-bordered w-full p-3" placeholder="Standard textarea (overridden)"></textarea>
              <textarea className="input-brand w-full p-3 rounded" placeholder="Brand textarea"></textarea>
            </div>
          </div>
        </section>

        {/* Button Component Integration Summary */}
        <section className="mb-8 p-6 rounded-lg" style={{backgroundColor: '#014421', color: '#D0D8C3'}}>
          <h2 className="text-2xl font-semibold mb-4">Button Component Integration Complete</h2>
          <div className="text-sm space-y-2">
            <p>✅ <strong>Exact Button Component Match:</strong> All styling matches your provided component</p>
            <p>✅ <strong>2 Colors Only:</strong> brandPrimary (#014421) & brandSecondary (#D0D8C3)</p>
            <p>✅ <strong>All Daisy UI Overridden:</strong> Every component uses button color scheme</p>
            <p>✅ <strong>Hover/Active States:</strong> Shadow, transform, and transition effects included</p>
            <p>✅ <strong>Perfect Consistency:</strong> Entire app matches button component styling</p>
          </div>
        </section>
      </div>
    </div>
  );
}