// vCard and calendar event (vEvent) encoders. These produce the standard
// text payloads that a QR scanner app can import into contacts / calendars.

const escapeVCard = (value: string): string =>
  value.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n')

const escapeEvent = (value: string): string =>
  value.replace(/([\\;,])/g, '\\$1')

export interface VCardData {
  firstName: string
  lastName: string
  organization: string
  title: string
  phone: string
  email: string
  website: string
}

export const DEFAULT_VCARD: VCardData = {
  firstName: '',
  lastName: '',
  organization: '',
  title: '',
  phone: '',
  email: '',
  website: ''
}

export const buildVCard = (d: VCardData): string => {
  const name = [d.lastName, d.firstName].filter(Boolean).join(';')
  if (!name && !d.organization) return ''

  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (name) lines.push(`N:${escapeVCard(d.lastName)};${escapeVCard(d.firstName)};;;`)
  if (d.organization) lines.push(`ORG:${escapeVCard(d.organization)}`)
  if (d.title) lines.push(`TITLE:${escapeVCard(d.title)}`)
  if (d.phone) lines.push(`TEL:${escapeVCard(d.phone)}`)
  if (d.email) lines.push(`EMAIL:${escapeVCard(d.email)}`)
  if (d.website) lines.push(`URL:${escapeVCard(d.website)}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

export interface EventData {
  title: string
  location: string
  description: string
  start: string // YYYYMMDD or YYYYMMDDTHHMMSS (local)
  end: string
}

export const DEFAULT_EVENT: EventData = {
  title: '',
  location: '',
  description: '',
  start: '',
  end: ''
}

export const buildVEvent = (d: EventData): string => {
  if (!d.title || !d.start) return ''
  const lines = ['BEGIN:VEVENT']
  lines.push(`SUMMARY:${escapeEvent(d.title)}`)
  // Normalize user input to the basic iCalendar date/datetime forms.
  const dtstart = d.start.replace(/[-:]/g, '')
  lines.push(`DTSTART:${dtstart}`)
  if (d.end) lines.push(`DTEND:${d.end.replace(/[-:]/g, '')}`)
  if (d.location) lines.push(`LOCATION:${escapeEvent(d.location)}`)
  if (d.description) lines.push(`DESCRIPTION:${escapeEvent(d.description)}`)
  lines.push('END:VEVENT')
  return lines.join('\n')
}
