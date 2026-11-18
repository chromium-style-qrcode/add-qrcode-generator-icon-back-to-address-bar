import { i18n } from '#i18n'

import { Input } from '@/src/components/ui/input'
import type { EventData, VCardData } from '@/src/lib/content-types'

export function VCardForm({
  data,
  onChange
}: {
  data: VCardData
  onChange: (d: VCardData) => void
}) {
  const set = (k: keyof VCardData) => (e: { target: { value: string } }) =>
    onChange({ ...data, [k]: e.target.value })

  return (
    <div className='flex flex-col gap-2'>
      <Input
        value={data.firstName}
        onChange={set('firstName')}
        placeholder={i18n.t('vcard_first_name')}
        aria-label={i18n.t('vcard_first_name')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.lastName}
        onChange={set('lastName')}
        placeholder={i18n.t('vcard_last_name')}
        aria-label={i18n.t('vcard_last_name')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.phone}
        onChange={set('phone')}
        placeholder={i18n.t('vcard_phone')}
        aria-label={i18n.t('vcard_phone')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.email}
        onChange={set('email')}
        placeholder={i18n.t('vcard_email')}
        aria-label={i18n.t('vcard_email')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.organization}
        onChange={set('organization')}
        placeholder={i18n.t('vcard_organization')}
        aria-label={i18n.t('vcard_organization')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
    </div>
  )
}

export function EventForm({
  data,
  onChange
}: {
  data: EventData
  onChange: (d: EventData) => void
}) {
  const set = (k: keyof EventData) => (e: { target: { value: string } }) =>
    onChange({ ...data, [k]: e.target.value })

  return (
    <div className='flex flex-col gap-2'>
      <Input
        value={data.title}
        onChange={set('title')}
        placeholder={i18n.t('event_title')}
        aria-label={i18n.t('event_title')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.start}
        onChange={set('start')}
        placeholder={i18n.t('event_start')}
        aria-label={i18n.t('event_start')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.end}
        onChange={set('end')}
        placeholder={i18n.t('event_end')}
        aria-label={i18n.t('event_end')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
      <Input
        value={data.location}
        onChange={set('location')}
        placeholder={i18n.t('event_location')}
        aria-label={i18n.t('event_location')}
        className='chromium-input text-sm transition-all focus:outline-none'
      />
    </div>
  )
}
