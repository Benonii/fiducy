import { LiquidFormBackground } from '../shaders/liquid-form/LiquidFormBackground';

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="shader-frame">
        <LiquidFormBackground
          speed={1.0}
          morph={1.0}
          noiseScale={1.0}
          mouseAmount={0.5}
          metal={1.0}
          camera={5.5}
          tintHue={220}
          tintAmount={0.0}
        />
      </div>
      <p className="stage-chip">
        <span className="stage-dot" />
        Nitro enclave · attested
      </p>
    </div>
  );
}
