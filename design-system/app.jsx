// Top-level canvas wiring the three direction artboards.

const { useState } = React;

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="intro"
        title="Brand directions — finance ops dashboards"
        subtitle="Three takes for a modern, bold, friendly fintech system. Each artboard previews logo, palette, type, components, and a dashboard fragment. Pick a winner and I'll build it out into a full one-page design system."
      >
        <DCArtboard id="a" label="A · Confident Indigo" width={1280} height={1640}>
          <DirectionA />
        </DCArtboard>
        <DCArtboard id="b" label="B · Voltage on Slate" width={1280} height={1640}>
          <DirectionB />
        </DCArtboard>
        <DCArtboard id="c" label="C · Warm Teal & Cream" width={1280} height={1640}>
          <DirectionC />
        </DCArtboard>
      </DCSection>

      <DCPostIt top={40} left={40} width={280}>
        Audience: internal staff (brokers, underwriters, ops). Tone: modern + bold + friendly. Built for dense numerics. Pick one — I'll build out the full system from there.
      </DCPostIt>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
