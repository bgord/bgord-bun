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
├── ab-assignment-composite.strategy.ts
├── ab-assignment-cookie.strategy.ts
├── ab-assignment-fixed.strategy.ts
├── ab-assignment-hash.strategy.ts
├── ab-assignment-header.strategy.ts
├── ab-assignment-query.strategy.ts
├── ab-assignment.strategy.ts
├── ab-hono-noop.middleware.ts
├── ab-hono.middleware.ts
├── ab-variant-selector.service.ts
├── ab-variant-weight.vo.ts
├── ab-variant.vo.ts
├── ab-variants.vo.ts
├── ab.middleware.ts
├── alert-channel-collecting.adapter.ts
├── alert-channel-composite.adapter.ts
├── alert-channel-mailer.adapter.ts
├── alert-channel-noop.adapter.ts
├── alert-channel-sms.adapter.ts
├── alert-channel-with-logger.adapter.ts
├── alert-channel-with-retry.adapter.ts
├── alert-channel-with-timeout.adapter.ts
├── alert-channel.builder.ts
├── alert-channel.port.ts
├── alert-message.vo.ts
├── antivirus-clamav.adapter.ts
├── antivirus-noop.adapter.ts
├── antivirus-with-logger.adapter.ts
├── antivirus-with-semaphore.adapter.ts
├── antivirus-with-timeout.adapter.ts
├── antivirus.builder.ts
├── antivirus.port.ts
├── api-version-hono.middleware.ts
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
├── build-info.vo.ts
├── cache-file.service.ts
├── cache-repository-node-cache.adapter.ts
├── cache-repository-noop.adapter.ts
├── cache-repository-redis.adapter.ts
├── cache-repository.port.ts
├── cache-resolver-simple.strategy.ts
├── cache-resolver.strategy.ts
├── cache-response-hono.middleware.ts
├── cache-response.middleware.ts
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
├── commit-sha-value.vo.ts
├── commit-sha.vo.ts
├── correlation-hono.middleware.ts
├── correlation-id.vo.ts
├── correlation-storage.service.ts
├── correlation.middleware.ts
├── cron-expression.vo.ts
├── cron-scheduler-croner.adapter.ts
├── cron-scheduler-noop.adapter.ts
├── cron-scheduler-with-logger.adapter.ts
├── cron-scheduler.adapter.ts
├── cron-scheduler.port.ts
├── cron-task-handler-bare.strategy.ts
├── cron-task-handler-noop.strategy.ts
├── cron-task-handler-with-logger.strategy.ts
├── cron-task-handler.strategy.ts
├── cron-task.vo.ts
├── crypto-aes-gcm.service.ts
├── crypto-key-provider-file.adapter.ts
├── crypto-key-provider-memory.adapter.ts
├── crypto-key-provider-noop.adapter.ts
├── crypto-key-provider-with-cache.adapter.ts
├── crypto-key-provider.port.ts
├── csv-stringifier-noop.adapter.ts
├── csv-stringifier.adapter.ts
├── csv-stringifier.port.ts
├── directory-ensurer-noop.adapter.ts
├── directory-ensurer.adapter.ts
├── directory-ensurer.port.ts
├── disk-space-checker-noop.adapter.ts
├── disk-space-checker-shell.adapter.ts
├── disk-space-checker.port.ts
├── dynamic-import.service.ts
├── encryption-aes-gcm.adapter.ts
├── encryption-iv.vo.ts
├── encryption-key-value.vo.ts
├── encryption-key.vo.ts
├── encryption-noop.adapter.ts
├── encryption.port.ts
├── environment-loader-encrypted.adapter.ts
├── environment-loader-noop.adapter.ts
├── environment-loader-process-safe.adapter.ts
├── environment-loader-process.adapter.ts
├── environment-loader.port.ts
├── etag-extractor-hono.middleware.ts
├── etag-extractor.middleware.ts
├── event-envelope.ts
├── event-finder-noop.adapter.ts
├── event-finder.port.ts
├── event-inserter-noop.adapter.ts
├── event-inserter.port.ts
├── event-loop-lag.service.ts
├── event-loop-utilization.service.ts
├── event-revision-assigner.adapter.ts
├── event-revision-assigner.port.ts
├── event-store-collecting.adapter.ts
├── event-store-dispatching.adapter.ts
├── event-store-noop.adapter.ts
├── event-store-with-logger.adapter.ts
├── event-store.adapter.ts
├── event-store.port.ts
├── event-stream.vo.ts
├── event-upcaster-chain.adapter.ts
├── event-upcaster-noop.adapter.ts
├── event-upcaster-step.vo.ts
├── event-upcaster.port.ts
├── event-validator-registry.adapter.ts
├── event-validator-registry.port.ts
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
├── file-uploader-hono.middleware.ts
├── file-uploader.middleware.ts
├── file-writer-forgiving.adapter.ts
├── file-writer-noop.adapter.ts
├── file-writer.adapter.ts
├── file-writer.port.ts
├── fnv1a32.service.ts
├── graceful-shutdown.service.ts
├── gzip-noop.adapter.ts
├── gzip.adapter.ts
├── gzip.port.ts
├── handler-bare.strategy.ts
├── handler-hono.port.ts
├── handler-noop.strategy.ts
├── handler-with-logger.strategy.ts
├── handler.strategy.ts
├── hash-bucket.vo.ts
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
├── healthcheck-hono.handler.ts
├── healthcheck.handler.ts
├── http-logger-hono.middleware.ts
├── http-logger.middleware.ts
├── i18n.service.ts
├── id-provider-crypto.adapter.ts
├── id-provider-deterministic.adapter.ts
├── id-provider.port.ts
├── image-alpha-noop.adapter.ts
├── image-alpha-sharp.adapter.ts
├── image-alpha-with-semaphore.adapter.ts
├── image-alpha.port.ts
├── image-blur-noop.adapter.ts
├── image-blur-sharp.adapter.ts
├── image-blur-with-semaphore.adapter.ts
├── image-blur.port.ts
├── image-compressor-noop.adapter.ts
├── image-compressor-sharp.adapter.ts
├── image-compressor-with-semaphore.adapter.ts
├── image-compressor.port.ts
├── image-exif-clear-noop.adapter.ts
├── image-exif-clear-sharp.adapter.ts
├── image-exif-clear-with-semaphore.adapter.ts
├── image-exif-clear.port.ts
├── image-formatter-noop.adapter.ts
├── image-formatter-sharp.adapter.ts
├── image-formatter-with-semaphore.adapter.ts
├── image-formatter.port.ts
├── image-grayscale-noop.adapter.ts
├── image-grayscale-sharp.adapter.ts
├── image-grayscale-with-semaphore.adapter.ts
├── image-grayscale.port.ts
├── image-info-noop.adapter.ts
├── image-info-sharp.adapter.ts
├── image-info-with-semaphore.adapter.ts
├── image-info.port.ts
├── image-processor-noop.adapter.ts
├── image-processor-sharp.adapter.ts
├── image-processor-with-semaphore.adapter.ts
├── image-processor.port.ts
├── image-resizer-noop.adapter.ts
├── image-resizer-sharp.adapter.ts
├── image-resizer-with-semaphore.adapter.ts
├── image-resizer.port.ts
├── in-flight-requests-hono.middleware.ts
├── in-flight-requests-tracker.service.ts
├── in-flight-requests.middleware.ts
├── instrumentation.service.ts
├── invariant-error-handler.service.ts
├── invariant.service.ts
├── job-claimer-noop.adapter.ts
├── job-claimer-sqlite.adapter.ts
├── job-claimer.port.ts
├── job-completer-collecting.adapter.ts
├── job-completer-noop.adapter.ts
├── job-completer-sqlite.adapter.ts
├── job-completer.port.ts
├── job-enqueuer-collecting.adapter.ts
├── job-enqueuer-noop.adapter.ts
├── job-enqueuer-sqlite.adapter.ts
├── job-enqueuer.port.ts
├── job-envelope.ts
├── job-failer-collecting.adapter.ts
├── job-failer-noop.adapter.ts
├── job-failer-sqlite.adapter.ts
├── job-failer.port.ts
├── job-queue-noop.adapter.ts
├── job-queue-sqlite-store.service.ts
├── job-queue-stats-provider-noop.adapter.ts
├── job-queue-stats-provider-sqlite.adapter.ts
├── job-queue-stats-provider.port.ts
├── job-queue-with-logger.adapter.ts
├── job-queue.adapter.ts
├── job-queue.port.ts
├── job-registry.adapter.ts
├── job-registry.port.ts
├── job-requeuer-collecting.adapter.ts
├── job-requeuer-noop.adapter.ts
├── job-requeuer-sqlite.adapter.ts
├── job-requeuer.port.ts
├── job-retry-policy-backoff.strategy.ts
├── job-retry-policy-composite.strategy.ts
├── job-retry-policy-error-filter.strategy.ts
├── job-retry-policy-limit.strategy.ts
├── job-retry-policy-noop.strategy.ts
├── job-retry-policy.strategy.ts
├── job-worker.service.ts
├── job.types.ts
├── language-detector-cookie.strategy.ts
├── language-detector-header.strategy.ts
├── language-detector-hono.middleware.ts
├── language-detector-query.strategy.ts
├── language-detector.middleware.ts
├── language-detector.strategy.ts
├── languages.vo.ts
├── liveness-hono.handler.ts
├── liveness.handler.ts
├── logger-collecting.adapter.ts
├── logger-noop.adapter.ts
├── logger-stats-provider-noop.adapter.ts
├── logger-stats-provider.port.ts
├── logger.port.ts
├── mailer-collecting.adapter.ts
├── mailer-content-html.vo.ts
├── mailer-noop.adapter.ts
├── mailer-resend.adapter.ts
├── mailer-smtp.adapter.ts
├── mailer-subject.vo.ts
├── mailer-template.vo.ts
├── mailer-with-logger.adapter.ts
├── mailer-with-retry.adapter.ts
├── mailer-with-timeout.adapter.ts
├── mailer.builder.ts
├── mailer.port.ts
├── markdown-generator-noop.adapter.ts
├── markdown-generator.adapter.ts
├── markdown-generator.port.ts
├── memory-consumption.service.ts
├── message-bus-collecting.adapter.ts
├── message-bus-emittery.adapter.ts
├── message-bus-noop.adapter.ts
├── message-bus-with-logger.adapter.ts
├── message-bus.port.ts
├── message.types.ts
├── middleware-hono-noop.adapter.ts
├── middleware-hono.port.ts
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
│   │   └── ports
│   │       ├── user-language-query.ts
│   │       └── user-language-resolver.ts
│   └── system
│       ├── cron-tasks
│       │   ├── passage-of-time-hourly.ts
│       │   └── passage-of-time-minute.ts
│       ├── events
│       │   ├── HOUR_HAS_PASSED_EVENT.ts
│       │   ├── MINUTE_HAS_PASSED_EVENT.ts
│       │   ├── SECURITY_VIOLATION_DETECTED_EVENT.ts
├── node-env.vo.ts
├── nonce-provider-crypto.adapter.ts
├── nonce-provider-deterministic.adapter.ts
├── nonce-provider-noop.adapter.ts
├── nonce-provider.port.ts
├── nonce-value.vo.ts
├── payload-serializer-collecting.adapter.ts
├── payload-serializer-json.adapter.ts
├── payload-serializer.port.ts
├── pdf-generator-noop.adapter.ts
├── pdf-generator-with-logger.adapter.ts
├── pdf-generator.port.ts
├── port.vo.ts
├── prerequisite-runner-startup.service.ts
├── prerequisite-verifier-binary.adapter.ts
├── prerequisite-verifier-bun.adapter.ts
├── prerequisite-verifier-clock-drift.adapter.ts
├── prerequisite-verifier-cron-scheduler.adapter.ts
├── prerequisite-verifier-directory.adapter.ts
├── prerequisite-verifier-dns.adapter.ts
├── prerequisite-verifier-external-api.adapter.ts
├── prerequisite-verifier-file.adapter.ts
├── prerequisite-verifier-mailer.adapter.ts
├── prerequisite-verifier-memory.adapter.ts
├── prerequisite-verifier-node.adapter.ts
├── prerequisite-verifier-os.adapter.ts
├── prerequisite-verifier-outside-connectivity.adapter.ts
├── prerequisite-verifier-port.adapter.ts
├── prerequisite-verifier-ram.adapter.ts
├── prerequisite-verifier-running-user.adapter.ts
├── prerequisite-verifier-self.adapter.ts
├── prerequisite-verifier-sms.adapter.ts
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
├── randomness-crypto.strategy.ts
├── randomness-math.strategy.ts
├── randomness-noop.strategy.ts
├── randomness.strategy.ts
├── reactive-config-file-json.adapter.ts
├── reactive-config-noop.adapter.ts
├── reactive-config-with-cache.adapter.ts
├── reactive-config-with-fallback.adapter.ts
├── reactive-config.port.ts
├── readiness-hono.handler.ts
├── readiness.handler.ts
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
├── remote-file-storage-with-logger.adapter.ts
├── remote-file-storage.port.ts
├── request-context-hono.adapter.ts
├── request-context.port.ts
├── retry-backoff-exponential.strategy.ts
├── retry-backoff-jitter.strategy.ts
├── retry-backoff-linear.strategy.ts
├── retry-backoff-noop.strategy.ts
├── retry-backoff.strategy.ts
├── retry.service.ts
├── sealer-aes-gcm.adapter.ts
├── sealer-noop.adapter.ts
├── sealer.port.ts
├── secure-key-generator-crypto.adapter.ts
├── secure-key-generator-noop.adapter.ts
├── secure-key-generator.port.ts
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
├── semaphore.service.ts
├── setup-hono.service.ts
├── shield-api-key-hono.strategy.ts
├── shield-api-key.strategy.ts
├── shield-auth-hono.strategy.ts
├── shield-auth.strategy.ts
├── shield-basic-auth-hono.strategy.ts
├── shield-basic-auth.strategy.ts
├── shield-body-limit-hono.strategy.ts
├── shield-body-limit.strategy.ts
├── shield-csrf-hono.strategy.ts
├── shield-csrf.strategy.ts
├── shield-hcaptcha-hono-local.strategy.ts
├── shield-hcaptcha-hono.strategy.ts
├── shield-hcaptcha.strategy.ts
├── shield-ip-blacklist-hono.strategy.ts
├── shield-ip-blacklist.strategy.ts
├── shield-ip-whitelist-hono.strategy.ts
├── shield-ip-whitelist.strategy.ts
├── shield-maintenance-hono.strategy.ts
├── shield-maintenance.strategy.ts
├── shield-rate-limit-hono.strategy.ts
├── shield-rate-limit.strategy.ts
├── shield-recaptcha-hono.strategy.ts
├── shield-recaptcha.strategy.ts
├── shield-security-hono.strategy.ts
├── shield-security.strategy.ts
├── shield-timeout-hono.strategy.ts
├── shield-timeout.strategy.ts
├── simulated-error-hono.middleware.ts
├── simulated-error.middleware.ts
├── sleeper-noop.adapter.ts
├── sleeper-system.adapter.ts
├── sleeper.port.ts
├── slower-hono.middleware.ts
├── slower.middleware.ts
├── sms-collecting.adapter.ts
├── sms-noop.adapter.ts
├── sms-with-logger.adapter.ts
├── sms-with-retry.adapter.ts
├── sms-with-timeout.adapter.ts
├── sms.builder.ts
├── sms.port.ts
├── smtp-host.vo.ts
├── smtp-pass.vo.ts
├── smtp-port.vo.ts
├── smtp-user.vo.ts
├── sse-hono.handler.ts
├── sse-registry-collecting.adapter.ts
├── sse-registry-noop.adapter.ts
├── sse-registry-with-limit.adapter.ts
├── sse-registry-with-logger.adapter.ts
├── sse-registry.adapter.ts
├── sse-registry.port.ts
├── ssr-bun.service.ts
├── ssr.service.ts
├── static-files-hono.service.ts
├── stopwatch.service.ts
├── subject-application-resolver.vo.ts
├── subject-request-resolver.vo.ts
├── subject-segment-application.strategy.ts
├── subject-segment-build.strategy.ts
├── subject-segment-cookie.strategy.ts
├── subject-segment-env.strategy.ts
├── subject-segment-fixed.strategy.ts
├── subject-segment-header.strategy.ts
├── subject-segment-ip.strategy.ts
├── subject-segment-path.strategy.ts
├── subject-segment-query.strategy.ts
├── subject-segment-request.strategy.ts
├── subject-segment-user.strategy.ts
├── temporary-file-absolute.adapter.ts
├── temporary-file-noop.adapter.ts
├── temporary-file.port.ts
├── time-zone-offset-hono.middleware.ts
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
├── timing-hono.middleware.ts
├── timing.middleware.ts
├── trailing-slash-hono.middleware.ts
├── trailing-slash.middleware.ts
├── translations-hono.handler.ts
├── translations.handler.ts
├── uptime.service.ts
├── uuid.vo.ts
├── visitor-id-client.strategy.ts
├── visitor-id.strategy.ts
├── weak-etag-extractor-hono.middleware.ts
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
├── woodchopper-sampling-composite.strategy.ts
├── woodchopper-sampling-correlation-id.strategy.ts
├── woodchopper-sampling-every-nth.strategy.ts
├── woodchopper-sampling-pass-component.strategy.ts
├── woodchopper-sampling-pass-level.strategy.ts
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

