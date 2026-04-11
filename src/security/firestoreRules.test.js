import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const RULES_PATH = resolve(process.cwd(), 'firestore.rules')

function readRules() {
  return readFileSync(RULES_PATH, 'utf8')
}

describe('firestore.rules admin hardening', () => {
  it('blocks client-side self-assignment of admin role in users collection', () => {
    const rules = readRules()
    expect(rules).toContain("function clientRoleAllowed(role)")
    expect(rules).toContain("role in ['attendee', 'organizer', 'supplier']")
    expect(rules).toContain("!(request.resource.data.role == 'admin' && resource.data.role != 'admin')")
  })

  it('keeps admin-only access for moderation logs', () => {
    const rules = readRules()
    expect(rules).toContain('match /adminModerationLogs/{logId}')
    expect(rules).toContain('allow read, write: if isAdmin();')
  })
})
