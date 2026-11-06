---
'@fiducy/core': minor
'@fiducy/widget': minor
'@fiducy/sdk': minor
'@fiducy/assistant-ui': minor
'fiducy': patch
---

The widget and `importKeys` now check the gateway's Nitro attestation before any key leaves the browser or your server. Set `FIDUCY_ENCLAVE_PCR0` to the PCR0 your deploy printed (comma-separate several during a rollover). Gateways on `localhost` are not checked. A remote gateway with no expected PCR0 is refused unless you set `FIDUCY_SKIP_ATTESTATION=true`, which is for test gateways that are not in an enclave. `mountKeyWidget`, `KeyWidget`, `ConnectKeyWidget`, `<fiducy-key>` (`enclave-pcr0`, `skip-attestation`) and the framework wrappers take the same two options. The gateway now serves `/attestation` with CORS so the browser can read it.
