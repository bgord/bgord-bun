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
├── basic-auth.service.ts
├── better-auth-logger.service.ts
├── bots.vo.ts
├── build-info-repository.service.ts
├── cache-file.service.ts
├── cache-resolver.service.ts
├── cache-response.middleware.ts
├── client-from-hono.adapter.ts
├── client.vo.ts
├── clock-fixed.adapter.ts
├── clock-system.adapter.ts
├── clock.port.ts
├── command-envelope.ts
├── command-logger.service.ts
├── command.types.ts
├── context.middleware.ts
├── correlation-id.vo.ts
├── correlation-storage.service.ts
├── csv-stringifier.adapter.ts
├── csv-stringifier.port.ts
├── decorators.service.ts
├── dispatching-event-store.ts
├── encryption.service.ts
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
├── file-draft-zip.service.ts
├── file-draft.service.ts
├── file-hash-noop.adapter.ts
├── file-hash-sha256-bun.adapter.ts
├── file-hash.port.ts
├── file-uploader.middleware.ts
├── graceful-shutdown.service.ts
├── gzip.service.ts
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
├── logger-format-error.service.ts
├── logger-noop.adapter.ts
├── logger-simplify.service.ts
├── logger-winston-local.adapter.ts
├── logger-winston-production.adapter.ts
├── logger-winston.adapter.ts
├── logger.port.ts
├── mailer-noop.adapter.ts
├── mailer-smtp-with-logger.adapter.ts
├── mailer-smtp.adapter.ts
├── mailer.port.ts
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
│   │   │   ├── history-writer.ts
│   │   └── value-objects
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
├── open-graph.service.ts
├── pdf-generator-noop.adapter.ts
├── pdf-generator.port.ts
├── port.vo.ts
├── prerequisites
│   ├── binary.ts
│   ├── bun.ts
│   ├── dependency-vulnerabilities.ts
│   ├── directory.ts
│   ├── external-api.ts
│   ├── jobs.ts
│   ├── log-file.ts
│   ├── mailer.ts
│   ├── memory.ts
│   ├── node.ts
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
├── remote-file-storage-disk.adapter.ts
├── remote-file-storage-noop.adapter.ts
├── remote-file-storage.port.ts
├── safe-parse-body.service.ts
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
├── sitemap.service.ts
├── slower.middleware.ts
├── temporary-file-absolute.adapter.ts
├── temporary-file-noop.adapter.ts
├── temporary-file.port.ts
├── time-zone-offset.middleware.ts
├── to-event-map.types.ts
├── translations.service.ts
├── uptime.service.ts
├── url-wo-trailing-slash.vo.ts
├── uuid.vo.ts
├── visitor-id-hash-hono.adapter.ts
├── visitor-id-hash.adapter.ts
├── visitor-id.port.ts
└── weak-etag-extractor.middleware.ts
```

