import React from 'react'

export function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>TravelGuide</h1>
      <p>しおり生成アプリ（MVPスキャフォールド）</p>
      <ul>
        <li>画像/動画アップロード</li>
        <li>EXIF抽出・確認</li>
        <li>入力フォーム（メンバー/宿泊/エピソード）</li>
        <li>生成ジョブ実行と進捗</li>
        <li>PDFダウンロード</li>
      </ul>
    </div>
  )
}

