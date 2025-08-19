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
├── api-key-shield.middleware.ts
├── api-version.middleware.ts
├── auth-shield.middleware.ts
├── basic-auth.service.ts
├── better-auth-logger.service.ts
├── bots.vo.ts
├── build-info-repository.service.ts
├── cache-resolver.service.ts
├── cache-response.middleware.ts
├── cache-static-files.middleware.ts
├── captcha-hcaptcha-local.adapter.ts
├── captcha-hcaptcha.adapter.ts
├── captcha-noop.adapter.ts
├── captcha.port.ts
├── command-logger.service.ts
├── command.types.ts
├── context.middleware.ts
├── correlation-id.vo.ts
├── correlation-storage.service.ts
├── decorators.service.ts
├── dispatching-event-store.ts
├── encryption.service.ts
├── env-validator.service.ts
├── etag-extractor.middleware.ts
├── event-handler.service.ts
├── event-logger.service.ts
├── event-publisher.types.ts
├── event-store.ts
├── event-stream.vo.ts
├── event.types.ts
├── file-draft.service.ts
├── file-location.service.ts
├── file-uploader.middleware.ts
├── graceful-shutdown.service.ts
├── gzip.service.ts
├── healthcheck.service.ts
├── http-logger.middleware.ts
├── i18n.service.ts
├── image-compressor.service.ts
├── image-exif.service.ts
├── invariant-error-handler.service.ts
├── invariant.service.ts
├── jobs.service.ts
├── logger.service.ts
├── mailer-noop.adapter.ts
├── mailer-smtp-with-logger.adapter.ts
├── mailer-smtp.adapter.ts
├── mailer.port.ts
├── memory-consumption.service.ts
├── modules
│   └── history
│       ├── event-handlers
│       │   ├── onHistoryClearedEvent.ts
│       │   └── onHistoryPopulatedEvent.ts
│       ├── events
│       │   ├── HISTORY_CLEARED_EVENT.ts
│       │   ├── HISTORY_POPULATED_EVENT.ts
│       ├── ports
│       │   ├── history-projection.ts
│       ├── services
│       │   ├── history-writer.ts
│       └── value-objects
│           ├── history-id.ts
│           ├── history-operation.ts
│           ├── history-payload.ts
│           ├── history-subject.ts
│           ├── history.ts
├── node-cache-rate-limit-store.adapter.ts
├── node-env.vo.ts
├── open-graph.service.ts
├── path.vo.ts
├── port.vo.ts
├── prerequisites
│   ├── binary.ts
│   ├── bun.ts
│   ├── dependency-vulnerabilities.ts
│   ├── external-api.ts
│   ├── jobs.ts
│   ├── log-file.ts
│   ├── mailer.ts
│   ├── memory.ts
│   ├── node.ts
│   ├── outside-connectivity.ts
│   ├── path.ts
│   ├── port.ts
│   ├── ram.ts
│   ├── self.ts
│   ├── space.ts
│   ├── ssl-certificate-expiry.ts
│   ├── timezone-utc.ts
│   └── translations.ts
├── prerequisites.service.ts
├── rate-limit-shield.middleware.ts
├── rate-limit-store.port.ts
├── recaptcha-shield.middleware.ts
├── safe-parse-body.service.ts
├── setup.service.ts
├── simulated-error.middleware.ts
├── sitemap.service.ts
├── slower.middleware.ts
├── time-zone-offset.middleware.ts
├── to-event-map.types.ts
├── translations.service.ts
├── uptime.service.ts
├── url-wo-trailing-slash.vo.ts
├── uuid.vo.ts
├── weak-etag-extractor.middleware.ts
└── zip-draft.service.ts
```

