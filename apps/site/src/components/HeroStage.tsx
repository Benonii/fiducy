import { EnclaveCanvas } from '@/components/EnclaveCanvas';

export function HeroStage() {
  return (
    <div className="hero-stage" aria-hidden="true">
      <div className="enclave-frame">
        <EnclaveCanvas />
      </div>
      <p className="stage-chip">
        <span className="stage-dot" />
        Nitro enclave · attested
      </p>
    </div>
  );
}
