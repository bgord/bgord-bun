# bgord-bun

## Configuration:

Clone the repository

```
git clone git@github.com:bgord/journal.git --recurse-submodules
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
├── basic-auth-password.vo.ts
├── basic-auth-username.vo.ts
├── basic-auth.service.ts
├── better-auth-logger.service.ts
├── binary.vo.ts
├── bots.vo.ts
├── build-info-repository.service.ts
├── cache-file.service.ts
├── cache-resolver.service.ts
├── cache-response.middleware.ts
├── certificate-inspector-noop.adapter.ts
├── certificate-inspector-tls.adapter.ts
├── certificate-inspector.port.ts
├── checksum.service.ts
├── client-from-hono.adapter.ts
├── client.vo.ts
├── clock-fixed.adapter.ts
├── clock-system.adapter.ts
├── clock.port.ts
├── command-envelope.ts
├── command-logger.service.ts
├── command.types.ts
├── content-hash-noop.adapter.ts
├── content-hash-sha256-bun.adapter.ts
├── content-hash.port.ts
├── context.middleware.ts
├── correlation-id.vo.ts
├── correlation-storage.service.ts
├── crypto-key-provider-env.adapter.ts
├── crypto-key-provider-noop.adapter.ts
├── crypto-key-provider.port.ts
├── csv-stringifier.adapter.ts
├── csv-stringifier.port.ts
├── decorators.service.ts
├── disk-space-checker-bun.adapter.ts
├── disk-space-checker-noop.adapter.ts
├── disk-space-checker.port.ts
├── dispatching-event-store.ts
├── encryption-bun.adapter.ts
├── encryption-iv.vo.ts
├── encryption-key.vo.ts
├── encryption-noop.adapter.ts
├── encryption.port.ts
├── env-validator.service.ts
├── etag-extractor.middleware.ts
├── event-bus-like.types.ts
├── event-envelope.ts
├── event-handler.service.ts
├── event-logger.service.ts
├── event-publisher.types.ts
├── event-store-like.types.ts
├── event-store.ts
├── event-stream.vo.ts
├── event.types.ts
├── file-cleaner-bun-forgiving.adapter.ts
├── file-cleaner-bun.adapter.ts
├── file-cleaner-noop.adapter.ts
├── file-cleaner.port.ts
├── file-draft-zip.service.ts
├── file-draft.service.ts
├── file-hash-noop.adapter.ts
├── file-hash-sha256-bun.adapter.ts
├── file-hash.port.ts
├── file-renamer-fs-forgiving.adapter.ts
├── file-renamer-fs.adapter.ts
├── file-renamer-noop.adapter.ts
├── file-renamer.port.ts
├── file-uploader.middleware.ts
├── graceful-shutdown.service.ts
├── gzip-bun.adapter.ts
├── gzip-noop.adapter.ts
├── gzip-stream.adapter.ts
├── gzip.port.ts
├── hcaptcha-secret-key.vo.ts
├── hcaptcha-site-key.vo.ts
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
├── invariant-error-handler.service.ts
├── invariant.service.ts
├── jobs.service.ts
├── json-file-reader-bun-forgiving.adapter.ts
├── json-file-reader-bun.adapter.ts
├── json-file-reader-noop.adapter.ts
├── json-file-reader.port.ts
├── logger-format-error.service.ts
├── logger-noop.adapter.ts
├── logger-winston-local.adapter.ts
├── logger-winston-production.adapter.ts
├── logger-winston.adapter.ts
├── logger.port.ts
├── mailer-noop.adapter.ts
├── mailer-smtp-with-logger.adapter.ts
├── mailer-smtp.adapter.ts
├── mailer.port.ts
├── mailer.vo.ts
├── markdown-generator-noop.adapter.ts
├── markdown-generator.port.ts
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
│   └── preferences
│       ├── command-handlers
│       │   ├── handleSetUserLanguageCommand.ts
│       ├── commands
│       │   ├── SET_USER_LANGUAGE_COMMAND.ts
│       ├── events
│       │   ├── USER_LANGUAGE_SET_EVENT.ts
│       ├── invariants
│       │   └── user-language-has-changed.ts
│       ├── open-host-queries
│       │   └── user-language.ts
│       ├── ports
│       │   ├── user-language-query.ts
│       │   └── user-language-resolver.ts
│       └── value-objects
│           └── supported-languages-set.ts
├── node-env.vo.ts
├── pdf-generator-noop.adapter.ts
├── pdf-generator.port.ts
├── port.vo.ts
├── prerequisites
│   ├── binary.ts
│   ├── bun.ts
│   ├── clock-drift.ts
│   ├── dependency-vulnerabilities.ts
│   ├── directory.ts
│   ├── dns.ts
│   ├── external-api.ts
│   ├── jobs.ts
│   ├── log-file.ts
│   ├── mailer.ts
│   ├── memory.ts
│   ├── node.ts
│   ├── os.ts
│   ├── outside-connectivity.ts
│   ├── port.ts
│   ├── ram.ts
│   ├── running-user.ts
│   ├── self.ts
│   ├── space.ts
│   ├── sqlite.ts
│   ├── ssl-certificate-expiry.ts
│   ├── timezone-utc.ts
│   └── translations.ts
├── prerequisites.service.ts
├── rate-limit-store-node-cache.adapter.ts
├── rate-limit-store.port.ts
├── recaptcha-secret-key.vo.ts
├── recaptcha-site-key.vo.ts
├── redactor-compact-array.adapter.ts
├── redactor-compact-object.adapter.ts
├── redactor-composite.adapter.ts
├── redactor-encrypt.adapter.ts
├── redactor-mask.adapter.ts
├── redactor-noop.adapter.ts
├── redactor.port.ts
├── remote-file-storage-disk.adapter.ts
├── remote-file-storage-noop.adapter.ts
├── remote-file-storage.port.ts
├── safe-parse-body.service.ts
├── secret-manager-noop.adapter.ts
├── secret-manager.port.ts
├── secret.vo.ts
├── setup.service.ts
├── shield-api-key.middleware.ts
├── shield-auth.middleware.ts
├── shield-captcha-hcaptcha-local.adapter.ts
├── shield-captcha-hcaptcha.adapter.ts
├── shield-captcha-noop.adapter.ts
├── shield-captcha-recaptcha.adapter.ts
├── shield-captcha.port.ts
├── shield-rate-limit.middleware.ts
├── simulated-error.middleware.ts
├── slower.middleware.ts
├── static-files.service.ts
├── temporary-file-absolute.adapter.ts
├── temporary-file-noop.adapter.ts
├── temporary-file.port.ts
├── time-zone-offset.middleware.ts
├── timekeeper-google.adapter.ts
├── timekeeper-noop.adapter.ts
├── timekeeper.port.ts
├── timeout.service.ts
├── to-event-map.types.ts
├── translations.service.ts
├── uptime.service.ts
├── uuid.vo.ts
├── visitor-id-hash-hono.adapter.ts
├── visitor-id-hash.adapter.ts
├── visitor-id.port.ts
└── weak-etag-extractor.middleware.ts
```

