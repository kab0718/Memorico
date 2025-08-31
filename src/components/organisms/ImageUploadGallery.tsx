import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Group, Image, SimpleGrid, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { UploadDropzone } from '../molecules/UploadDropzone'
import { extractBasicExif, formatDateTime, BasicExif } from '../../utils/exif'

interface Props {
  accept?: string[]
  maxSize?: number
  onChange?: (files: File[]) => void
}

export function ImageUploadGallery({
  accept = ['image/*'],
  maxSize = 50 * 1024 * 1024,
  onChange,
}: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [exifMap, setExifMap] = useState<
    Record<string, { status: 'pending' | 'ok' | 'error'; exif?: BasicExif }>
  >({})

  const fileKey = (f: File) => `${f.name}__${f.type}__${f.size}__${f.lastModified}`

  const handleAdd = (added: File[]) => {
    if (!added?.length) return
    const onlyImages = added.filter((f) => f.type.startsWith('image/'))
    const existing = new Set(files.map(fileKey))
    const unique: File[] = []
    let skipped = 0
    for (const f of onlyImages) {
      const key = fileKey(f)
      if (existing.has(key)) {
        skipped += 1
        continue
      }
      existing.add(key)
      unique.push(f)
    }
    if (unique.length > 0) {
      setFiles((prev) => {
        const next = [...prev, ...unique]
        onChange?.(next)
        return next
      })
    }
    if (skipped > 0) {
      notifications.show({ color: 'yellow', title: '重複をスキップ', message: `${skipped}件` })
    }
  }

  const removeByKey = (key: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => fileKey(f) !== key)
      onChange?.(next)
      return next
    })
    setExifMap((prev) => {
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }

  const clearAll = () => {
    setFiles([])
    setExifMap({})
    onChange?.([])
  }

  useEffect(() => {
    const run = async () => {
      for (const f of files) {
        const key = fileKey(f)
        if (exifMap[key]) continue
        setExifMap((prev) => ({ ...prev, [key]: { status: 'pending' } }))
        try {
          const exif = await extractBasicExif(f)
          setExifMap((prev) => ({ ...prev, [key]: { status: 'ok', exif } }))
        } catch {
          setExifMap((prev) => ({ ...prev, [key]: { status: 'error' } }))
        }
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files])

  const previews = useMemo(
    () =>
      files.map((file, idx) => {
        const url = URL.createObjectURL(file)
        const key = fileKey(file)
        const exifState = exifMap[key]
        const exif = exifState?.exif
        return (
          <Card key={`${file.name}-${idx}`} withBorder padding="xs">
            <Image src={url} alt={file.name} h={160} fit="cover" radius="sm" />
            <Text size="sm" mt={6} lineClamp={2}>
              {file.name}
            </Text>
            {exifState?.status === 'pending' && (
              <Text size="xs" c="dimmed" mt={4}>
                EXIF解析中…
              </Text>
            )}
            {exifState?.status === 'ok' && exif && (
              <>
                <Text size="xs" mt={4}>
                  撮影日時: {formatDateTime(exif.date) || '不明'}
                  <br />
                  位置:{' '}
                  {formatLatLng(exif.latitude, exif.longitude) || '不明'}
                </Text>
              </>
            )}
            {exifState?.status === 'error' && (
              <Text size="xs" c="red" mt={4}>
                EXIF解析失敗
              </Text>
            )}
            <Group justify="flex-end" mt={6}>
              <Button size="xs" variant="light" color="red" onClick={() => removeByKey(key)}>
                削除
              </Button>
            </Group>
          </Card>
        )
      }),
    [files, exifMap]
  )

  return (
    <Stack gap="sm">
      <UploadDropzone onFilesAdded={handleAdd} accept={accept} maxSize={maxSize} />
      {files.length > 0 && (
        <>
          <Group justify="space-between">
            <Text fw={600}>選択済みファイル（{files.length}）</Text>
            <Button variant="light" color="red" size="xs" onClick={clearAll}>
              クリア
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>{previews}</SimpleGrid>
        </>
      )}
    </Stack>
  )
}

function formatLatLng(lat?: number, lng?: number) {
  if (lat == null || lng == null) return undefined
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
