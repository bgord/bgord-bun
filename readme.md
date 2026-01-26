# bgord-bun

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/bgord-bun.git --recurse-submodules
```

Install packages

```
bun i
```

Run the tests

```
./bgord-scripts/test-run.sh
```

## Files:

```
src/
├── antivirus-clamav.adapter.ts
├── antivirus-noop.adapter.ts
├── antivirus.port.ts
├── api-version.middleware.ts
├── auth-session-reader-better-auth.adapter.ts
├── auth-session-reader-noop.adapter.ts
├── auth-session-reader.port.ts
├── basic-auth-password.vo.ts
├── basic-auth-username.vo.ts
├── basic-auth.service.ts
├── better-auth-logger.service.ts
├── binary.vo.ts
├── bots.vo.ts
├── build-info-repository-file.strategy.ts
├── build-info-repository-noop.strategy.ts
├── build-info-repository-package-json.strategy.ts
├── build-info-repository.strategy.ts
├── cache-file.service.ts
├── cache-repository-node-cache.adapter.ts
├── cache-repository-noop.adapter.ts
├── cache-repository.port.ts
├── cache-resolver-simple.strategy.ts
├── cache-resolver.strategy.ts
├── cache-response.middleware.ts
├── cache-subject-application-resolver.vo.ts
├── cache-subject-request-resolver.vo.ts
├── cache-subject-segment-application.strategy.ts
├── cache-subject-segment-build.strategy.ts
├── cache-subject-segment-cookie.strategy.ts
├── cache-subject-segment-env.strategy.ts
├── cache-subject-segment-fixed.strategy.ts
├── cache-subject-segment-header.strategy.ts
├── cache-subject-segment-ip.strategy.ts
├── cache-subject-segment-path.strategy.ts
├── cache-subject-segment-query.strategy.ts
├── cache-subject-segment-request.strategy.ts
├── cache-subject-segment-user.strategy.ts
├── certificate-inspector-noop.adapter.ts
├── certificate-inspector-tls.adapter.ts
├── certificate-inspector.port.ts
├── checksum.service.ts
├── client-ip.vo.ts
├── client-user-agent.vo.ts
├── client.vo.ts
├── clock-fixed.adapter.ts
├── clock-offset.adapter.ts
├── clock-system.adapter.ts
├── clock.port.ts
├── command-envelope.ts
├── command-logger.service.ts
├── command.types.ts
├── commit-sha-value.vo.ts
├── commit-sha.vo.ts
├── context.middleware.ts
├── correlation-id.vo.ts
├── correlation-storage.service.ts
├── crypto-aes-gcm.service.ts
├── crypto-key-provider-file.adapter.ts
├── crypto-key-provider-memory.adapter.ts
├── crypto-key-provider-noop.adapter.ts
├── crypto-key-provider-with-cache.adapter.ts
├── crypto-key-provider.port.ts
├── csv-stringifier.adapter.ts
├── csv-stringifier.port.ts
├── deep-clone-with.ts
├── directory-ensurer-noop.adapter.ts
├── directory-ensurer.adapter.ts
├── directory-ensurer.port.ts
├── disk-space-checker-noop.adapter.ts
├── disk-space-checker-shell.adapter.ts
├── disk-space-checker.port.ts
├── dispatching-event-store.ts
├── encryption-aes-gcm.adapter.ts
├── encryption-iv.vo.ts
├── encryption-key-value.vo.ts
├── encryption-key.vo.ts
├── encryption-noop.adapter.ts
├── encryption.port.ts
├── environment-file-parser.service.ts
├── environment-loader-encrypted.adapter.ts
├── environment-loader-noop.adapter.ts
├── environment-loader-process-safe.adapter.ts
├── environment-loader-process.adapter.ts
├── environment-loader.port.ts
├── error-normalizer.service.ts
├── etag-extractor.middleware.ts
├── event-bus-like.types.ts
├── event-envelope.ts
├── event-handler-bare.strategy.ts
├── event-handler-noop.strategy.ts
├── event-handler-with-logger.strategy.ts
├── event-handler.strategy.ts
├── event-logger.service.ts
├── event-loop-lag.service.ts
├── event-loop-utilization.service.ts
├── event-publisher.types.ts
├── event-store-like.types.ts
├── event-store.ts
├── event-stream.vo.ts
├── event.types.ts
├── file-cleaner-forgiving.adapter.ts
├── file-cleaner-noop.adapter.ts
├── file-cleaner.adapter.ts
├── file-cleaner.port.ts
├── file-copier-noop.adapter.ts
├── file-copier.adapter.ts
├── file-copier.port.ts
├── file-draft-zip.service.ts
├── file-draft.service.ts
├── file-inspection-noop.adapter.ts
├── file-inspection.adapter.ts
├── file-inspection.port.ts
├── file-reader-json-forgiving.adapter.ts
├── file-reader-json-noop.adapter.ts
├── file-reader-json-with-cache.adapter.ts
├── file-reader-json.adapter.ts
├── file-reader-json.port.ts
├── file-reader-raw-forgiving.adapter.ts
├── file-reader-raw-noop.adapter.ts
├── file-reader-raw-with-cache.adapter.ts
├── file-reader-raw.adapter.ts
├── file-reader-raw.port.ts
├── file-reader-text-forgiving.adapter.ts
├── file-reader-text-noop.adapter.ts
├── file-reader-text-with-cache.adapter.ts
├── file-reader-text.adapter.ts
├── file-reader-text.port.ts
├── file-renamer-node-forgiving.adapter.ts
├── file-renamer-node.adapter.ts
├── file-renamer-noop.adapter.ts
├── file-renamer.port.ts
├── file-uploader.middleware.ts
├── file-writer-noop.adapter.ts
├── file-writer.adapter.ts
├── file-writer.port.ts
├── graceful-shutdown.service.ts
├── gzip-noop.adapter.ts
├── gzip.adapter.ts
├── gzip.port.ts
├── hash-content-noop.strategy.ts
├── hash-content-sha256.strategy.ts
├── hash-content.strategy.ts
├── hash-file-noop.adapter.ts
├── hash-file-sha256.adapter.ts
├── hash-file.port.ts
├── hash-value.vo.ts
├── hash.vo.ts
├── hcaptcha-secret-key.vo.ts
├── hcaptcha-site-key.vo.ts
├── hcaptcha.service.ts
├── healthcheck.service.ts
├── http-logger.middleware.ts
├── i18n.service.ts
├── id-provider-crypto.adapter.ts
├── id-provider-deterministic.adapter.ts
├── id-provider.port.ts
├── image-alpha-noop.adapter.ts
├── image-alpha-sharp.adapter.ts
├── image-alpha.port.ts
├── image-blur-noop.adapter.ts
├── image-blur-sharp.adapter.ts
├── image-blur.port.ts
├── image-compressor-noop.adapter.ts
├── image-compressor-sharp.adapter.ts
├── image-compressor.port.ts
├── image-exif-clear-noop.adapter.ts
├── image-exif-clear-sharp.adapter.ts
├── image-exif-clear.port.ts
├── image-formatter-noop.adapter.ts
├── image-formatter-sharp.adapter.ts
├── image-formatter.port.ts
├── image-info-noop.adapter.ts
├── image-info-sharp.adapter.ts
├── image-info.port.ts
├── image-processor-noop.adapter.ts
├── image-processor-sharp.adapter.ts
├── image-processor.port.ts
├── image-resizer-noop.adapter.ts
├── image-resizer-sharp.adapter.ts
├── image-resizer.port.ts
├── in-flight-requests-tracker.service.ts
├── in-flight-requests.middleware.ts
├── instrumentation.service.ts
├── invariant-error-handler.service.ts
├── invariant.service.ts
├── is-plain-object.ts
├── job-handler-bare.strategy.ts
├── job-handler-noop.strategy.ts
├── job-handler-with-logger.strategy.ts
├── job-handler.strategy.ts
├── jobs.service.ts
├── logger-collecting.adapter.ts
├── logger-noop.adapter.ts
├── logger-stats-provider-noop.adapter.ts
├── logger-stats-provider.port.ts
├── logger.port.ts
├── mailer-content-html.vo.ts
├── mailer-noop.adapter.ts
├── mailer-resend.adapter.ts
├── mailer-smtp.adapter.ts
├── mailer-subject.vo.ts
├── mailer-template.vo.ts
├── mailer-with-logger.adapter.ts
├── mailer.port.ts
├── maintenance-mode.middleware.ts
├── memory-consumption.service.ts
├── modules
│   ├── history
│   │   ├── event-handlers
│   │   │   ├── onHistoryClearedEvent.ts
│   │   │   └── onHistoryPopulatedEvent.ts
│   │   ├── events
│   │   │   ├── HISTORY_CLEARED_EVENT.ts
│   │   │   ├── HISTORY_POPULATED_EVENT.ts
│   │   ├── ports
│   │   │   ├── history-projection.ts
│   │   │   ├── history-reader.ts
│   │   │   ├── history-writer.ts
│   │   └── value-objects
│   │       ├── history-created-at.ts
│   │       ├── history-id.ts
│   │       ├── history-operation.ts
│   │       ├── history-payload.ts
│   │       ├── history-subject.ts
│   │       ├── history.ts
│   ├── preferences
│   │   ├── command-handlers
│   │   │   ├── handleSetUserLanguageCommand.ts
│   │   ├── commands
│   │   │   ├── SET_USER_LANGUAGE_COMMAND.ts
│   │   ├── events
│   │   │   ├── USER_LANGUAGE_SET_EVENT.ts
│   │   ├── invariants
│   │   │   └── user-language-has-changed.ts
│   │   ├── open-host-queries
│   │   │   └── user-language.ts
│   │   ├── ports
│   │   │   ├── user-language-query.ts
│   │   │   └── user-language-resolver.ts
│   │   └── value-objects
│   │       └── supported-languages-set.ts
│   └── system
│       ├── events
│       │   ├── HOUR_HAS_PASSED_EVENT.ts
│       │   ├── MINUTE_HAS_PASSED_EVENT.ts
│       │   ├── SECURITY_VIOLATION_DETECTED_EVENT.ts
│       └── services
│           ├── passage-of-time-hourly.service.ts
│           └── passage-of-time-minute.service.ts
├── node-env.vo.ts
├── nonce-provider-crypto.adapter.ts
├── nonce-provider-deterministic.adapter.ts
├── nonce-provider-noop.adapter.ts
├── nonce-provider.port.ts
├── nonce-value.vo.ts
├── pdf-generator-noop.adapter.ts
├── pdf-generator-with-logger.adapter.ts
├── pdf-generator.port.ts
├── ping.service.ts
├── port.vo.ts
├── prerequisite-runner-startup.service.ts
├── prerequisite-verifier-binary.adapter.ts
├── prerequisite-verifier-bun.adapter.ts
├── prerequisite-verifier-clock-drift.adapter.ts
├── prerequisite-verifier-directory.adapter.ts
├── prerequisite-verifier-dns.adapter.ts
├── prerequisite-verifier-external-api.adapter.ts
├── prerequisite-verifier-file.adapter.ts
├── prerequisite-verifier-jobs.adapter.ts
├── prerequisite-verifier-mailer.adapter.ts
├── prerequisite-verifier-memory.adapter.ts
├── prerequisite-verifier-node.adapter.ts
├── prerequisite-verifier-os.adapter.ts
├── prerequisite-verifier-outside-connectivity.adapter.ts
├── prerequisite-verifier-port.adapter.ts
├── prerequisite-verifier-ram.adapter.ts
├── prerequisite-verifier-running-user.adapter.ts
├── prerequisite-verifier-self.adapter.ts
├── prerequisite-verifier-space.adapter.ts
├── prerequisite-verifier-sqlite.adapter.ts
├── prerequisite-verifier-ssl-certificate-expiry.adapter.ts
├── prerequisite-verifier-timezone-utc.adapter.ts
├── prerequisite-verifier-translations.adapter.ts
├── prerequisite-verifier-with-cache.adapter.ts
├── prerequisite-verifier-with-fail-safe.adapter.ts
├── prerequisite-verifier-with-logger.adapter.ts
├── prerequisite-verifier-with-retry.adapter.ts
├── prerequisite-verifier-with-timeout.adapter.ts
├── prerequisite-verifier.decorator.ts
├── prerequisite-verifier.port.ts
├── prerequisite.vo.ts
├── recaptcha-secret-key.vo.ts
├── recaptcha-site-key.vo.ts
├── redactor-composite.strategy.ts
├── redactor-error-cause-depth-limit.strategy.ts
├── redactor-error-stack-hide.strategy.ts
├── redactor-mask.strategy.ts
├── redactor-metadata-compact-array.strategy.ts
├── redactor-metadata-compact-object.strategy.ts
├── redactor-noop.strategy.ts
├── redactor.strategy.ts
├── remote-file-storage-disk.adapter.ts
├── remote-file-storage-noop.adapter.ts
├── remote-file-storage.port.ts
├── request-context-hono.adapter.ts
├── request-context.port.ts
├── retry-backoff-exponential.strategy.ts
├── retry-backoff-fibonacci.strategy.ts
├── retry-backoff-linear.strategy.ts
├── retry-backoff-noop.strategy.ts
├── retry-backoff.strategy.ts
├── retry.service.ts
├── safe-parse-body.service.ts
├── sealer-aes-gcm.adapter.ts
├── sealer-noop.adapter.ts
├── sealer.port.ts
├── security-context.vo.ts
├── security-countermeasure-ban.strategy.ts
├── security-countermeasure-mirage.strategy.ts
├── security-countermeasure-name.vo.ts
├── security-countermeasure-noop.strategy.ts
├── security-countermeasure-report.strategy.ts
├── security-countermeasure-tarpit.strategy.ts
├── security-countermeasure.strategy.ts
├── security-policy.vo.ts
├── security-rule-and.strategy.ts
├── security-rule-bait-routes.strategy.ts
├── security-rule-fail.strategy.ts
├── security-rule-honey-pot-field.strategy.ts
├── security-rule-name.vo.ts
├── security-rule-or.strategy.ts
├── security-rule-pass.strategy.ts
├── security-rule-user-agent.strategy.ts
├── security-rule-violation-threshold.strategy.ts
├── security-rule.strategy.ts
├── setup.service.ts
├── shield-api-key.strategy.ts
├── shield-auth.strategy.ts
├── shield-basic-auth.strategy.ts
├── shield-csrf.strategy.ts
├── shield-hcaptcha-local.strategy.ts
├── shield-hcaptcha.strategy.ts
├── shield-noop.strategy.ts
├── shield-rate-limit.strategy.ts
├── shield-recaptcha.strategy.ts
├── shield-security.strategy.ts
├── shield-timeout.strategy.ts
├── shield.strategy.ts
├── simulated-error.middleware.ts
├── sleeper-noop.adapter.ts
├── sleeper-system.adapter.ts
├── sleeper.port.ts
├── slower.middleware.ts
├── smtp-host.vo.ts
├── smtp-pass.vo.ts
├── smtp-port.vo.ts
├── smtp-user.vo.ts
├── ssr.ts
├── static-files.service.ts
├── stopwatch.service.ts
├── temporary-file-absolute.adapter.ts
├── temporary-file-noop.adapter.ts
├── temporary-file.port.ts
├── time-zone-offset.middleware.ts
├── timekeeper-google.adapter.ts
├── timekeeper-noop.adapter.ts
├── timekeeper.port.ts
├── timeout-cancellable-runner-bare.adapter.ts
├── timeout-cancellable-runner-noop.adapter.ts
├── timeout-cancellable-runner.port.ts
├── timeout-runner-bare.adapter.ts
├── timeout-runner-monitor.adapter.ts
├── timeout-runner-noop.adapter.ts
├── timeout-runner.port.ts
├── to-event-map.types.ts
├── translations.service.ts
├── uptime.service.ts
├── uuid.vo.ts
├── visitor-id-client.strategy.ts
├── visitor-id.strategy.ts
├── weak-etag-extractor.middleware.ts
├── woodchopper-diagnostics-collecting.strategy.ts
├── woodchopper-diagnostics-console-error.strategy.ts
├── woodchopper-diagnostics-noop.strategy.ts
├── woodchopper-diagnostics.strategy.ts
├── woodchopper-dispatcher-async.strategy.ts
├── woodchopper-dispatcher-noop.strategy.ts
├── woodchopper-dispatcher-sampling.strategy.ts
├── woodchopper-dispatcher-sync.strategy.ts
├── woodchopper-dispatcher.strategy.ts
├── woodchopper-sampling-every-nth.strategy.ts
├── woodchopper-sampling.strategy.ts
├── woodchopper-sink-collecting.strategy.ts
├── woodchopper-sink-noop.strategy.ts
├── woodchopper-sink-stderr-raw.strategy.ts
├── woodchopper-sink-stderr.strategy.ts
├── woodchopper-sink-stdout-human.strategy.ts
├── woodchopper-sink-stdout-raw.strategy.ts
├── woodchopper-sink-stdout.strategy.ts
├── woodchopper-sink.strategy.ts
├── woodchopper-stats.service.ts
└── woodchopper.ts
```

