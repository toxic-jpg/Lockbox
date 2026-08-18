---
name: iOS signing for LockBox
description: The Expo source is cross-platform, but standalone iPhone installation requires Apple signing and provisioning.
---

LockBox can be developed and bundled for iOS without iOS-only UI modules, but an installable iPhone build still needs an Apple Developer account connected to EAS for certificates, provisioning, and device/TestFlight distribution.

**Why:** Apple does not allow arbitrary unsigned IPA installation on a normal iPhone.

**How to apply:** Treat iPhone source compatibility and iPhone distribution as separate milestones; configure the bundle identifier in app.json, then connect Apple credentials before running an iOS EAS build.