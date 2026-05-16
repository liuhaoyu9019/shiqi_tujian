import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useBreedStore } from '@/stores/boxStore'
import './index.css'

// 应用启动时自动加载品种数据
useBreedStore.getState().loadBreeds()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
